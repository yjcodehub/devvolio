import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { checkAiUsageLimit } from '../middleware/tenantLimits';
import {
  generateAbout,
  improveSummary,
  generateProjectDesc,
  rewriteResume,
  generateSeo,
  suggestSkills,
  generateBlog,
  generateMeta,
  generateTestimonials,
  improveLinkedin,
  improveReadme
} from '../controllers/ai.controller';

const router = Router();

router.use(authenticate, checkAiUsageLimit);

router.post('/generate-about', generateAbout);
router.post('/improve-summary', improveSummary);
router.post('/generate-project-desc', generateProjectDesc);
router.post('/rewrite-resume', rewriteResume);
router.post('/generate-seo', generateSeo);
router.post('/suggest-skills', suggestSkills);
router.post('/generate-blog', generateBlog);
router.post('/generate-meta', generateMeta);
router.post('/generate-testimonials', generateTestimonials);
router.post('/improve-linkedin', improveLinkedin);
router.post('/improve-readme', improveReadme);

export default router;
