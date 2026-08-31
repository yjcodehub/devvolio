import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protected workspace config lookup
router.get('/', authenticate, getSettings);

// Protected admin editor
router.put('/', authenticate, updateSettings);

export default router;
