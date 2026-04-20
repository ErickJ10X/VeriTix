import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { STRIPE_CLIENT } from '../src/modules/stripe/stripe.module';

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const suffix = Date.now();
  const ADMIN_EMAIL = 'admin@veritix.app';
  const ADMIN_PASSWORD = 'Admin1234!';

  const buyerEmail = `e2e-orders-buyer-${suffix}@test.com`;
  const buyerPhone = `+5255${suffix.toString().slice(-8)}`;

  const buyer2Email = `e2e-orders-buyer2-${suffix}@test.com`;
  const buyer2Phone = `+5253${suffix.toString().slice(-8)}`;

  let adminToken: string;
  let buyerToken: string;
  let buyerId: string;
  let buyer2Token: string;

  let creatorId: string;
  let venueId: string;
  let eventId: string;
  let ticketTypeId: string;
  let orderId: string;

  const mockStripe = {
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'cs_test_mock_session',
          url: 'https://checkout.stripe.com/pay/cs_test_mock',
        }),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
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

    // Login admin
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200);
    adminToken = adminLogin.body.accessToken as string;

    // Register buyer
    const buyerReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: buyerEmail, password: 'Buyer1234!', name: 'Buyer', lastName: 'Orders', phone: buyerPhone })
      .expect(201);
    buyerToken = buyerReg.body.accessToken as string;
    buyerId = buyerReg.body.user.id as string;

    // Register a second buyer (for access control tests)
    const buyer2Reg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: buyer2Email, password: 'Buyer1234!', name: 'Buyer2', lastName: 'Orders', phone: buyer2Phone })
      .expect(201);
    buyer2Token = buyer2Reg.body.accessToken as string;

    // Create a CREATOR user via prisma (for event ownership + findByEvent test)
    const creator = await prisma.user.create({
      data: {
        email: `e2e-orders-creator-${suffix}@test.com`,
        phone: `+5252${suffix.toString().slice(-8)}`,
        password: 'hash',
        name: 'Creator',
        lastName: 'Orders',
        role: 'CREATOR',
      },
    });
    creatorId = creator.id;

    // Create venue, event (PUBLISHED), ticketType via prisma
    const venue = await prisma.venue.create({
      data: {
        name: `Venue-Orders-${suffix}`,
        slug: `venue-orders-${suffix}`,
        address: 'Test St 1',
        city: 'OrdersCity',
        country: 'MX',
      },
    });
    venueId = venue.id;

    const event = await prisma.event.create({
      data: {
        name: `Event-Orders-${suffix}`,
        eventDate: new Date('2099-12-01T20:00:00Z'),
        maxCapacity: 500,
        status: 'PUBLISHED',
        creatorId,
        venueId,
      },
    });
    eventId = event.id;

    const ticketType = await prisma.ticketType.create({
      data: {
        name: 'General',
        price: 500,
        totalQuantity: 100,
        availableQuantity: 100,
        maxPerUser: 10,
        eventId,
      },
    });
    ticketTypeId = ticketType.id;
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { eventId } });
    await prisma.payment.deleteMany({ where: { order: { eventId } } });
    await prisma.order.deleteMany({ where: { eventId } });
    await prisma.event.deleteMany({ where: { id: eventId } }); // cascades ticketTypes
    await prisma.venue.deleteMany({ where: { id: venueId } });
    await prisma.refreshToken.deleteMany({ where: { user: { email: { startsWith: 'e2e-orders-' } } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: 'e2e-orders-' } } });
    await app.close();
  });

  // ── POST /api/v1/orders ────────────────────────────────────────────────────

  describe('POST /api/v1/orders', () => {
    it('1. 201 — buyer creates order, receives checkoutUrl', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          eventId,
          items: [{ ticketTypeId, quantity: 1 }],
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('PENDING');
      expect(res.body).toHaveProperty('checkoutUrl');
      expect(res.body.checkoutUrl).toBe('https://checkout.stripe.com/pay/cs_test_mock');
      expect(res.body.event.id).toBe(eventId);
      expect(res.body.items).toHaveLength(1);
      orderId = res.body.id as string;
    });

    it('2. 401 — unauthenticated cannot create order', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({ eventId, items: [{ ticketTypeId, quantity: 1 }] })
        .expect(401);
    });

    it('3. 422 — exceeds maxPerUser', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ eventId, items: [{ ticketTypeId, quantity: 11 }] })
        .expect(422);
    });

    it('4. 400 — event not PUBLISHED (DRAFT event)', async () => {
      // Create a DRAFT event to test the 400 case
      const draftEvent = await prisma.event.create({
        data: {
          name: `Draft-${suffix}`,
          eventDate: new Date('2099-12-01T20:00:00Z'),
          maxCapacity: 100,
          creatorId,
          venueId,
        },
      });
      const draftTT = await prisma.ticketType.create({
        data: { name: 'Draft TT', price: 100, totalQuantity: 10, availableQuantity: 10, maxPerUser: 5, eventId: draftEvent.id },
      });

      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ eventId: draftEvent.id, items: [{ ticketTypeId: draftTT.id, quantity: 1 }] })
        .expect(400);

      // cleanup draft event
      await prisma.event.delete({ where: { id: draftEvent.id } });
    });

    it('5. 404 — non-existent eventId', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ eventId: '00000000-0000-0000-0000-000000000000', items: [{ ticketTypeId, quantity: 1 }] })
        .expect(404);
    });
  });

  // ── GET /api/v1/orders/my ─────────────────────────────────────────────────

  describe('GET /api/v1/orders/my', () => {
    it('6. 200 — buyer sees their own orders', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/orders/my')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.data)).toBe(true);
      const inList = (res.body.data as Array<{ id: string }>).some(o => o.id === orderId);
      expect(inList).toBe(true);
    });

    it('7. 200 — buyer2 sees empty orders (isolation)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/orders/my')
        .set('Authorization', `Bearer ${buyer2Token}`)
        .expect(200);

      expect(res.body.meta.total).toBe(0);
      expect(res.body.data).toHaveLength(0);
    });

    it('8. 401 — unauthenticated', async () => {
      await request(app.getHttpServer()).get('/api/v1/orders/my').expect(401);
    });
  });

  // ── GET /api/v1/orders/:id ────────────────────────────────────────────────

  describe('GET /api/v1/orders/:id', () => {
    it('9. 200 — owner can see their order detail', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.id).toBe(orderId);
      expect(res.body.event.id).toBe(eventId);
      expect(res.body.items).toHaveLength(1);
      expect(res.body).toHaveProperty('payments');
    });

    it('10. 200 — admin can see any order', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.id).toBe(orderId);
    });

    it('11. 403 — buyer2 cannot see buyer1\'s order', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${buyer2Token}`)
        .expect(403);
    });

    it('12. 404 — non-existent order', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/orders/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(404);
    });
  });

  // ── PATCH /api/v1/orders/:id/cancel ──────────────────────────────────────

  describe('PATCH /api/v1/orders/:id/cancel', () => {
    it('13. 204 — owner cancels their PENDING order', async () => {
      // Create a fresh order for this cancel test
      const cancelRes = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ eventId, items: [{ ticketTypeId, quantity: 1 }] })
        .expect(201);

      const cancelOrderId = cancelRes.body.id as string;

      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${cancelOrderId}/cancel`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(204);
    });

    it('14. 403 — buyer2 cannot cancel buyer1\'s order', async () => {
      // Create another order for buyer
      const newOrder = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ eventId, items: [{ ticketTypeId, quantity: 1 }] })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${newOrder.body.id}/cancel`)
        .set('Authorization', `Bearer ${buyer2Token}`)
        .expect(403);
    });

    it('15. 400 — cannot cancel non-PENDING order', async () => {
      // Update orderId to COMPLETED via prisma, then try to cancel
      await prisma.order.update({ where: { id: orderId }, data: { status: 'COMPLETED' } });

      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(400);

      // Reset back to PENDING
      await prisma.order.update({ where: { id: orderId }, data: { status: 'PENDING' } });
    });
  });

  // ── GET /api/v1/orders/event/:eventId ─────────────────────────────────────

  describe('GET /api/v1/orders/event/:eventId', () => {
    it('16. 200 — admin sees all orders for event', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/orders/event/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.meta.total).toBeGreaterThan(0);
    });

    it('17. 403 — buyer cannot see event orders', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orders/event/${eventId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });

    it('18. 404 — non-existent event', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/orders/event/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
