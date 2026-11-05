import { Prisma } from '@prisma/client';
// =====================================
export const postInclude = {
  author: {
    select: {
      id: true,
      name: true,
      professionalMode: true,
      image: true,
      username: true,
    },
  },
  media: true,
  likes: {
    select: {
      userId: true,
      user: {
        select: {
          image: true,
          name: true,
          professionalMode: true,
          bio: true,
        },
      },
    },
  },
  _count: {
    select: {
      comments: true,
    },
  },
} satisfies Prisma.PostInclude;
