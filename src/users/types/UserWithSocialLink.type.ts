import { Prisma } from '@prisma/client';
// =============================================================
export type UserWithSocialLink = Prisma.UserGetPayload<{
  include: {
    socialLinks: true;
  };
  omit: { password: true };
}>;
