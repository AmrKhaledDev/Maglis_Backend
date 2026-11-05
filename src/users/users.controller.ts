import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserWithSocialLinksDto } from './schemas/UserWithSocialLinks.schema.js';
// =========================================
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Get user profile',
  })
  @ApiOkResponse({
    type: UserWithSocialLinksDto,
  })
  @Get(':userId')
  getProfile(@Param('userId') userId: string) {
    return this.usersService.getProfile(userId);
  }
}
