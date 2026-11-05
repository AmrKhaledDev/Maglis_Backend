import { Prisma } from '@prisma/client';
// =======================================
export const SavePostInclude = {
  post: {
    select: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
      media: true,
      content: true,
      id: true,
      privacy: true,
      createdAt: true,
    },
  },
} satisfies Prisma.SavePostInclude;
