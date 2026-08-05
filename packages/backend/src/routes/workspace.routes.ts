import { Router } from 'express';
import { getPublicPortfolioData, addCustomDomain, verifyCustomDomain } from '../controllers/workspace.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public endpoint for loading tenant portfolio data by subdomain or custom domain
router.get('/public/:identifier', getPublicPortfolioData);

// Protected endpoints for custom domain registration and DNS verification
router.post('/custom-domain', authenticate, addCustomDomain);
router.post('/verify-domain', authenticate, verifyCustomDomain);

export default router;
