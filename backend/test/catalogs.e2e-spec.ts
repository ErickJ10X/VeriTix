import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

describe('Catalogs — Venues (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const suffix = Date.now();
  const ADMIN_EMAIL = 'admin@veritix.app';
  const ADMIN_PASSWORD = 'Admin1234!';

  const buyerEmail = `e2e-catalogs-buyer-${suffix}@test.com`;
  const buyerPhone = `+5255${suffix.toString().slice(-8)}`;

  let adminToken: string;
  let buyerToken: string;
  let venueId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
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

    // Register buyer (for 403 tests)
    const buyerReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: buyerEmail, password: 'Buyer1234!', name: 'Buyer', lastName: 'Catalogs', phone: buyerPhone })
      .expect(201);
    buyerToken = buyerReg.body.accessToken as string;
  });

  afterAll(async () => {
    // Venues created in tests (cleanup by slug prefix)
    await prisma.venue.deleteMany({ where: { slug: { startsWith: `venue-e2e-${suffix}` } } });
    await prisma.refreshToken.deleteMany({ where: { user: { email: { startsWith: 'e2e-catalogs-' } } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: 'e2e-catalogs-' } } });
    await app.close();
  });

  // ── POST /api/v1/venues ────────────────────────────────────────────────────

  describe('POST /api/v1/venues', () => {
    it('1. 201 — admin creates venue', async () => {
      const slug = `venue-e2e-${suffix}-${uid()}`;
      const res = await request(app.getHttpServer())
        .post('/api/v1/venues')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Test Venue ${suffix}`,
          slug,
          address: 'Main St 1',
          city: 'TestCity',
          country: 'MX',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.slug).toBe(slug);
      expect(res.body.city).toBe('TestCity');
      venueId = res.body.id as string;
    });

    it('2. 409 — duplicate slug', async () => {
      const usedSlug = `venue-e2e-${suffix}-dup`;

      await request(app.getHttpServer())
        .post('/api/v1/venues')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Dup Venue', slug: usedSlug, address: 'Addr 1', city: 'City', country: 'MX' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/venues')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Dup Venue 2', slug: usedSlug, address: 'Addr 2', city: 'City', country: 'MX' })
        .expect(409);
    });

    it('3. 403 — buyer cannot create venue', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/venues')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ name: 'Buyer Venue', slug: `venue-buyer-${uid()}`, address: 'Addr', city: 'City', country: 'MX' })
        .expect(403);
    });

    it('4. 401 — unauthenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/venues')
        .send({ name: 'Anon Venue', slug: `venue-anon-${uid()}`, address: 'Addr', city: 'City', country: 'MX' })
        .expect(401);
    });

    it('5. 400 — missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/venues')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Incomplete Venue' })
        .expect(400);
    });
  });

  // ── GET /api/v1/venues ────────────────────────────────────────────────────

  describe('GET /api/v1/venues', () => {
    it('6. 200 — public listing returns paginated venues', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/venues')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('total');
    });

    it('7. 200 — no token required (public route)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/venues')
        .expect(200);
    });
  });

  // ── GET /api/v1/venues/:id ────────────────────────────────────────────────

  describe('GET /api/v1/venues/:id', () => {
    it('8. 200 — public can get venue by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/venues/${venueId}`)
        .expect(200);

      expect(res.body.id).toBe(venueId);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('slug');
    });

    it('9. 404 — non-existent venue', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/venues/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('10. 400 — invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/venues/not-a-uuid')
        .expect(400);
    });
  });

  // ── PATCH /api/v1/venues/:id ──────────────────────────────────────────────

  describe('PATCH /api/v1/venues/:id', () => {
    it('11. 200 — admin updates venue', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/venues/${venueId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ city: 'UpdatedCity' })
        .expect(200);

      expect(res.body.city).toBe('UpdatedCity');
      expect(res.body.id).toBe(venueId);
    });

    it('12. 403 — buyer cannot update venue', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/venues/${venueId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ city: 'Hacked' })
        .expect(403);
    });
  });

  // ── DELETE /api/v1/venues/:id ─────────────────────────────────────────────

  describe('DELETE /api/v1/venues/:id', () => {
    it('13. 403 — buyer cannot delete venue', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/venues/${venueId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });

    it('14. 204 — admin soft-deletes venue', async () => {
      // Create a throwaway venue to delete
      const slug = `venue-e2e-${suffix}-del`;
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/venues')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Delete Me', slug, address: 'Addr', city: 'City', country: 'MX' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/venues/${createRes.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });
  });
});
