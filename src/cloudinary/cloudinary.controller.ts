import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service.js';
import { Request } from 'express';
// =================================================================
@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly clouadinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req: Request, file, callback) => {
        const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
        const MAX_PDF_SIZE = 10 * 1024 * 1024;
        const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');
        const isPdf = file.mimetype === 'application/pdf';
        if (!isImage && !isPdf && !isVideo)
          return callback(
            new BadRequestException('نوع الملف الخاص بك غير مدعوم.'),
            false,
          );
        const fileSize = parseInt(req.headers['content-length'] || '0');
        if (file.mimetype.startsWith('image/') && fileSize > MAX_IMAGE_SIZE)
          return callback(
            new BadRequestException(
              'يجب ألا تزيد حجم الصورة الواحدة عن 10 ميجابايت.',
            ),
            false,
          );
        else if (
          file.mimetype.startsWith('video/') &&
          fileSize > MAX_VIDEO_SIZE
        )
          return callback(
            new BadRequestException(
              'يجب ألا يزيد حجم الفيديو الواحد عن 50 ميجابايت.',
            ),
            false,
          );
        else if (file.mimetype === 'application/pdf' && fileSize > MAX_PDF_SIZE)
          return callback(
            new BadRequestException(
              'يجب ألا يزيد حجم الملف النصي الواحد عن 10 ميجابايت.',
            ),
            false,
          );
        callback(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.clouadinaryService.upload(file);
  }
}
