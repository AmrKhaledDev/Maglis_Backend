import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';
import { LikesService } from './likes/likes.service.js';
import { PostAccessModule } from '../common/services/post-access/post-access.module.js';
import { SavePostService } from './save-post/save-post.service.js';
// ======================================================
@Module({
  imports: [PrismaModule, PostAccessModule],
  controllers: [PostsController],
  providers: [PostsService, LikesService, SavePostService],
})
export class PostsModule {}
