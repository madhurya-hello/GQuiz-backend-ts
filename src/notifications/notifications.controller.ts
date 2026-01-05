import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getMyNotifications(@Req() req: any) {
    const userId = req.user.sub;
    return this.service.fetchAndMarkRead(userId);
  }
}