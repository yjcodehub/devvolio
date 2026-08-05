import { Router } from 'express';
import {
  getResumes,
  uploadResume,
  activateResume,
  deleteResume,
  parseResume,
  getParseResult,
  applyParsedData
} from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Protected admin resume channels
router.get('/', authenticate, getResumes);
router.post('/upload', authenticate, upload.single('file'), uploadResume);
router.put('/:id/activate', authenticate, activateResume);
router.delete('/:id', authenticate, deleteResume);

// AI Resume Parser Endpoints
router.post('/parse/:id', authenticate, parseResume);
router.get('/parse-result/:id', authenticate, getParseResult);
router.post('/apply-parsed/:id', authenticate, applyParsedData);

export default router;
