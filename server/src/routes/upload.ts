import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post('/', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if Cloudinary is configured
    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name' &&
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_KEY !== 'your_cloudinary_api_key' &&
      process.env.CLOUDINARY_API_SECRET && 
      process.env.CLOUDINARY_API_SECRET !== 'your_cloudinary_api_secret';

    if (!isCloudinaryConfigured) {
      // Fallback to Base64 Data URI so they can test without Cloudinary configured!
      const base64Data = req.file.buffer.toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${base64Data}`;
      return res.status(200).json({
        success: true,
        url: dataUri,
        note: 'Fallback to Base64 Data URI because Cloudinary is not configured.'
      });
    }

    // Upload using streamifier or raw buffer to upload_stream
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'voicy_logos' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    return res.status(200).json({
      success: true,
      url: result.secure_url
    });
  } catch (err: any) {
    next(err);
  }
});

export default router;
