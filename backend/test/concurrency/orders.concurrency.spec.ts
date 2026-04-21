import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { STRIPE_CLIENT } from '../../src/modules/stripe/stripe.module';

jest.setTimeout(60000);

async function registerVerifyLogin(
  app: INestApplication,
  prisma: PrismaService,
  data: { email: string; password: string; name: string; lastName: string; phone: string },
): Promise<{ token: string; userId: string }> {
  await request(app.getHttpServer()).post('/api/v1/auth/register').send(data).expect(201);
  await prisma.user.update({
    where: { email: data.email },
    data: { emailVerified: true, verificationToken: null, verificationTokenExp: null },
  });
  const loginRes = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: data.email, password: data.password })
    .expect(200);
  return { token: loginRes.body.accessToken as string, userId: loginRes.body.user.id as string };
}

describe('Orders — Concurrency', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const suffix = Date.now();

  let creatorId: string;
  let venueId: string;

  const mockStripe = {
    checkout: {
      sessions: {
        create: jest.fn().mockImplementation(() =>
          Promise.resolve({
            id: `cs_test_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            url: 'https://checkout.stripe.com/pay/cs_test_mock',
          }),
        ),
      },
    },
    webhooks: { constructEvent: jest.fn() },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(STRIPE_CLIENT)
      .useValue(mockStripe)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.use(cookieParser());
    await app.init();
    prisma = app.get(PrismaService);

    // Login admin (needed for role upgrades if any)
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@veritix.app', password: 'Admin1234!' })
      .expect(200);

    const creator = await prisma.user.create({
      data: {
        email: `e2e-concurrency-creator-${suffix}@test.com`,
        phone: `+5251${suffix.toString().slice(-8)}`,
        password: 'hash',
        name: 'Creator',
        lastName: 'Concurrency',
        role: 'CREATOR',
      },
    });
    creatorId = creator.id;

    const venue = await prisma.venue.create({
      data: {
        name: `Venue-Concurrency-${suffix}`,
        slug: `venue-concurrency-${suffix}`,
        address: 'Test St 1',
        city: 'ConcurrencyCity',
        country: 'MX',
      },
    });
    venueId = venue.id;
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({ where: { order: { event: { creatorId } } } });
    await prisma.order.deleteMany({ where: { event: { creatorId } } });
    await prisma.event.deleteMany({ where: { creatorId } });
    await prisma.venue.deleteMany({ where: { id: venueId } });
    await prisma.refreshToken.deleteMany({
      where: { user: { email: { startsWith: 'e2e-concurrency-' } } },
    });
    await prisma.user.deleteMany({ where: { email: { startsWith: 'e2e-concurrency-' } } });
    await app.close();
  }, 30000);

  // ── Scenario 1: Stock exhaustion ──────────────────────────────────────────
  // 10 different buyers race for the last ticket.
  // The DB must guarantee only 1 order is created — no overselling.

  describe('Scenario 1: stock=1, 10 concurrent buyers → exactly 1 succeeds', () => {
    let buyers: { token: string }[];
    let eventId: string;
    let ticketTypeId: string;

    beforeAll(async () => {
      // Register users sequentially to avoid saturating the test server's connection pool.
      // Concurrency happens only in the it() block when orders are fired simultaneously.
      buyers = [];
      for (let i = 0; i < 10; i++) {
        const buyer = await registerVerifyLogin(app, prisma, {
          email: `e2e-concurrency-s1-${i}-${suffix}@test.com`,
          phone: `+5255${i}${suffix.toString().slice(-7)}`,
          password: 'Buyer1234!',
          name: `Buyer${i}`,
          lastName: 'S1',
        });
        buyers.push(buyer);
      }

      const event = await prisma.event.create({
        data: {
          name: `Concurrency-S1-${suffix}`,
          eventDate: new Date('2099-12-01T20:00:00Z'),
          maxCapacity: 500,
          status: 'PUBLISHED',
          creatorId,
          venueId,
        },
      });
      eventId = event.id;

      const tt = await prisma.ticketType.create({
        data: {
          name: 'General',
          price: 100,
          totalQuantity: 1,
          availableQuantity: 1,
          maxPerUser: 1,
          eventId,
        },
      });
      ticketTypeId = tt.id;
    });

    it('only 1 of 10 concurrent requests succeeds, availableQuantity ends at 0', async () => {
      const results = await Promise.all(
        buyers.map(({ token }) =>
          request(app.getHttpServer())
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({ eventId, items: [{ ticketTypeId, quantity: 1 }] }),
        ),
      );

      const successes = results.filter((r) => r.status === 201);
      const stockErrors = results.filter((r) => r.status === 422);

      expect(successes).toHaveLength(1);
      expect(stockErrors).toHaveLength(9);

      const tt = await prisma.ticketType.findUnique({ where: { id: ticketTypeId } });
      expect(tt!.availableQuantity).toBe(0);
    });
  });

  // ── Scenario 2: Partial stock exhaustion ──────────────────────────────────
  // 5 tickets available, 10 buyers racing — exactly 5 should get through.

  describe('Scenario 2: stock=5, 10 concurrent buyers → exactly 5 succeed', () => {
    let buyers: { token: string }[];
    let eventId: string;
    let ticketTypeId: string;

    beforeAll(async () => {
      buyers = [];
      for (let i = 0; i < 10; i++) {
        const buyer = await registerVerifyLogin(app, prisma, {
          email: `e2e-concurrency-s2-${i}-${suffix}@test.com`,
          phone: `+5254${i}${suffix.toString().slice(-7)}`,
          password: 'Buyer1234!',
          name: `Buyer${i}`,
          lastName: 'S2',
        });
        buyers.push(buyer);
      }

      const event = await prisma.event.create({
        data: {
          name: `Concurrency-S2-${suffix}`,
          eventDate: new Date('2099-12-01T20:00:00Z'),
          maxCapacity: 500,
          status: 'PUBLISHED',
          creatorId,
          venueId,
        },
      });
      eventId = event.id;

      const tt = await prisma.ticketType.create({
        data: {
          name: 'General',
          price: 100,
          totalQuantity: 5,
          availableQuantity: 5,
          maxPerUser: 1,
          eventId,
        },
      });
      ticketTypeId = tt.id;
    });

    it('exactly 5 of 10 concurrent requests succeed, availableQuantity ends at 0', async () => {
      const results = await Promise.all(
        buyers.map(({ token }) =>
          request(app.getHttpServer())
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({ eventId, items: [{ ticketTypeId, quantity: 1 }] }),
        ),
      );

      const successes = results.filter((r) => r.status === 201);
      const stockErrors = results.filter((r) => r.status === 422);

      expect(successes).toHaveLength(5);
      expect(stockErrors).toHaveLength(5);

      const tt = await prisma.ticketType.findUnique({ where: { id: ticketTypeId } });
      expect(tt!.availableQuantity).toBe(0);
    });
  });

  // ── Scenario 3: Same buyer, parallel requests ─────────────────────────────
  // One buyer fires 3 simultaneous requests for the same ticket type (stock=1).
  // Only 1 should succeed regardless of who sends the requests.

  describe('Scenario 3: same buyer, 3 parallel orders, stock=1 → exactly 1 succeeds', () => {
    let buyerToken: string;
    let eventId: string;
    let ticketTypeId: string;

    beforeAll(async () => {
      const result = await registerVerifyLogin(app, prisma, {
        email: `e2e-concurrency-s3-${suffix}@test.com`,
        phone: `+5253${suffix.toString().slice(-8)}`,
        password: 'Buyer1234!',
        name: 'Buyer',
        lastName: 'S3',
      });
      buyerToken = result.token;

      const event = await prisma.event.create({
        data: {
          name: `Concurrency-S3-${suffix}`,
          eventDate: new Date('2099-12-01T20:00:00Z'),
          maxCapacity: 500,
          status: 'PUBLISHED',
          creatorId,
          venueId,
        },
      });
      eventId = event.id;

      const tt = await prisma.ticketType.create({
        data: {
          name: 'General',
          price: 100,
          totalQuantity: 1,
          availableQuantity: 1,
          maxPerUser: 3, // per-request limit is 3, so none fail on maxPerUser — only stock limits
          eventId,
        },
      });
      ticketTypeId = tt.id;
    });

    it('same buyer: only 1 of 3 parallel requests succeeds', async () => {
      const results = await Promise.all(
        Array.from({ length: 3 }, () =>
          request(app.getHttpServer())
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({ eventId, items: [{ ticketTypeId, quantity: 1 }] }),
        ),
      );

      const successes = results.filter((r) => r.status === 201);
      const stockErrors = results.filter((r) => r.status === 422);

      expect(successes).toHaveLength(1);
      expect(stockErrors).toHaveLength(2);

      const tt = await prisma.ticketType.findUnique({ where: { id: ticketTypeId } });
      expect(tt!.availableQuantity).toBe(0);
    });
  });

  // ── Scenario 4: Concurrent cancellations ─────────────────────────────────
  // Two simultaneous cancel requests for the same PENDING order.
  // Exactly 1 should succeed (204) and the other should fail (400).
  // The stock must be restored EXACTLY once — not twice.

  describe('Scenario 4: 2 concurrent cancel requests → exactly 1 succeeds, stock restored once', () => {
    let buyerToken: string;
    let orderId: string;
    let ticketTypeId: string;
    let eventId: string;

    beforeAll(async () => {
      const result = await registerVerifyLogin(app, prisma, {
        email: `e2e-concurrency-s4-${suffix}@test.com`,
        phone: `+5252${suffix.toString().slice(-8)}`,
        password: 'Buyer1234!',
        name: 'Buyer',
        lastName: 'S4',
      });
      buyerToken = result.token;

      const event = await prisma.event.create({
        data: {
          name: `Concurrency-S4-${suffix}`,
          eventDate: new Date('2099-12-01T20:00:00Z'),
          maxCapacity: 500,
          status: 'PUBLISHED',
          creatorId,
          venueId,
        },
      });
      eventId = event.id;

      const tt = await prisma.ticketType.create({
        data: {
          name: 'General',
          price: 100,
          totalQuantity: 10,
          availableQuantity: 10,
          maxPerUser: 5,
          eventId,
        },
      });
      ticketTypeId = tt.id;

      // Create a single PENDING order
      const orderRes = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ eventId, items: [{ ticketTypeId, quantity: 1 }] })
        .expect(201);
      orderId = orderRes.body.id as string;
    });

    it('only 1 of 2 concurrent cancels succeeds; stock is restored exactly once', async () => {
      const before = await prisma.ticketType.findUnique({ where: { id: ticketTypeId } });
      const stockBefore = before!.availableQuantity;

      const results = await Promise.all([
        request(app.getHttpServer())
          .patch(`/api/v1/orders/${orderId}/cancel`)
          .set('Authorization', `Bearer ${buyerToken}`),
        request(app.getHttpServer())
          .patch(`/api/v1/orders/${orderId}/cancel`)
          .set('Authorization', `Bearer ${buyerToken}`),
      ]);

      const successes = results.filter((r) => r.status === 204);
      const failures = results.filter((r) => r.status === 400);

      expect(successes).toHaveLength(1);
      expect(failures).toHaveLength(1);

      // Stock restored exactly once: stockBefore + 1 (not +2)
      const after = await prisma.ticketType.findUnique({ where: { id: ticketTypeId } });
      expect(after!.availableQuantity).toBe(stockBefore + 1);
    });
  });
});
