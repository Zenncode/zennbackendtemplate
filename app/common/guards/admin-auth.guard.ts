/**
 * SAMPLE ONLY
 * This guard file is intentionally comment-only.
 * Uncomment and adapt if you want to protect admin routes again.
 *
 * Example guard connection flow:
 *
 * import { NextFunction, Request, Response } from 'express';
 * import jwt from 'jsonwebtoken';
 *
 * export function adminAuthGuard(req: Request, res: Response, next: NextFunction): void {
 *   // 1) Read Authorization header: "Bearer <token>".
 *   // 2) Verify JWT using process.env.JWT_SECRET.
 *   // 3) Check payload role/tokenType (admin/access).
 *   // 4) Attach req.admin = { id, email, role: 'admin' }.
 *   // 5) Call next() or return 401 response.
 * }
 */

