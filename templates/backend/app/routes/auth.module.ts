/**
 * SAMPLE ONLY
 * This route file is intentionally comment-only.
 * Uncomment and adapt if you want to enable auth routing again.
 *
 * Example route-to-controller-to-guard connection:
 *
 * import { Router } from 'express';
 * import {
 *   loginAdminController,
 *   refreshAdminController,
 *   logoutAdminController,
 * } from '../controllers/auth.controller';
 * import { adminAuthGuard } from '../common/guards/admin-auth.guard';
 *
 * const authRouter = Router();
 *
 * authRouter.post('/login', loginAdminController);
 * authRouter.post('/refresh', refreshAdminController);
 * authRouter.post('/logout', adminAuthGuard, logoutAdminController);
 *
 * export { authRouter };
 */

