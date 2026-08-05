import { Router } from 'express';
import { getProjects, getProjectBySlug, createProject, updateProject, deleteProject } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import { checkProjectLimit } from '../middleware/tenantLimits';

const router = Router();

// Public readers
router.get('/', getProjects);
router.get('/:slug', getProjectBySlug);

// Protected admin editors
router.post('/', authenticate, checkProjectLimit, createProject);
router.put('/:id', authenticate, updateProject);
router.delete('/:id', authenticate, deleteProject);

export default router;
