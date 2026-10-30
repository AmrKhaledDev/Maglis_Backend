import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
// ===========================================
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString)
      throw new Error('حدث خطأ أثناء الإتصال بقاعدة البيانات.');
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }
}
