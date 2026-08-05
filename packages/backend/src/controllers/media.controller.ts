import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { cloudinary } from '../config/cloudinary';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';

// Helper to stream file buffer to Cloudinary using a Promise wrapper
function streamUploadToCloudinary(fileBuffer: Buffer, folder = 'portfolio'): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Auto-detect PDF/images/video
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
}

export async function uploadMedia(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return next(new AppError('No file provided in form upload', 400));
    }

    const folderName = req.body.folder || 'portfolio';
    const uploadResult = await streamUploadToCloudinary(req.file.buffer, folderName);

    return sendSuccess(res, {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes
    }, 'Media uploaded successfully to cloud storage', 201);

  } catch (error: any) {
    console.error('[MediaController] Cloudinary upload failure:', error);
    return next(new AppError(`Cloudinary upload failed: ${error.message || error}`, 500));
  }
}

export async function deleteMedia(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { publicId } = req.params;

    if (!publicId || typeof publicId !== 'string') {
      return next(new AppError('Cloudinary asset publicId must be a valid string', 400));
    }

    const deletionResult = await cloudinary.uploader.destroy(publicId);

    if (deletionResult.result !== 'ok' && deletionResult.result !== 'not found') {
      return next(new AppError(`Cloudinary deletion failed with status: ${deletionResult.result}`, 400));
    }

    return sendSuccess(res, null, `Media asset [${publicId}] deleted successfully from cloud storage`);

  } catch (error: any) {
    console.error('[MediaController] Cloudinary deletion failure:', error);
    return next(new AppError(`Cloudinary deletion failed: ${error.message || error}`, 500));
  }
}
