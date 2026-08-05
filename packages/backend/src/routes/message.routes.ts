import { Router } from 'express';
import { createMessage, getMessages, toggleMessageRead, deleteMessage } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';
import { contactRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Public submission with anti-spam rate limiter
router.post('/', contactRateLimiter, createMessage);

// Protected admin tools
router.get('/', authenticate, getMessages);
router.patch('/:id', authenticate, toggleMessageRead);
router.delete('/:id', authenticate, deleteMessage);

export default router;
