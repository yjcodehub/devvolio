import { Router } from 'express';
import { getProjects, getProjectBySlug, createProject, updateProject, deleteProject } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import { checkProjectLimit } from '../middleware/tenantLimits';

const router = Router();

// Protected workspace project readers
router.get('/', authenticate, getProjects);
router.get('/:slug', authenticate, getProjectBySlug);

// Protected admin editors
router.post('/', authenticate, checkProjectLimit, createProject);
router.put('/:id', authenticate, updateProject);
router.delete('/:id', authenticate, deleteProject);

export default router;
