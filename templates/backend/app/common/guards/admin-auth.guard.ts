import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

type AdminJwtPayload = jwt.JwtPayload & {
  sub?: string;
  email?: string;
  role?: string;
  tokenType?: string;
};

export function adminAuthGuard(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization ?? '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Missing or invalid authorization token' });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET ?? 'change-this-secret';

  try {
    const payload = jwt.verify(token, jwtSecret) as AdminJwtPayload;

    if (payload.role !== 'admin' || payload.tokenType !== 'access') {
      res.status(401).json({ message: 'Admin access only' });
      return;
    }

    req.admin = {
      id: typeof payload.sub === 'string' ? payload.sub : '',
      email: typeof payload.email === 'string' ? payload.email : undefined,
      role: 'admin',
    };

    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
