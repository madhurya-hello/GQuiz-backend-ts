import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Class } from './entities/class.entity';
import { ClassMember, MemberRole, MemberStatus } from './entities/class-member.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UserRecentActivity, ActivityEntityType } from '../users/entities/user-recent-activity.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class) private classRepo: Repository<Class>,
    private dataSource: DataSource, 
  ) {}

  async create(dto: CreateClassDto, ownerId: number) {

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the Class entity
      const newClass = this.classRepo.create({
        name: dto.name,
        description: dto.description,
        banner_type: dto.banner_type,
        banner_url: dto.banner_url,
        purpose: dto.purpose,
        category: dto.category,
        subject: dto.subject,
        approval_required: dto.approval_required,
        owner_id: ownerId,
        allowed_email_domains: dto.allowed_email_domains,
        allowed_emails: dto.allowed_emails,
        restricted_email_domains: dto.restricted_email_domains,
        restricted_emails: dto.restricted_emails,
        date_created: new Date(dto.date_created),
      });

      const savedClass = await queryRunner.manager.save(newClass);

      // Add the Owner as the sole Admin/Active Member
      const ownerMember = new ClassMember();
      ownerMember.class_id = savedClass.id;
      ownerMember.user_id = ownerId;
      ownerMember.role = MemberRole.ADMIN;
      ownerMember.status = MemberStatus.ACTIVE;

      await queryRunner.manager.save(ClassMember, ownerMember);

      // Log Recent Activity for the Owner
      const activity = new UserRecentActivity();
      activity.user_id = ownerId;
      activity.entity_type = ActivityEntityType.CLASS;
      activity.entity_id = savedClass.id;
      activity.last_interacted_at = new Date();

      await queryRunner.manager.save(UserRecentActivity, activity);

      // Commit
      await queryRunner.commitTransaction();
      return { message: 'Class created successfully', class_id: savedClass.id };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}