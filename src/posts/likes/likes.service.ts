import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PostAccessService } from '../../common/services/post-access/post-access.service.js';
// ===========================================================================
@Injectable()
export class LikesService {
  private readonly logger = new Logger(LikesService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly postAccess: PostAccessService,
  ) {}
  async likePost(postId: string, userId: string) {
    try {
      await this.postAccess.checkBlock(userId, postId);
      const alreadyLiker = await this.prismaService.like.findFirst({
        where: {
          postId,
          userId,
        },
      });
      if (alreadyLiker) {
        await this.prismaService.like.deleteMany({
          where: {
            postId,
            userId,
          },
        });
      } else {
        await this.prismaService.like.create({
          data: {
            postId,
            userId,
          },
        });
      }
      return { success: true };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new ConflictException('تم تسجيل الإعجاب بالفعل.');
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      )
        throw new NotFoundException('المنشور الخاص بهذا المعرف غير موجود.');
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed create like for post', error);
      throw new InternalServerErrorException(
        'حدث خطأ, تعذر تسجيل الإعجاب لهذا المنشور..',
      );
    }
  }
}
