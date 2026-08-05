import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public config lookup
router.get('/', getSettings);

// Protected admin editor
router.put('/', authenticate, updateSettings);

export default router;
