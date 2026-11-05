import { Prisma } from '@prisma/client';
// ======================================================
export type SavePost = Prisma.SavePostGetPayload<{
  include: {
    post: {
      select: {
        author: {
          select: {
            id: true;
            username: true;
            name: true;
            image: true;
          };
        };
        _count: {
          select: {
            likes: true;
            comments: true;
          };
        };
        media: true;
        content: true;
        id: true;
        privacy: true;
        createdAt: true;
      };
    };
  };
}>;
