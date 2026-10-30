import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { VerificationTokenModule } from '../verification-token/verification-token.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
// ===============================================================
@Module({
  imports: [PrismaModule, VerificationTokenModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
