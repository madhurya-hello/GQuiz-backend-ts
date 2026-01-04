import { Controller, Patch, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { ActivityEntityType } from './entities/user-recent-activity.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.sub;
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    const userId = req.user.sub;
    return this.usersService.getDashboard(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('activity/log')
  async logActivity(
    @Req() req: any, 
    @Body() body: { type: ActivityEntityType, id: number }
  ) {
    const userId = req.user.sub;
    return this.usersService.logActivity(userId, body.type, body.id);
  }
}