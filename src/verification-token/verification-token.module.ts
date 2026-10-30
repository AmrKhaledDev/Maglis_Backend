import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { VerificationTokenService } from './verification-token.service.js';
// ============================================================================
@Module({
  imports: [PrismaModule],
  providers: [VerificationTokenService],
  exports: [VerificationTokenService],
})
export class VerificationTokenModule {}
