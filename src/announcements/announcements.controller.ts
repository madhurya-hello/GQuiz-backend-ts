import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { AuthGuard } from '@nestjs/passport'; 

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt')) 
  create(@Body() createDto: CreateAnnouncementDto, @Req() req: any) {
    const userId = req.user.sub; 
    return this.announcementsService.create(createDto, userId);
  }
}