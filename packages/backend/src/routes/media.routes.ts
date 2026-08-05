import { Router } from 'express';
import { uploadMedia, deleteMedia } from '../controllers/media.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Protected admin media uploading
router.post('/upload', authenticate, upload.single('file'), uploadMedia);

// Protected admin media deleting
router.delete('/:publicId(*)', authenticate, deleteMedia); // Use wildcard (*) to capture subfolders in public ID

export default router;
