import { Prisma } from '@prisma/client';
// =======================================
export const SavePostWhere = (userId: string) =>
  ({
    userId,
    post: {
      OR: [
        { privacy: 'PUBLIC' },
        {
          privacy: 'FRIENDS',
          author: {
            friendships: {
              some: { friendId: userId },
            },
          },
        },
        { privacy: 'FRIENDS', authorId: userId },
        { privacy: 'FRIENDS', authorId: userId },
      ],
    },
  }) satisfies Prisma.SavePostWhereInput;
