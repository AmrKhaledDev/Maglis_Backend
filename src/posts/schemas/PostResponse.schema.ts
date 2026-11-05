import { MediaType, Privacy } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
// ====================================================
const PostMediaSchema = z.object({
  id: z.string(),
  url: z.string(),
  type: z.enum(MediaType),
  postId: z.string(),
});

const PostLikeSchema = z.object({
  userId: z.string(),
  user: z.object({
    image: z.string().nullable(),
    name: z.string(),
    professionalMode: z.boolean(),
    bio: z.string().nullable(),
  }),
});

export const PostResponseSchema = z.object({
  id: z.string(),
  content: z.string().nullable(),
  privacy: z.enum(Privacy),
  commentsDisabled: z.boolean(),
  isPinnedToProfile: z.boolean(),
  showMediaInProfile: z.boolean(),
  authorId: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    professionalMode: z.boolean(),
    image: z.string().nullable(),
    username: z.string().nullable(),
  }),
  media: z.array(PostMediaSchema),
  likes: z.array(PostLikeSchema),
  _count: z.object({ comments: z.number().int() }),
});

export class PostResponseDto extends createZodDto(PostResponseSchema) {}
