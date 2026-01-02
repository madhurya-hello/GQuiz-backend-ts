import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Class } from './entities/class.entity';
import { ClassMember, MemberRole, MemberStatus } from './entities/class-member.entity';
import { ClassQuiz } from './entities/class-quiz.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { Quiz } from '../quiz/entities/quiz.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class) private classRepo: Repository<Class>,
    @InjectRepository(Quiz) private quizRepo: Repository<Quiz>,
    private dataSource: DataSource, 
  ) {}

  async create(dto: CreateClassDto, ownerId: number) {

    // Validate Quiz IDs
    if (dto.quizzes_involved && dto.quizzes_involved.length > 0) {
        const count = await this.quizRepo.count({
            where: { id: In(dto.quizzes_involved) }
        });
        if (count !== dto.quizzes_involved.length) {
            throw new BadRequestException('One or more quiz IDs in "quizzes_involved" are invalid.');
        }
    }

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

      // Prepare Members
      const membersToSave: Partial<ClassMember>[] = [];

      // Helper to push members
      const addMember = (userId: number, role: MemberRole, status: MemberStatus) => {
        membersToSave.push({ class_id: savedClass.id, user_id: userId, role, status });
      };

      // Process Admins (Active + Admin Role)
      dto.admins.forEach(id => addMember(id, MemberRole.ADMIN, MemberStatus.ACTIVE));

      // Process Active Members (Active + Member Role) - Exclude if already added as admin
      dto.active_members.forEach(id => {
        if (!dto.admins.includes(id)) {
          addMember(id, MemberRole.MEMBER, MemberStatus.ACTIVE);
        }
      });

      // Process Waiting List
      dto.waiting_list.forEach(id => addMember(id, MemberRole.MEMBER, MemberStatus.WAITING));

      // Process Past Members
      dto.past_members.forEach(id => addMember(id, MemberRole.MEMBER, MemberStatus.PAST));

      await queryRunner.manager.insert(ClassMember, membersToSave);

      // Prepare Quizzes
      const quizzesToSave = dto.quizzes_involved.map(quizId => ({
        class_id: savedClass.id,
        quiz_id: quizId
      }));

      if (quizzesToSave.length > 0) {
        await queryRunner.manager.insert(ClassQuiz, quizzesToSave);
      }

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