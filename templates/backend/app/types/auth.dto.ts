export interface LoginAdminDto {
  email: string;
  password: string;
}

export interface RefreshAdminDto {
  refreshToken: string;
}

export class RequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RequestValidationError';
  }
}

export function parseLoginAdminDto(payload: unknown): LoginAdminDto {
  if (!payload || typeof payload !== 'object') {
    throw new RequestValidationError('Request body must be a valid JSON object');
  }

  const maybeEmail = (payload as Record<string, unknown>).email;
  const maybePassword = (payload as Record<string, unknown>).password;

  if (typeof maybeEmail !== 'string' || typeof maybePassword !== 'string') {
    throw new RequestValidationError('Email and password are required');
  }

  const email = maybeEmail.trim().toLowerCase();
  const password = maybePassword;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new RequestValidationError('Email must be a valid email address');
  }

  if (password.length < 6) {
    throw new RequestValidationError('Password must be at least 6 characters long');
  }

  return { email, password };
}

export function parseRefreshAdminDto(payload: unknown): RefreshAdminDto {
  if (!payload || typeof payload !== 'object') {
    throw new RequestValidationError('Request body must be a valid JSON object');
  }

  const maybeRefreshToken = (payload as Record<string, unknown>).refreshToken;

  if (typeof maybeRefreshToken !== 'string' || !maybeRefreshToken.trim()) {
    throw new RequestValidationError('Refresh token is required');
  }

  return { refreshToken: maybeRefreshToken.trim() };
}
