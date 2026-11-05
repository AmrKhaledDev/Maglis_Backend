import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { EmailService } from '../email/email.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { VerificationTokenService } from '../verification-token/verification-token.service.js';
import { LoginDto } from './schemas/Login.schema.js';
import { RegisterDto } from './schemas/Register.schema.js';
import { SessionWithRelations } from './types/SessionWithRelations.type.js';
import { userSelect } from '../prisma/fragments/auth/user.select.js';
// ===========================================================================================
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationTokenService: VerificationTokenService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}
  async Login(data: LoginDto, res: Response) {
    const { email, password } = data;
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
        select: { id: true, password: true, emailVerified: true, name: true },
      });
      if (!user)
        throw new NotFoundException('هذا الحساب غير موجود. برجاء انشاء حساب.');
      if (!user.password)
        throw new UnauthorizedException(
          'البريد الالكتروني أو كلمة المرور غير صحيحة.',
        );
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch)
        throw new UnauthorizedException(
          'البريد الالكتروني أو كلمة المرور غير صحيحة.',
        );
      if (!user.emailVerified) {
        const { token } = await this.verificationTokenService.generate(email);
        await this.emailService.sendEmail(email, user.name, token);
        return {
          success: true,
          message: 'تم ارسال رابط التحقق إلى بريدك الإلكتروني.',
        };
      }
      const accessToken = await this.jwtService.signAsync({ sub: user.id });
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return { success: true, message: 'تم تسجيل الدخول بنجاح.' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed login', error);
      throw new InternalServerErrorException(
        'حدث خطأ أثناء تسجيل دخولك. تأكد من الإنترنت وأعد المحاولة.',
      );
    }
  }
  async register(data: RegisterDto) {
    const { name, email, password } = data;
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (existingUser)
      throw new ConflictException('المستخدم موجود بالفعل. برجاء تسجيل الدخول.');
    const hashedPassword = await bcrypt.hash(password, 12);
    try {
      await this.prisma.$transaction(async (tx) => {
        const { token } = await this.verificationTokenService.generate(
          email,
          tx,
        );
        await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        });
        await this.emailService.sendEmail(email, name, token);
      });
      return {
        success: true,
        message: 'تم إرسال رابط التحقق إلى بريدك الإلكتروني.',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new ConflictException('المستخدم موجود بالفعل.');
      else {
        this.logger.error('Failed to register user', error);
        throw new InternalServerErrorException(
          'المستخدم موجود بالفعل. برجاء تسجيل الدخول.',
        );
      }
    }
  }
  async logout(res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { success: true, message: 'تم تسجيل الخروج بنجاح.' };
  }
  async getMe(userId: string) {
    const user: SessionWithRelations | null = await this.prisma.user.findUnique(
      {
        where: { id: userId, emailVerified: true },
        select: userSelect,
      },
    );
    if (!user) throw new NotFoundException('لم نعثر على حسابك.');
    return user;
  }
}
