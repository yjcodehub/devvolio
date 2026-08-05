import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getPlans,
  getSubscription,
  createRazorpayOrder,
  verifyPayment,
  handleWebhook
} from '../controllers/billing.controller';

const router = Router();

// Public routes
router.get('/plans', getPlans);
router.post('/webhook', handleWebhook);

// Protected tenant billing routes
router.get('/subscription', authenticate, getSubscription);
router.post('/create-order', authenticate, createRazorpayOrder);
router.post('/verify-payment', authenticate, verifyPayment);

export default router;
