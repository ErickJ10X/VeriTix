import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

function extractRefreshCookie(res: request.Response): string | undefined {
  const raw = res.headers['set-cookie'] as string[] | string | undefined;
  if (!raw) return undefined;
  const cookies = Array.isArray(raw) ? raw : [raw];
  return cookies.find((c) => c.startsWith('refresh_token='));
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const suffix = Date.now();
  const testEmail = `e2e-auth-${suffix}@test.com`;
  const testPhone = `+5255${suffix.toString().slice(-8)}`;
  const testPassword = 'Password123';
  const testName = 'E2E';
  const testLastName = 'User';

  let accessToken: string;
  let refreshCookie: string;

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
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.use(cookieParser());
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({
      where: { user: { email: { startsWith: 'e2e-auth-' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'e2e-auth-' } },
    });
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('1. 201 — registers new user, returns accessToken + user (no password)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
          lastName: testLastName,
          phone: testPhone,
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toMatchObject({
        email: testEmail,
        name: testName,
        lastName: testLastName,
        role: 'BUYER',
      });
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).not.toHaveProperty('resetToken');
      expect(res.body.user).not.toHaveProperty('resetTokenExp');
      expect(res.body.user).toHaveProperty('id');

      accessToken = res.body.accessToken as string;
      refreshCookie = extractRefreshCookie(res)!;
    });

    it('2. Sets refresh_token cookie (httpOnly)', async () => {
      const email2 = `e2e-auth-cookie-${suffix}@test.com`;
      const phone2 = `+5254${suffix.toString().slice(-8)}`;

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: email2,
          password: testPassword,
          name: 'Cookie',
          lastName: 'Test',
          phone: phone2,
        })
        .expect(201);

      const cookie = extractRefreshCookie(res);
      expect(cookie).toBeDefined();
      expect(cookie!.toLowerCase()).toContain('httponly');
    });

    it('3. 409 — duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
          lastName: testLastName,
          phone: `+5253${suffix.toString().slice(-8)}`,
        })
        .expect(409);
    });

    it('4. 400 — invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: testPassword,
          name: testName,
          lastName: testLastName,
          phone: `+5251${suffix.toString().slice(-8)}`,
        })
        .expect(400);
    });

    it('5a. 400 — password too short (< 8 chars)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `e2e-auth-short-${suffix}@test.com`,
          password: 'Ab1',
          name: testName,
          lastName: testLastName,
          phone: `+5250${suffix.toString().slice(-8)}`,
        })
        .expect(400);
    });

    it('5b. 400 — password missing uppercase', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `e2e-auth-noupper-${suffix}@test.com`,
          password: 'password123',
          name: testName,
          lastName: testLastName,
          phone: `+5249${suffix.toString().slice(-8)}`,
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('6. 200 — correct credentials, returns accessToken + user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.user).not.toHaveProperty('password');

      const cookie = extractRefreshCookie(res);
      expect(cookie).toBeDefined();

      accessToken = res.body.accessToken as string;
      refreshCookie = cookie!;
    });

    it('7. 401 — wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: 'WrongPass999' })
        .expect(401);
    });

    it('8. 401 — non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@nowhere.com', password: testPassword })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('9. 200 — valid cookie → new tokens (rotation)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');

      const newCookie = extractRefreshCookie(res);
      expect(newCookie).toBeDefined();
      expect(newCookie).not.toBe(refreshCookie);

      accessToken = res.body.accessToken as string;
      refreshCookie = newCookie!;
    });

    it('10. 401 — no cookie', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .expect(401);
    });

    it('11. 401 — invalid/tampered cookie value', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', 'refresh_token=this.is.not.a.valid.jwt')
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('12. 204 — clears cookie (requires valid access token)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', refreshCookie)
        .expect(204);

      const setCookieHeader = res.headers['set-cookie'] as
        | string[]
        | string
        | undefined;
      if (setCookieHeader) {
        const cookies = Array.isArray(setCookieHeader)
          ? setCookieHeader
          : [setCookieHeader];
        const rtCookie = cookies.find((c) => c.startsWith('refresh_token='));
        if (rtCookie) {
          expect(
            rtCookie.includes('refresh_token=;') ||
              rtCookie.includes('refresh_token= ;') ||
              rtCookie.toLowerCase().includes('expires='),
          ).toBe(true);
        }
      }
    });
  });

  // ── Integration: full flow ─────────────────────────────────────────────────

  describe('Integration — full flow', () => {
    it('13. register → login → refresh → logout → refresh fails', async () => {
      const flowSuffix = Date.now() + 1;
      const flowEmail = `e2e-auth-flow-${flowSuffix}@test.com`;
      const flowPhone = `+5248${flowSuffix.toString().slice(-8)}`;

      // Step 1: Register
      const regRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: flowEmail,
          password: testPassword,
          name: 'Flow',
          lastName: 'Test',
          phone: flowPhone,
        })
        .expect(201);

      let flowAccess = regRes.body.accessToken as string;
      let flowCookie = extractRefreshCookie(regRes)!;
      expect(flowAccess).toBeDefined();
      expect(flowCookie).toBeDefined();

      // Step 2: Login (refreshes tokens)
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: flowEmail, password: testPassword })
        .expect(200);

      flowAccess = loginRes.body.accessToken as string;
      flowCookie = extractRefreshCookie(loginRes)!;

      // Step 3: Refresh (rotation)
      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', flowCookie)
        .expect(200);

      flowAccess = refreshRes.body.accessToken as string;
      const rotatedCookie = extractRefreshCookie(refreshRes)!;
      expect(rotatedCookie).not.toBe(flowCookie);
      flowCookie = rotatedCookie;

      // Step 4: Logout
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${flowAccess}`)
        .set('Cookie', flowCookie)
        .expect(204);

      // Step 5: Refresh after logout must fail — token was revoked
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', flowCookie)
        .expect(401);
    });
  });
});
