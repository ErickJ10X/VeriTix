jest.mock('./auth.service', () => ({ AuthService: jest.fn() }));
jest.mock('./jwt-token.service', () => ({ JwtTokenService: jest.fn() }));

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtTokenService } from './jwt-token.service';

const mockServiceResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user: {
    id: 'uuid-1',
    email: 'test@test.com',
    name: 'Test',
    lastName: 'User',
    role: 'BUYER',
    avatarUrl: null,
  },
};

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  const mockJwtTokenService = {
    refreshDurationMs: 604800000,
  };

  const mockRes = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  const mockReq = {
    cookies: { refresh_token: 'mock-refresh-token' },
  } as unknown as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtTokenService, useValue: mockJwtTokenService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('register()', () => {
    const registerDto = {
      email: 'test@test.com',
      password: 'Password123!',
      name: 'Test',
      lastName: 'User',
    };

    it('returns auth response and sets refresh cookie', async () => {
      mockAuthService.register.mockResolvedValue(mockServiceResponse);

      const result = await controller.register(registerDto as any, mockRes);

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        user: mockServiceResponse.user,
      });
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'mock-refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/auth',
          maxAge: 604800000,
        }),
      );
    });

    it('does NOT include refreshToken in response body', async () => {
      mockAuthService.register.mockResolvedValue(mockServiceResponse);

      const result = await controller.register(registerDto as any, mockRes);

      expect(result).not.toHaveProperty('refreshToken');
    });
  });

  describe('login()', () => {
    const loginDto = {
      email: 'test@test.com',
      password: 'Password123!',
    };

    it('returns auth response and sets refresh cookie', async () => {
      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      const result = await controller.login(loginDto as any, mockRes);

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        user: mockServiceResponse.user,
      });
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'mock-refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/auth',
          maxAge: 604800000,
        }),
      );
    });

    it('does NOT include refreshToken in response body', async () => {
      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      const result = await controller.login(loginDto as any, mockRes);

      expect(result).not.toHaveProperty('refreshToken');
    });
  });

  describe('refresh()', () => {
    it('reads cookie, calls service, and sets new cookie', async () => {
      mockAuthService.refresh.mockResolvedValue(mockServiceResponse);

      const result = await controller.refresh(mockReq, mockRes);

      expect(mockAuthService.refresh).toHaveBeenCalledWith(
        'mock-refresh-token',
      );
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        user: mockServiceResponse.user,
      });
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'mock-refresh-token',
        expect.objectContaining({
          httpOnly: true,
          path: '/auth',
          maxAge: 604800000,
        }),
      );
    });

    it('throws UnauthorizedException when no cookie is present', async () => {
      const reqNoCookie = { cookies: {} } as unknown as Request;

      await expect(controller.refresh(reqNoCookie, mockRes)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.refresh).not.toHaveBeenCalled();
    });
  });

  describe('logout()', () => {
    it('calls service.logout and clears cookie when token present', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await controller.logout(mockReq, mockRes);

      expect(mockAuthService.logout).toHaveBeenCalledWith('mock-refresh-token');
      expect(mockRes.clearCookie).toHaveBeenCalledWith('refresh_token', {
        path: '/auth',
      });
    });

    it('only clears cookie when no token present (does not call service)', async () => {
      const reqNoCookie = { cookies: {} } as unknown as Request;

      await controller.logout(reqNoCookie, mockRes);

      expect(mockAuthService.logout).not.toHaveBeenCalled();
      expect(mockRes.clearCookie).toHaveBeenCalledWith('refresh_token', {
        path: '/auth',
      });
    });
  });
});
