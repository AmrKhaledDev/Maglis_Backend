import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import cloudinary from './cloudinary.config.js';
// =============================================
@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  async upload(file: Express.Multer.File) {
    try {
      const base64 = file.buffer.toString('base64');
      const fileUri = `data:${file.mimetype};base64,${base64}`;
      const isVideo = file.mimetype.startsWith('video/');
      const isPdf = file.mimetype === 'application/pdf';
      const result = await cloudinary.uploader.upload(fileUri, {
        folder: 'maglis-media',
        resource_type: isVideo ? 'video' : 'image',
        format: isPdf ? 'pdf' : undefined,
        flags: isPdf ? 'attachment' : undefined,
        use_filename: true,
        public_id: file.originalname.split('.')[0],
      });
      return {
        url: result.secure_url,
        type: isVideo ? 'VIDEO' : isPdf ? 'PDF' : 'IMAGE',
        size: file.size,
        name: file.originalname,
      };
    } catch (error) {
      this.logger.error('Failed upload file in cloudinary', error);
      throw new InternalServerErrorException(
        'حدث خطأ أثناء رفع الملف الخاص بك. حاول مرة أخرى لاحقاً.',
      );
    }
  }
}
