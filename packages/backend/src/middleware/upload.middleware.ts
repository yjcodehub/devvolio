import multer from 'multer';
import { Request } from 'express';
import { AppError } from './errorHandler';

// Use memory storage engine to hold buffers in RAM (avoiding local disk clutter)
const storage = multer.memoryStorage();

// File type filter configuration
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only images (jpeg, png, webp, svg), PDFs, and Word documents (doc, docx) are allowed', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB maximum file size
  }
});
