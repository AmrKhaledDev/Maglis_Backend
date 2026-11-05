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
import { type LoginDto, LoginSchema } from './schemas/Login.schema.js';
import { type RegisterDto, RegisterSchema } from './schemas/Register.schema.js';
import { extractUserIdFromToken } from '../common/utils/token.helper.js';
import { JwtService } from '@nestjs/jwt';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetMeResponseDto } from './schemas/GetMeResponse.schema.js';
// =================================================================================
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({
    summary: 'Authenticate user and log in',
  })
  @Post('login')
  login(
    @Body({ schema: LoginSchema }) body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.Login(body, res);
  }

  @ApiOperation({
    summary: 'Register a new user',
  })
  @Post('register')
  register(@Body({ schema: RegisterSchema }) body: RegisterDto) {
    return this.authService.register(body);
  }

  @ApiOperation({
    summary: 'Log out the authenticated user',
  })
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @ApiOkResponse({
    type: GetMeResponseDto,
  })
  @ApiOperation({
    summary: 'Get the authenticated user profile',
  })
  @Get('me')
  async getMe(@Req() req: Request) {
    const token = req.cookies.access_token;
    let userId;
    userId = await extractUserIdFromToken(token, this.jwtService);
    return this.authService.getMe(userId);
  }
}
