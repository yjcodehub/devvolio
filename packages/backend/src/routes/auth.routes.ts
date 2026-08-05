import { Router } from 'express';
import { login, register, sendRegisterOtp, checkSubdomain, refresh, logout, me } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public auth & OTP registration routes
router.post('/login', login);
router.post('/send-otp', sendRegisterOtp);
router.post('/register', register);
router.get('/check-subdomain/:slug', checkSubdomain);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Authenticated session validation
router.get('/me', authenticate, me);

export default router;
