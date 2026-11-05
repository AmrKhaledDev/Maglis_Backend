import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MediaType, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { boolean } from 'zod';
import { PrismaService } from '../prisma/prisma.service.js';
import { postInclude } from '../prisma/fragments/post/post.include.js';
import { postWhere } from '../prisma/fragments/post/post.where.js';
import { videoWhere } from '../prisma/fragments/post/video.where.js';
import { CreatePostDto } from './schemas/CreatePost.schema.js';
import { Post } from './types/Post.type.js';
// =============================================================
@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async getPosts(userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        select: { id: true },
      });
      if (!user) return [];
      const posts: Post[] = await this.prismaService.post.findMany({
        where: postWhere(user.id),
        include: postInclude,
        orderBy: { createdAt: 'desc' },
      });
      return { success: true, posts };
    } catch (error) {
      this.logger.error('Failed get all posts', error);
      return [];
    }
  }

  async getPost(userId: string, postId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        select: { id: true },
      });
      if (!user)
        throw new NotFoundException(
          'يتعذر جلب المنشور, لم نستطع التعرف على حسابك.',
        );
      const ownerPost = await this.prismaService.post.findFirst({
        where: {
          author: {
            posts: { some: { id: postId } },
          },
        },
        select: {
          author: {
            select: {
              blockedByUsers: { select: { blockerId: true } },
              blockedUsers: { select: { blockedId: true } },
            },
          },
        },
      });
      if (!ownerPost)
        throw new NotFoundException(
          'يتعذر جلب المنشور, ربما تم حذفه او المعرف الخاص بالمنشور غير صحيح.',
        );
      const isBlocked = ownerPost.author.blockedUsers.some(
        (block) => block.blockedId === userId,
      );
      const isBlocker = ownerPost.author.blockedByUsers.some(
        (block) => block.blockerId === userId,
      );
      if (isBlocked || isBlocker)
        throw new ForbiddenException('لا تملك صلاحية مشاهدة هذا المنشور.');
      const post = await this.prismaService.post.findFirst({
        where: {
          AND: [{ id: postId }, postWhere(user.id)],
        },
        include: postInclude,
      });
      if (!post)
        throw new NotFoundException(
          'المنشور غير موجود أو لا يمكنك الوصول إليه.',
        );
      return { success: true, post };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to get single post', error);
      throw new InternalServerErrorException('حدث خطأ, يتعذر جلب المنشور.');
    }
  }

  async create(data: CreatePostDto, userId: string, postId?: string) {
    const {
      content,
      media,
      commentsDisabled,
      isPinnedToProfile,
      showMediaInProfile,
    } = data;
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          emailVerified: true,
        },
      });
      if (!user || !user.emailVerified)
        throw new UnauthorizedException(
          'لا يمكنك تنفيذ هذا الاجراء. برجاء انشاء حساب او تأكيد التحقق من حسابك.',
        );
      if (postId) {
        const post = await this.prismaService.post.findUnique({
          where: { id: postId },
          select: { authorId: true },
        });
        if (!post || post.authorId !== user.id)
          throw new UnauthorizedException('لا يمكنك تنفيذ هذا الاجراء.');
      }
      if (media && media.length > 0) {
        for (const item of media) {
          if (!Object.values(MediaType).includes(item.type) || !item.url)
            throw new BadRequestException(
              'يتعذر إنشاء منشور جديد. يرجى التأكد من صحة الملفات المرفقة واستكمال جميع البيانات المطلوبة بشكل صحيح.',
            );
        }
      }
      await this.prismaService.$transaction(async (tx) => {
        let newPost: Prisma.PostGetPayload<{ select: { id: true } }>;
        newPost = await tx.post.upsert({
          where: {
            id: postId || 'NO_ID',
            authorId: userId,
          },
          update: {
            content,
            privacy: data.privacy,
            commentsDisabled,
            isPinnedToProfile,
            showMediaInProfile,
            media: {
              deleteMany: {},
            },
          },
          create: {
            authorId: userId,
            content,
            privacy: data.privacy,
            commentsDisabled,
            isPinnedToProfile,
          },
          select: { id: true },
        });
        if (media && media.length > 0) {
          await tx.postMedia.createMany({
            data: media.map((media) => ({
              postId: newPost.id,
              url: media.url,
              type: media.type,
            })),
          });
        }
      });
      return {
        success: true,
        message: postId ? 'تم تعديل المنشور.' : 'تم انشاء منشور جديد.',
      };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new BadRequestException('معرف المنشور غير صحيح.');
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed create post', error);
      throw new InternalServerErrorException(
        'حدث خطأ أثناء انشاء منشور جديد. حاول مرة أخرى لاحقاً',
      );
    }
  }

  async delete(userId: string, postId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        select: { id: true, emailVerified: true },
      });
      if (!user || !user.emailVerified)
        throw new UnauthorizedException('لا يمكنك تنفيذ هذا الاجراء.');
      const post = await this.prismaService.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          authorId: true,
          id: true,
        },
      });
      if (!post) throw new NotFoundException('المنشور غير موجود.');
      if (post.authorId !== user.id)
        throw new UnauthorizedException('لا يمكنك تنفيذ هذا الإجراء.');
      await this.prismaService.post.delete({
        where: {
          id: post.id,
        },
      });
      return { success: true, message: 'تم حذف المنشور الخاص بك.' };
    } catch (error) {
      this.logger.error('Failed delete post', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'حدث خطأ غير متوقع أثناء حذف المنشور. حاول مرة أخرى لاحقاً.',
      );
    }
  }

  async getVideos(userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        select: { id: true },
      });
      if (!user) return [];
      const videos: Post[] = await this.prismaService.post.findMany({
        where: videoWhere(user.id),
        include: postInclude,
        orderBy: [
          { createdAt: 'desc' },
          { author: { followersCount: 'desc' } },
        ],
      });
      const filteredVideos = videos.filter((video) => video.media.length === 1);
      return { success: boolean, videos: filteredVideos };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      return [];
    }
  }
}
