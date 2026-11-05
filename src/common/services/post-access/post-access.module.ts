import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module.js';
import { PostAccessService } from './post-access.service.js';
// ==========================================================
@Module({
  imports: [PrismaModule],
  providers: [PostAccessService],
  exports: [PostAccessService],
})
export class PostAccessModule {}
