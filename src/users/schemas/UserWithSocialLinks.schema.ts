import { Gender, Role, SocialPlatform } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
// ====================================================
const UserWithSocialLinksSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),

  image: z.string().nullable(),
  cover: z.string().nullable(),
  bio: z.string().nullable(),
  username: z.string().nullable(),
  gender: z.enum(Gender).nullable(),
  nickname: z.string().nullable(),
  banExpiresAt: z.iso.datetime().nullable(),
  banReason: z.string().nullable(),
  education: z.string().nullable(),
  jobTitle: z.string().nullable(),
  city: z.string().nullable(),

  isPermanentlyBanned: z.boolean(),
  lastSeenAt: z.iso.datetime(),
  postsCount: z.number().int(),
  friendsCount: z.number().int(),
  followersCount: z.number().int(),
  followingCount: z.number().int(),
  role: z.enum(Role),
  professionalMode: z.boolean(),
  socialLinks: z.array(
    z.object({
      id: z.string(),
      link: z.string(),
      platform: z.enum(SocialPlatform),
      userId: z.string(),
    }),
  ),
});

export class UserWithSocialLinksDto extends createZodDto(
  UserWithSocialLinksSchema,
) {}
