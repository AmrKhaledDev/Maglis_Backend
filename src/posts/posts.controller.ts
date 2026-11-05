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
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { extractUserIdFromToken } from '../common/utils/token.helper.js';
import { LikesService } from './likes/likes.service.js';
import { PostsService } from './posts.service.js';
import { SavePostService } from './save-post/save-post.service.js';
import {
  type CreatePostDto,
  CreatePostSchema,
} from './schemas/CreatePost.schema.js';
import { PostResponseDto } from './schemas/PostResponse.schema.js';
import { SavePostResponseDto } from './schemas/SavePostResponse.schema.js';
// =======================================================
@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly likesService: LikesService,
    private readonly jwtService: JwtService,
    private readonly savePostService: SavePostService,
  ) {}

  @ApiOperation({
    summary: 'Get all posts',
  })
  @ApiOkResponse({
    type: [PostResponseDto],
  })
  @Get()
  async getPosts(@Req() req: Request) {
    const token = req.cookies.access_token;
    const userId = await extractUserIdFromToken(token, this.jwtService);
    return this.postsService.getPosts(userId);
  }

  @ApiOperation({
    summary: 'Get all saved posts',
  })
  @ApiOkResponse({
    type: [SavePostResponseDto],
  })
  @Get('saved')
  async getSavedPosts(@Req() req: Request) {
    const token = req.cookies.access_token;
    const userId = await extractUserIdFromToken(token, this.jwtService);
    return this.savePostService.getSavedPosts(userId);
  }

  @Get(':postId')
  async getPost(@Param('postId') postId: string, @Req() req: Request) {
    if (!postId) throw new BadRequestException('معرف المنشور مطلوب.');
    const token = req.cookies.access_token;
    const userId = await extractUserIdFromToken(token, this.jwtService);
    return this.postsService.getPost(userId, postId);
  }

  @ApiOperation({
    summary: 'Create a new post',
  })
  @Post('create')
  async create(
    @Body({ schema: CreatePostSchema }) body: CreatePostDto,
    @Req() req: Request,
  ) {
    const token = req.cookies.access_token;
    const userId = await extractUserIdFromToken(token, this.jwtService);
    return this.postsService.create(body, userId);
  }

  @ApiOperation({
    summary: 'Update an existing post',
  })
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

  @ApiOperation({
    summary: 'Delete a post',
  })
  @Delete('delete/:postId')
  async delete(@Param('postId') postId: string, @Req() req: Request) {
    if (!postId) throw new BadRequestException('معرف المنشور مطلوب.');
    const token = req.cookies.access_token;
    const userId = await extractUserIdFromToken(token, this.jwtService);
    return this.postsService.delete(userId, postId);
  }

  @ApiOperation({
    summary: 'Get all videos',
  })
  @ApiOkResponse({
    type: PostResponseDto,
  })
  @Get('videos')
  async videos(@Req() req: Request) {
    const token = req.cookies.access_token;
    const userId = await extractUserIdFromToken(token, this.jwtService);
    return this.postsService.getVideos(userId);
  }

  @ApiOperation({
    summary: 'Like a post',
  })
  @Post(':postId/like')
  async likePost(@Param('postId') postId: string, @Req() req: Request) {
    const token = req.cookies.access_token;
    const userId = await extractUserIdFromToken(token, this.jwtService);
    return this.likesService.likePost(postId, userId);
  }

  @ApiOperation({
    summary: 'Save Post',
  })
  @Post(':postId/save')
  async savePost(@Req() req: Request, @Param('postId') postId: string) {
    const token = req.cookies.access_token;
    const userId = await extractUserIdFromToken(token, this.jwtService);
    if (!postId) throw new BadRequestException('معرف المنشور مطلوب.');
    return this.savePostService.savePost(userId, postId);
  }
}
