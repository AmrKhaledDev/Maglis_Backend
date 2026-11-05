import { MediaType, Privacy } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
// =======================================
const SavePostReponseSchema = z.object({
  id: z.string(),
  postId: z.string(),
  userId: z.string(),
  post: z.object({
    author: z.object({
      id: z.string(),
      username: z.string(),
      name: z.string(),
      image: z.string().nullable(),
    }),
    _count: z.object({
      likes: z.number().int(),
      comments: z.number().int(),
    }),
    media: z.array(
      z.object({
        id: z.string(),
        url: z.string(),
        type: z.enum(MediaType),
        postId: z.string(),
      }),
    ),
    content: z.string(),
    id: z.string(),
    privacy: z.enum(Privacy),
    createdAt:z.iso.datetime()
  }),
  createdAt: z.iso.datetime(),
});

export class SavePostResponseDto extends createZodDto(SavePostReponseSchema) {}
