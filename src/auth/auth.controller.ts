import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { type LoginDto, LoginSchema } from './schemas/login.schema.js';
import { type RegisterDto, RegisterSchema } from './schemas/register.schema.js';
import { type Response } from 'express';
// =================================================================================
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    return 'Logout';
  }
}
