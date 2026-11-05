import { Role } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
// ======================================
const GetMeSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  cover: z.string(),
  bio: z.string(),
  username: z.string(),
  role: z.enum(Role),
  professionalMode: z.boolean(),
  city: z.string().nullable(),
  savedPosts: z.array(
    z.object({
      postId: z.string(),
    }),
  ),
  sender: z.array(
    z.object({
      id: z.string(),
      receiverId: z.string(),
    }),
  ),
  followings: z.array(z.object({ followingId: z.string() })),
  _count: z.object({
    receiver: z.number().int(),
  }),
  friendships: z.array(
    z.object({
      friendId: z.string(),
    }),
  ),
  blockedUsers: z.array(
    z.object({
      blockedId: z.string(),
    }),
  ),
  blockedByUsers: z.array(z.object({ blockerId: z.string() })),
});

export class GetMeResponseDto extends createZodDto(GetMeSchema) {}
