import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import request from 'supertest';

jest.mock('../app/services/auth.service', () => {
  class UnauthorizedError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'UnauthorizedError';
    }
  }

  return {
    __esModule: true,
    UnauthorizedError,
    loginAdmin: jest.fn(),
    refreshAdminSession: jest.fn(),
    logoutAdmin: jest.fn(),
    seedAdminFromEnv: jest.fn(),
  };
});

import { createApp } from '../app/app.module';
import * as authService from '../app/services/auth.service';

const loginAdminMock = authService.loginAdmin as jest.MockedFunction<typeof authService.loginAdmin>;
const refreshAdminSessionMock =
  authService.refreshAdminSession as jest.MockedFunction<typeof authService.refreshAdminSession>;
const logoutAdminMock = authService.logoutAdmin as jest.MockedFunction<typeof authService.logoutAdmin>;

describe('Auth Routes', () => {
  const app = createApp();
  const jwtSecret = 'test-jwt-secret';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = jwtSecret;
  });

  it('POST /api/auth/admin/login returns tokens', async () => {
    loginAdminMock.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      admin: {
        id: 'admin-id',
        email: 'admin@example.com',
      },
    });

    const response = await request(app).post('/api/auth/admin/login').send({
      email: 'Admin@Example.com',
      password: 'admin123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      admin: {
        id: 'admin-id',
        email: 'admin@example.com',
      },
    });
    expect(loginAdminMock).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'admin123',
    });
  });

  it('POST /api/auth/admin/login validates request body', async () => {
    const response = await request(app).post('/api/auth/admin/login').send({
      email: 'not-an-email',
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email must be a valid email address');
    expect(loginAdminMock).not.toHaveBeenCalled();
  });

  it('POST /api/auth/admin/refresh returns rotated tokens', async () => {
    refreshAdminSessionMock.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      admin: {
        id: 'admin-id',
        email: 'admin@example.com',
      },
    });

    const response = await request(app).post('/api/auth/admin/refresh').send({
      refreshToken: 'old-refresh-token',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      admin: {
        id: 'admin-id',
        email: 'admin@example.com',
      },
    });
    expect(refreshAdminSessionMock).toHaveBeenCalledWith('old-refresh-token');
  });

  it('POST /api/auth/admin/refresh rejects invalid refresh token', async () => {
    refreshAdminSessionMock.mockRejectedValue(
      new authService.UnauthorizedError('Invalid or expired refresh token'),
    );

    const response = await request(app).post('/api/auth/admin/refresh').send({
      refreshToken: 'bad-refresh-token',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid or expired refresh token');
  });

  it('GET /api/admin/me requires access token', async () => {
    const response = await request(app).get('/api/admin/me');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Missing or invalid authorization token');
  });

  it('GET /api/admin/me accepts admin access token', async () => {
    const accessToken = jwt.sign(
      {
        sub: 'admin-id',
        email: 'admin@example.com',
        role: 'admin',
        tokenType: 'access',
      },
      jwtSecret,
      { expiresIn: '1h' },
    );

    const response = await request(app)
      .get('/api/admin/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      admin: {
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'admin',
      },
    });
  });

  it('GET /api/admin/me rejects refresh token on protected route', async () => {
    const refreshToken = jwt.sign(
      {
        sub: 'admin-id',
        email: 'admin@example.com',
        role: 'admin',
        tokenType: 'refresh',
      },
      jwtSecret,
      { expiresIn: '1h' },
    );

    const response = await request(app)
      .get('/api/admin/me')
      .set('Authorization', `Bearer ${refreshToken}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Admin access only');
  });

  it('POST /api/auth/admin/logout clears current admin session', async () => {
    const accessToken = jwt.sign(
      {
        sub: 'admin-id',
        email: 'admin@example.com',
        role: 'admin',
        tokenType: 'access',
      },
      jwtSecret,
      { expiresIn: '1h' },
    );

    logoutAdminMock.mockResolvedValue(undefined);

    const response = await request(app)
      .post('/api/auth/admin/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Logged out successfully' });
    expect(logoutAdminMock).toHaveBeenCalledWith('admin-id');
  });
});
