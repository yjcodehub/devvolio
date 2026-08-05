import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { AppError } from './errorHandler';

export function requireSuperAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'super_admin') {
    return next(new AppError('Access Denied: Super Admin authorization required for platform governance.', 403));
  }
  next();
}
