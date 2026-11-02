import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// ======================================
export async function extractUserIdFromToken(
  token: string,
  jwtService: JwtService,
): Promise<string> {
  const logger = new Logger('TokenHelper');
  try {
    if (!token)
      throw new UnauthorizedException(
        'يلزم تسجيل الدخول للوصول إلى هذا المورد.',
      );
    let payload;
    payload = await jwtService.verifyAsync<{ sub: string }>(token);
    return payload.sub;
  } catch (error) {
    logger.error(error);
    throw new UnauthorizedException('التوكن غير صالح أو منتهي الصلاحية.');
  }
}
