import { Prisma } from '@prisma/client';
// ===========================================
type User = Prisma.UserGetPayload<{
  include: {
    savedPosts: {
      select: { postId: true };
    };
    sender: {
      select: {
        id: true;
        receiverId: true;
      };
    };
    followings: {
      select: {
        followingId: true;
      };
    };
    _count: {
      select: {
        receiver: true;
      };
    };
    friendships: {
      select: {
        friendId: true;
      };
    };
    blocks: {
      select: {
        blockedId: true;
      };
    };
    blocked: {
      select: {
        blockerId: true;
      };
    };
  };
}>;
export type SessionWithRelations = Omit<User, 'password'>;