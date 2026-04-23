import * as bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { LoginAdminDto } from '../types/auth.dto';
import { AdminModel } from '../types/admin.schema';

// Default credentials used only when MongoDB is unavailable (sample mode).
const DEFAULT_SAMPLE_ADMIN_EMAIL = 'admin@example.com';
const DEFAULT_SAMPLE_ADMIN_PASSWORD = 'admin123';
const SAMPLE_ADMIN_ID = 'sample-admin';

type TokenPairPayload = {
  sub: string;
  email: string;
  role: 'admin';
};

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  admin: {
    id: string;
    email: string;
  };
};

type MongoAdminEntity = {
  _id: { toString(): string };
  email: string;
  save(): Promise<unknown>;
  refreshTokenHash?: string;
};

type InMemoryAdmin = {
  id: string;
  email: string;
  passwordHash: string;
  refreshTokenHash?: string;
};

// In-memory auth state for sample mode (cleared on process restart).
let inMemoryAdmin: InMemoryAdmin | null = null;
let sampleModeNoticePrinted = false;

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isMongoConnected(): boolean {
  // 1 means connected in Mongoose readyState enum.
  return mongoose.connection.readyState === 1;
}

function getSampleAdminSeed(): { email: string; password: string } {
  const seedEmail = normalizeEmail(
    process.env.SAMPLE_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? DEFAULT_SAMPLE_ADMIN_EMAIL,
  );
  const seedPassword = (
    process.env.SAMPLE_ADMIN_PASSWORD ??
    process.env.ADMIN_PASSWORD ??
    DEFAULT_SAMPLE_ADMIN_PASSWORD
  ).trim();

  return {
    email: seedEmail || DEFAULT_SAMPLE_ADMIN_EMAIL,
    password: seedPassword || DEFAULT_SAMPLE_ADMIN_PASSWORD,
  };
}

function printSampleModeNotice(): void {
  if (sampleModeNoticePrinted) {
    return;
  }

  sampleModeNoticePrinted = true;
  process.stdout.write(
    'Sample auth mode enabled (MongoDB unavailable): using in-memory admin session storage.\n',
  );
}

async function ensureInMemoryAdmin(): Promise<InMemoryAdmin> {
  // Lazily initialize sample admin so startup remains fast and deterministic.
  if (inMemoryAdmin) {
    return inMemoryAdmin;
  }

  const { email, password } = getSampleAdminSeed();
  const passwordHash = await bcrypt.hash(password, 10);
  inMemoryAdmin = {
    id: SAMPLE_ADMIN_ID,
    email,
    passwordHash,
  };
  printSampleModeNotice();
  return inMemoryAdmin;
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

async function issueMongoSessionTokens(admin: MongoAdminEntity): Promise<SessionTokens> {
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

async function issueInMemorySessionTokens(admin: InMemoryAdmin): Promise<SessionTokens> {
  const payload: TokenPairPayload = {
    sub: admin.id,
    email: admin.email,
    role: 'admin',
  };

  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);
  admin.refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  return {
    accessToken,
    refreshToken,
    admin: {
      id: admin.id,
      email: admin.email,
    },
  };
}

function verifyRefreshToken(refreshToken: string): jwt.JwtPayload & {
  sub: string;
  role: string;
  tokenType: string;
} {
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

  return payload as jwt.JwtPayload & {
    sub: string;
    role: string;
    tokenType: string;
  };
}

export async function seedAdminFromEnv(): Promise<void> {
  // Primary mode: persistent Mongo-backed admin storage.
  if (isMongoConnected()) {
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
    return;
  }

  // Fallback mode: in-memory sample admin storage.
  const seedEmail = process.env.ADMIN_EMAIL?.trim();
  const seedPassword = process.env.ADMIN_PASSWORD?.trim();

  if (seedEmail && seedPassword) {
    inMemoryAdmin = {
      id: SAMPLE_ADMIN_ID,
      email: normalizeEmail(seedEmail),
      passwordHash: await bcrypt.hash(seedPassword, 10),
    };
    printSampleModeNotice();
    return;
  }

  await ensureInMemoryAdmin();
}

export async function loginAdmin(dto: LoginAdminDto): Promise<SessionTokens> {
  const email = normalizeEmail(dto.email);

  // Use persistent DB lookup when MongoDB is connected.
  if (isMongoConnected()) {
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return issueMongoSessionTokens(admin);
  }

  // Sample mode login path (no MongoDB dependency).
  const sampleAdmin = await ensureInMemoryAdmin();
  if (sampleAdmin.email !== email) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(dto.password, sampleAdmin.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return issueInMemorySessionTokens(sampleAdmin);
}

export async function refreshAdminSession(refreshToken: string): Promise<SessionTokens> {
  const payload = verifyRefreshToken(refreshToken);

  // Use persistent token rotation when MongoDB is connected.
  if (isMongoConnected()) {
    const admin = await AdminModel.findById(payload.sub);
    if (!admin || !admin.refreshTokenHash) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, admin.refreshTokenHash);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    return issueMongoSessionTokens(admin);
  }

  // Sample mode token rotation in memory.
  const sampleAdmin = await ensureInMemoryAdmin();
  if (payload.sub !== sampleAdmin.id || !sampleAdmin.refreshTokenHash) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const isRefreshTokenValid = await bcrypt.compare(refreshToken, sampleAdmin.refreshTokenHash);
  if (!isRefreshTokenValid) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  return issueInMemorySessionTokens(sampleAdmin);
}

export async function logoutAdmin(adminId: string): Promise<void> {
  // Clear persisted refresh token hash in Mongo mode.
  if (isMongoConnected()) {
    await AdminModel.findByIdAndUpdate(adminId, { $unset: { refreshTokenHash: 1 } }).lean();
    return;
  }

  // Clear in-memory refresh token hash in sample mode.
  const sampleAdmin = await ensureInMemoryAdmin();
  if (sampleAdmin.id !== adminId) {
    return;
  }

  delete sampleAdmin.refreshTokenHash;
}
