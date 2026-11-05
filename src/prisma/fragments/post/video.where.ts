import { Prisma } from '@prisma/client';
// ====================================
export const videoWhere = (userId: string) =>
  ({
    media: {
      some: {
        type: 'VIDEO',
      },
    },
    author: {
      emailVerified: true,
      professionalMode: true,
      blockedByUsers: {
        none: { blockerId: userId },
      },
      blockedUsers: {
        none: { blockedId: userId },
      },
      isPermanentlyBanned: false,
      banExpiresAt: null,
    },
    privacy: 'PUBLIC',
  }) satisfies Prisma.PostWhereInput;
