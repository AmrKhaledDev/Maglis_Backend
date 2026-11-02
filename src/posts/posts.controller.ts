import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { extractUserIdFromToken } from '../common/utils/token.helper.js';
import { PostsService } from './posts.service.js';
import {
  type CreatePostDto,
  CreatePostSchema,
} from './schemas/create-post.schema.js';
// =======================================================
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  async getPosts(@Req() req: Request) {
    const token = req.cookies.access_token;
    const userId = await extractUserIdFromToken(token, this.jwtService);
    return this.postsService.getPosts(userId);
  }

  @Post('create')
  async create(
    @Body({ schema: CreatePostSchema }) body: CreatePostDto,
    @Req() req: Request,
  ) {
    const token = req.cookies.access_token;
    const userId = await extractUserIdFromToken(token, this.jwtService);
    return this.postsService.create(body, userId);
  }

  @Patch('edit/:postId')
  async update(
    @Body({ schema: CreatePostSchema })
    body: CreatePostDto,
    @Req() req: Request,
    @Param('postId') postId: string,
  ) {
    const token = req.cookies.access_token;
    const userId = await extractUserIdFromToken(token, this.jwtService);
    if (!postId) throw new BadRequestException('معرف المنشور مطلوب.');
    return this.postsService.create(body, userId, postId);
  }

  @Delete('delete/:postId')
  async delete(@Param('postId') postId: string, @Req() req: Request) {
    if (!postId) throw new BadRequestException('معرف المنشور مطلوب.');
    const token = req.cookies.access_token;
    const userId = await extractUserIdFromToken(token, this.jwtService);
    return this.postsService.delete(userId, postId);
  }
}
