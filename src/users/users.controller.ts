import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service.js';
// =========================================
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':userId')
  getProfile(@Param('userId') userId: string) {
    return this.usersService.getProfile(userId);
  }
}
