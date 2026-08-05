import { Router } from 'express';
import { getExperiences, createExperience, updateExperience, deleteExperience } from '../controllers/experience.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public timeline lookup
router.get('/', getExperiences);

// Protected admin editors
router.post('/', authenticate, createExperience);
router.put('/:id', authenticate, updateExperience);
router.delete('/:id', authenticate, deleteExperience);

export default router;
