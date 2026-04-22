import * as bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { LoginAdminDto } from '../types/auth.dto';
import { AdminModel } from '../types/admin.schema';

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

type TokenPairPayload = {
  sub: string;
  email: string;
  role: 'admin';
};

export async function seedAdminFromEnv(): Promise<void> {
  const seedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const seedPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!seedEmail || !seedPassword) {
    return;
  }

  const existingAdmin = await AdminModel.findOne({ email: seedEmail }).lean();
  if (existingAdmin) {
    return;
  }

  const passwordHash = await bcrypt.hash(seedPassword, 10);
  await AdminModel.create({
    email: seedEmail,
    passwordHash,
  });
}

function createAccessToken(payload: TokenPairPayload): string {
  const jwtSecret = process.env.JWT_SECRET ?? 'change-this-secret';
  const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? '1d') as SignOptions['expiresIn'];
  return jwt.sign(
    {
      ...payload,
      tokenType: 'access',
    },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn,
    },
  );
}

function createRefreshToken(payload: TokenPairPayload): string {
  const refreshSecret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'change-this-secret';
  const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];
  return jwt.sign(
    {
      ...payload,
      tokenType: 'refresh',
    },
    refreshSecret,
    {
      expiresIn: refreshExpiresIn,
    },
  );
}

async function issueSessionTokens(admin: {
  _id: { toString(): string };
  email: string;
  save(): Promise<unknown>;
  refreshTokenHash?: string;
}) {
  const payload: TokenPairPayload = {
    sub: admin._id.toString(),
    email: admin.email,
    role: 'admin',
  };

  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);
  admin.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await admin.save();

  return {
    accessToken,
    refreshToken,
    admin: {
      id: admin._id.toString(),
      email: admin.email,
    },
  };
}

export async function loginAdmin(dto: LoginAdminDto) {
  const email = dto.email.trim().toLowerCase();
  const admin = await AdminModel.findOne({ email });

  if (!admin) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(dto.password, admin.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return issueSessionTokens(admin);
}

export async function refreshAdminSession(refreshToken: string) {
  const refreshSecret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'change-this-secret';

  let payload: (jwt.JwtPayload & { sub?: string; role?: string; tokenType?: string }) | null = null;

  try {
    payload = jwt.verify(refreshToken, refreshSecret) as jwt.JwtPayload & {
      sub?: string;
      role?: string;
      tokenType?: string;
    };
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  if (!payload || payload.role !== 'admin' || payload.tokenType !== 'refresh' || !payload.sub) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const admin = await AdminModel.findById(payload.sub);
  if (!admin || !admin.refreshTokenHash) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const isRefreshTokenValid = await bcrypt.compare(refreshToken, admin.refreshTokenHash);
  if (!isRefreshTokenValid) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  return issueSessionTokens(admin);
}

export async function logoutAdmin(adminId: string) {
  await AdminModel.findByIdAndUpdate(adminId, { $unset: { refreshTokenHash: 1 } }).lean();
}
