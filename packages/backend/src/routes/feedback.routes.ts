import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireSuperAdmin } from '../middleware/superAdmin.middleware';
import {
  submitFeedback,
  getMyFeedback,
  getAllFeedbackForAdmin,
  updateFeedbackStatus,
  deleteFeedback
} from '../controllers/feedback.controller';

const router = Router();

// User Feedback Endpoints (Authenticated Tenant Users)
router.post('/', authenticate, submitFeedback);
router.get('/my', authenticate, getMyFeedback);

// Superadmin Feedback Governance Endpoints
router.get('/admin/all', authenticate, requireSuperAdmin, getAllFeedbackForAdmin);
router.patch('/admin/:id', authenticate, requireSuperAdmin, updateFeedbackStatus);
router.delete('/admin/:id', authenticate, requireSuperAdmin, deleteFeedback);

export default router;
