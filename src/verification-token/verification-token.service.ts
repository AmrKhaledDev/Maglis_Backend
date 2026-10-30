import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
// ===========================================================
@Injectable()
export class VerificationTokenService {
  constructor(private readonly prisma: PrismaService) {}
  async generate(email: string, tx?: Prisma.TransactionClient) {
    const identifier = email?.trim().toLowerCase();
    if (!identifier)
      throw new BadRequestException('الايميل مطلوب لارسال رابط التحقق');
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000);
    const hashedToken = createHash('sha256').update(token).digest('hex');
    const run = async (client: Prisma.TransactionClient) => {
      await client.verificationToken.upsert({
        where: {
          identifier,
        },
        update: {
          token: hashedToken,
          expires,
        },
        create: {
          identifier,
          token: hashedToken,
          expires,
        },
      });
    };
    if (tx) await run(tx);
    else await this.prisma.$transaction(run);
    return { token };
  }
}
