import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
// ============================================================

@Injectable()
export class PostAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async checkBlock(userId: string, postId: string): Promise<void> {
    const ownerPost = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        author: {
          select: {
            blockedByUsers: {
              select: { blockerId: true },
            },
            blockedUsers: {
              select: { blockedId: true },
            },
          },
        },
      },
    });

    if (!ownerPost) {
      throw new NotFoundException('المنشور غير موجود أو ربما تم حذفه.');
    }
    const isBlocked = ownerPost.author.blockedUsers.some(
      (block) => block.blockedId === userId,
    );
    const isBlocker = ownerPost.author.blockedByUsers.some(
      (block) => block.blockerId === userId,
    );
    if (isBlocked || isBlocker) {
      throw new ForbiddenException('لا تملك صلاحية التفاعل مع هذا المنشور.');
    }
  }
}
