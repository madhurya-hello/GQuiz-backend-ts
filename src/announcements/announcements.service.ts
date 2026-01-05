import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UserProfile } from '../users/entities/user-profile.entity';
import { ClassMember, MemberStatus } from '../classes/entities/class-member.entity';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement) private repo: Repository<Announcement>,
    @InjectRepository(UserProfile) private profileRepo: Repository<UserProfile>,
    @InjectRepository(ClassMember) private memberRepo: Repository<ClassMember>,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateAnnouncementDto, userId: number) {
    const newAnnouncement = new Announcement();
    
    newAnnouncement.class_id = +dto.class_id; 
    newAnnouncement.user_id = userId;
    newAnnouncement.quiz_id = dto.quiz_id ? +dto.quiz_id : null;
    newAnnouncement.type = dto.type;
    newAnnouncement.state = dto.state;
    newAnnouncement.title = dto.title;
    newAnnouncement.description = dto.description;
    newAnnouncement.materials = dto.materials;
    newAnnouncement.total_marks = dto.total_marks ? +dto.total_marks : null;
    newAnnouncement.due_at = dto.due_date ? new Date(dto.due_date) : null;
    newAnnouncement.scheduled_at = dto.schedule_time ? new Date(dto.schedule_time) : null;

    const savedAnnouncement = await this.repo.save(newAnnouncement);

    // NOTIFICATION LOGIC
    // 1. Get Sender 
    const senderProfile = await this.profileRepo.findOne({ where: { user_id: userId } });
    const senderName = senderProfile ? `${senderProfile.firstName} ${senderProfile.lastName}` : 'Instructor';
    const senderPhoto = senderProfile?.profilePhotoUrl || null;

    // 2. Get Receivers
    const members = await this.memberRepo.find({
      where: { 
        class_id: +dto.class_id, 
        status: MemberStatus.ACTIVE 
      }
    });

    // 3. Send Loop
    const notificationText = `New Announcement: ${dto.title}`;
    for (const member of members) {
      // Don't notify the person who created it
      if (member.user_id !== userId) {
        await this.notificationsService.send(
          member.user_id, 
          userId, 
          notificationText, 
          senderName, 
          senderPhoto
        );
      }
    }

    return { announcement_id: savedAnnouncement.id };
  }
}