import { Router } from 'express';
import { 
  getSkills, 
  createSkill, 
  updateSkill, 
  deleteSkill,
  getCatalogSkills,
  createCatalogSkill
} from '../controllers/skill.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Master skills catalog endpoints
router.get('/catalog', authenticate, getCatalogSkills);
router.post('/catalog', authenticate, createCatalogSkill);

// Protected workspace skills lists & editors
router.get('/', authenticate, getSkills);
router.post('/', authenticate, createSkill);
router.put('/:id', authenticate, updateSkill);
router.delete('/:id', authenticate, deleteSkill);

export default router;
