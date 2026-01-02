import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private repo: Repository<Announcement>,
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

    return { announcement_id: savedAnnouncement.id };
  }
}