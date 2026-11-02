import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { AuthService } from './auth.service.js';
import { type LoginDto, LoginSchema } from './schemas/login.schema.js';
import { type RegisterDto, RegisterSchema } from './schemas/register.schema.js';
import { extractUserIdFromToken } from '../common/utils/token.helper.js';
import { JwtService } from '@nestjs/jwt';
// =================================================================================
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  login(
    @Body({ schema: LoginSchema }) body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.Login(body, res);
  }

  @Post('register')
  register(@Body({ schema: RegisterSchema }) body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const token = req.cookies.access_token;
    let userId;
    userId = await extractUserIdFromToken(token, this.jwtService);
    return this.authService.getMe(userId);
  }
}
