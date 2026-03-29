import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { User } from '../../generated/prisma/client';
import { Role } from '../../generated/prisma/enums';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtTokenService } from './jwt-token.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockUser: User = {
  id: 'uuid-1',
  email: 'test@test.com',
  name: 'Test',
  lastName: 'User',
  phone: '+525512345678',
  password: 'hashed-password',
  role: Role.BUYER,
  avatarUrl: null,
  isActive: true,
  emailVerified: false,
  resetToken: null,
  resetTokenExp: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStoredToken = {
  id: 'jti-1',
  userId: 'uuid-1',
  expiresAt: new Date(Date.now() + 60 * 1000),
  createdAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: jest.Mocked<AuthRepository>;
  let jwtTokenService: jest.Mocked<JwtTokenService>;

  beforeEach(async () => {
    const mockAuthRepository: jest.Mocked<AuthRepository> = {
      emailExists: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      createRefreshToken: jest.fn(),
      findRefreshToken: jest.fn(),
      deleteRefreshToken: jest.fn(),
      deleteAllUserRefreshTokens: jest.fn(),
    } as any;

    const mockJwtTokenService = {
      signAccess: jest.fn().mockResolvedValue('access-token'),
      signRefresh: jest.fn().mockResolvedValue('refresh-token'),
      verifyRefresh: jest.fn(),
      get refreshDurationMs() {
        return 7 * 24 * 60 * 60 * 1000;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: JwtTokenService, useValue: mockJwtTokenService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get(AuthRepository);
    jwtTokenService = module.get(JwtTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register()', () => {
    const dto: RegisterDto = {
      email: 'test@test.com',
      password: 'Password123',
      name: 'Test',
      lastName: 'User',
      phone: '+525512345678',
    };

    it('registers successfully — hashes password, creates user, returns tokens', async () => {
      authRepository.emailExists.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      authRepository.create.mockResolvedValue(mockUser);
      authRepository.createRefreshToken.mockResolvedValue(
        mockStoredToken as any,
      );

      const result = await service.register(dto);

      expect(authRepository.emailExists).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
      expect(authRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: dto.email,
          password: 'hashed-password',
          name: dto.name,
          lastName: dto.lastName,
          phone: dto.phone,
        }),
      );
      expect(result).toMatchObject({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          lastName: mockUser.lastName,
          role: mockUser.role,
          avatarUrl: mockUser.avatarUrl,
        },
      });
    });

    it('throws ConflictException if email already exists', async () => {
      authRepository.emailExists.mockResolvedValue(true);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(authRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login()', () => {
    const dto: LoginDto = {
      email: 'test@test.com',
      password: 'Password123',
    };

    it('logs in successfully — returns tokens', async () => {
      authRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      authRepository.createRefreshToken.mockResolvedValue(
        mockStoredToken as any,
      );

      const result = await service.login(dto);

      expect(authRepository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.password,
        mockUser.password,
      );
      expect(result).toMatchObject({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: expect.objectContaining({ email: mockUser.email }),
      });
    });

    it('throws UnauthorizedException for wrong password', async () => {
      authRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for non-existent email', async () => {
      authRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if user.isActive is false', async () => {
      const inactiveUser: User = { ...mockUser, isActive: false };
      authRepository.findByEmail.mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh()', () => {
    const refreshToken = 'valid-refresh-token';
    const payload = { sub: 'uuid-1', jti: 'jti-1' };

    it('refreshes tokens — deletes old token and creates new one (rotation)', async () => {
      jwtTokenService.verifyRefresh.mockResolvedValue(payload);
      authRepository.findRefreshToken.mockResolvedValue(mockStoredToken as any);
      authRepository.findById.mockResolvedValue(mockUser);
      authRepository.deleteRefreshToken.mockResolvedValue(
        mockStoredToken as any,
      );
      authRepository.createRefreshToken.mockResolvedValue(
        mockStoredToken as any,
      );

      const result = await service.refresh(refreshToken);

      expect(jwtTokenService.verifyRefresh).toHaveBeenCalledWith(refreshToken);
      expect(authRepository.findRefreshToken).toHaveBeenCalledWith(payload.jti);
      expect(authRepository.deleteRefreshToken).toHaveBeenCalledWith(
        payload.jti,
      );
      expect(authRepository.createRefreshToken).toHaveBeenCalled();
      expect(result).toMatchObject({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: expect.objectContaining({ id: mockUser.id }),
      });
    });

    it('throws UnauthorizedException if token verification fails (jose throws)', async () => {
      jwtTokenService.verifyRefresh.mockRejectedValue(new Error('JWTExpired'));

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException if stored token not found', async () => {
      jwtTokenService.verifyRefresh.mockResolvedValue(payload);
      authRepository.findRefreshToken.mockResolvedValue(null);

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException if stored token is expired', async () => {
      jwtTokenService.verifyRefresh.mockResolvedValue(payload);
      authRepository.findRefreshToken.mockResolvedValue({
        ...mockStoredToken,
        expiresAt: new Date(Date.now() - 1_000),
      } as any);

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException if user not found', async () => {
      jwtTokenService.verifyRefresh.mockResolvedValue(payload);
      authRepository.findRefreshToken.mockResolvedValue(mockStoredToken as any);
      authRepository.findById.mockResolvedValue(null);

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException if user is inactive', async () => {
      jwtTokenService.verifyRefresh.mockResolvedValue(payload);
      authRepository.findRefreshToken.mockResolvedValue(mockStoredToken as any);
      authRepository.findById.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout()', () => {
    const refreshToken = 'valid-refresh-token';
    const payload = { sub: 'uuid-1', jti: 'jti-1' };

    it('deletes refresh token successfully', async () => {
      jwtTokenService.verifyRefresh.mockResolvedValue(payload);
      authRepository.deleteRefreshToken.mockResolvedValue(
        mockStoredToken as any,
      );

      await expect(service.logout(refreshToken)).resolves.toBeUndefined();

      expect(jwtTokenService.verifyRefresh).toHaveBeenCalledWith(refreshToken);
      expect(authRepository.deleteRefreshToken).toHaveBeenCalledWith(
        payload.jti,
      );
    });

    it('does not throw if token is already invalid (silently swallows errors)', async () => {
      jwtTokenService.verifyRefresh.mockRejectedValue(new Error('JWTExpired'));

      await expect(service.logout(refreshToken)).resolves.toBeUndefined();

      expect(authRepository.deleteRefreshToken).not.toHaveBeenCalled();
    });
  });
});
