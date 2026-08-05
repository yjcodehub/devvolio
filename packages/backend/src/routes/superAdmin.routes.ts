import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireSuperAdmin } from '../middleware/superAdmin.middleware';
import {
  getPlatformAnalytics,
  getAllWorkspaces,
  updateWorkspaceStatus,
  updateWorkspacePlan,
  impersonateWorkspace
} from '../controllers/superAdmin.controller';

const router = Router();

// Protect all Super Admin governance endpoints
router.use(authenticate, requireSuperAdmin);

router.get('/analytics', getPlatformAnalytics);
router.get('/workspaces', getAllWorkspaces);
router.put('/workspaces/:id/status', updateWorkspaceStatus);
router.put('/workspaces/:id/plan', updateWorkspacePlan);
router.post('/workspaces/:id/impersonate', impersonateWorkspace);

export default router;
