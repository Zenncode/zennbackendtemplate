import { Request, Response } from 'express';
import {
  UnauthorizedError,
  loginAdmin,
  logoutAdmin,
  refreshAdminSession,
} from '../services/auth.service';
import {
  RequestValidationError,
  parseLoginAdminDto,
  parseRefreshAdminDto,
} from '../types/auth.dto';

export async function loginAdminController(req: Request, res: Response): Promise<Response> {
  try {
    const dto = parseLoginAdminDto(req.body);
    const result = await loginAdmin(dto);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function refreshAdminController(req: Request, res: Response): Promise<Response> {
  try {
    const dto = parseRefreshAdminDto(req.body);
    const result = await refreshAdminSession(dto.refreshToken);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function logoutAdminController(req: Request, res: Response): Promise<Response> {
  try {
    if (!req.admin?.id) {
      return res.status(401).json({ message: 'Missing or invalid authorization token' });
    }

    await logoutAdmin(req.admin.id);
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch {
    return res.status(500).json({ message: 'Internal server error' });
  }
}
