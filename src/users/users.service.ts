import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { UserWithSocialLink } from './types/UserWithSocialLink.type.js';
// ==========================================================================
@Injectable()
export class UsersService {
  private readonly logger = new Logger();
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    try {
      const user: UserWithSocialLink | null = await this.prisma.user.findUnique(
        {
          where: {
            id: userId,
          },
          include: { socialLinks: true },
          omit: { password: true },
        },
      );
      if (!user)
        throw new NotFoundException(
          'لم يتم العثور على المستخدم المطلوب. قد يكون الحساب غير موجود أو تم حذفه.',
        );
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof PrismaClientKnownRequestError) throw error;
      this.logger.error('Failed to retrieve user profile', error);
      throw new InternalServerErrorException(
        'حدث خطأ غير متوقع أثناء جلب الملف الشخصي. يُرجى المحاولة مرة أخرى لاحقًا.',
      );
    }
  }
}
