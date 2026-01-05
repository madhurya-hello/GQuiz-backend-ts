import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { Announcement } from './entities/announcement.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserProfile } from '../users/entities/user-profile.entity';
import { ClassMember } from '../classes/entities/class-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Announcement, 
      UserProfile, 
      ClassMember, 
    ]),
    NotificationsModule, 
  ],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
})
export class AnnouncementsModule {}