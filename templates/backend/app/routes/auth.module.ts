import { Router } from 'express';
import {
  loginAdminController,
  logoutAdminController,
  refreshAdminController,
} from '../controllers/auth.controller';
import { adminAuthGuard } from '../common/guards/admin-auth.guard';

const authRouter = Router();

authRouter.post('/login', loginAdminController);
authRouter.post('/refresh', refreshAdminController);
authRouter.post('/logout', adminAuthGuard, logoutAdminController);

export { authRouter };
