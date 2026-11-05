import { Prisma } from '@prisma/client';
// ====================================
export const userSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  cover: true,
  bio: true,
  username: true,
  role: true,
  professionalMode: true,
  city: true,
  savedPosts: {
    select: {
      postId: true,
    },
  },
  sender: {
    select: {
      id: true,
      receiverId: true,
    },
  },
  followings: {
    select: {
      followingId: true,
    },
  },
  _count: {
    select: {
      receiver: true,
    },
  },
  friendships: {
    select: {
      friendId: true,
    },
  },
  blockedUsers: {
    select: {
      blockedId: true,
    },
  },
  blockedByUsers: {
    select: {
      blockerId: true,
    },
  },
} satisfies Prisma.UserSelect;
