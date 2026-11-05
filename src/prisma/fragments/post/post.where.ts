import { Prisma } from '@prisma/client';
// =========================================
export const postWhere = (userId: string) =>
  ({
    OR: [
      { privacy: 'PUBLIC' },
      { privacy: 'PRIVATE', authorId: userId },
      {
        privacy: 'FRIENDS',
        author: {
          friendships: {
            some: {
              friendId: userId,
            },
          },
        },
      },
      { privacy: 'FRIENDS', authorId: userId },
    ],
    hiddenPosts: {
      none: {
        userId,
      },
    },
    author: {
      blockedByUsers: {
        none: {
          blockerId: userId,
        },
      },
      blockedUsers: {
        none: {
          blockedId: userId,
        },
      },
    },
  }) satisfies Prisma.PostWhereInput;
