import { Router } from 'express';
import { getSkills, createSkill, updateSkill, deleteSkill } from '../controllers/skill.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public skills lists
router.get('/', getSkills);

// Protected admin editors
router.post('/', authenticate, createSkill);
router.put('/:id', authenticate, updateSkill);
router.delete('/:id', authenticate, deleteSkill);

export default router;
