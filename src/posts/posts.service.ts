import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MediaType, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePostDto } from './schemas/create-post.schema.js';
import { Post } from './types/Post.type.js';
// =============================================================
@Injectable()
export class PostsService {
  private readonly logger = new Logger('Post Service');
  constructor(private readonly prismaService: PrismaService) {}

  async getPosts(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: { id: true },
    });
    if (!user) return [];
    try {
      const posts: Post[] = await this.prismaService.post.findMany({
        where: {
          OR: [
            { privacy: 'PUBLIC' },
            { privacy: 'PRIVATE', authorId: user.id },
            {
              privacy: 'FRIENDS',
              author: {
                friendships: {
                  some: {
                    friendId: user.id,
                  },
                },
              },
            },
            { privacy: 'FRIENDS', authorId: user.id },
          ],
          hiddenPosts: {
            none: {
              userId: user.id,
            },
          },
          author: {
            blocked: {
              none: {
                blockerId: user.id,
              },
            },
            blocks: {
              none: {
                blockedId: user.id,
              },
            },
          },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              professionalMode: true,
              image: true,
              username: true,
            },
          },
          media: true,
          likes: {
            select: {
              userId: true,
              user: {
                select: {
                  image: true,
                  name: true,
                  professionalMode: true,
                  bio: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return posts;
    } catch (error) {
      return [];
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
}
