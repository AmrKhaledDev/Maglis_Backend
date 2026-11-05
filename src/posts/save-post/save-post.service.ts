import {
  ConflictException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PostAccessService } from '../../common/services/post-access/post-access.service.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { SavePost } from '../types/SavePost.type.js';
import { SavePostInclude } from '../../prisma/fragments/saved-post/save-post.include.js';
import { SavePostWhere } from '../../prisma/fragments/saved-post/save-post.where.js';
// =======================================
@Injectable()
export class SavePostService {
  private readonly logger = new Logger(SavePostService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly postAccessService: PostAccessService,
  ) {}

  async savePost(userId: string, postId: string) {
    try {
      await this.postAccessService.checkBlock(userId, postId);
      const alreadySaved = await this.prismaService.savePost.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
        select: { id: true },
      });
      if (alreadySaved) {
        await this.prismaService.savePost.deleteMany({
          where: {
            postId,
            userId,
          },
        });
      } else {
        await this.prismaService.savePost.create({
          data: {
            postId,
            userId,
          },
        });
      }
      return {
        success: true,
        message: 'اكتمل تحديث المحفوظات بنجاح، وستظهر التغييرات على الفور.',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundException('معرف المنشور غير صحيح.');
      this.logger.error('Failed save post', error);
    }
  }

  async getSavedPosts(userId: string) {
    try {
      const savedPosts: SavePost[] = await this.prismaService.savePost.findMany(
        {
          where: SavePostWhere(userId),
          include: SavePostInclude,
        },
      );
      return { success: true, savedPosts };
    } catch (error) {
      this.logger.error('Failed get saved posts', error);
    }
  }
}
