import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyRefreshToken, generateAccessToken, TokenPayload } from '../utils/jwt';
import { AppError } from './errorHandler';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {})
};

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Try to extract token from cookies first
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // 2. Fall back to Authorization headers
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If access token exists, attempt verification
  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      return next();
    } catch (error) {
      // Access token expired or invalid - proceed to auto-refresh check
    }
  }

  // 3. Fallback: Auto-refresh session if refreshToken cookie is present
  if (req.cookies && req.cookies.refreshToken) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const decoded = verifyRefreshToken(refreshToken);

      const user = await User.findById(decoded.userId);
      if (user && user.refreshToken === refreshToken) {
        const payload: TokenPayload = {
          userId: user._id.toString(),
          email: user.email,
          role: user.role
        };

        const newAccessToken = generateAccessToken(payload);

        res.cookie('accessToken', newAccessToken, {
          ...COOKIE_OPTIONS,
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        req.user = payload;
        return next();
      }
    } catch (refreshErr) {
      // Refresh token invalid or expired
    }
  }

  return next(new AppError('Authentication required. Session token missing or expired.', 401));
}
