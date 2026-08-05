import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Try to extract token from cookies first (secure option for admin client requests)
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  
  // 2. Fall back to Authorization headers (for typical REST queries or custom tools)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Authentication required. Session token missing.', 401));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError('Session expired or token invalid. Please log in again.', 401));
  }
}
