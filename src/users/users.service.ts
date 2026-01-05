import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRecentActivity, ActivityEntityType } from './entities/user-recent-activity.entity';
import { QuizAttempt} from '../quiz/entities/quiz-attempt.entity';
import { ClassMember, MemberRole, MemberStatus } from '../classes/entities/class-member.entity';
import { ClassQuiz } from '../classes/entities/class-quiz.entity';
import { Class } from '../classes/entities/class.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserProfile) private profileRepository: Repository<UserProfile>,
    @InjectRepository(Quiz) private quizRepository: Repository<Quiz>,
    @InjectRepository(UserRecentActivity) private activityRepo: Repository<UserRecentActivity>,
    @InjectRepository(QuizAttempt) private attemptRepo: Repository<QuizAttempt>,
    @InjectRepository(Class) private classRepository: Repository<Class>,
    private dataSource: DataSource,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: number, data: Partial<User>) {
    await this.userRepository.update(id, data);
  }
  
  async createWithProfile(userData: Partial<User>, profileData: Partial<UserProfile>): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create User
      const user = this.userRepository.create(userData);
      const savedUser = await queryRunner.manager.save(user);

      // 2. Create Profile
      const profile = this.profileRepository.create({
        ...profileData,
        user_id: savedUser.id
      });
      await queryRunner.manager.save(profile);

      await queryRunner.commitTransaction();
      return savedUser;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const profile = await this.profileRepository.findOne({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    // 1. Update Direct Fields
    if (dto.first_name) profile.firstName = dto.first_name;
    if (dto.middle_name) profile.middleName = dto.middle_name;
    if (dto.last_name) profile.lastName = dto.last_name;
    if (dto.dob) profile.dob = dto.dob;
    if (dto.gender) profile.gender = dto.gender;
    if (dto.phone) profile.phone = dto.phone;
    if (dto.phone_verified !== undefined) profile.phoneVerified = dto.phone_verified;
    if (dto.email_verified !== undefined) profile.emailVerified = dto.email_verified;
    if (dto.profile_photo_url) profile.profilePhotoUrl = dto.profile_photo_url;
    if (dto.profile_banner_url) profile.profileBannerUrl = dto.profile_banner_url;

    // 2. Map JSON Fields (Socials)
    const newSocials = { ...profile.social_links };
    if (dto.linkedin_url !== undefined) newSocials['linkedin'] = dto.linkedin_url;
    if (dto.twitter_url !== undefined) newSocials['twitter'] = dto.twitter_url;
    if (dto.instagram_url !== undefined) newSocials['instagram'] = dto.instagram_url;
    if (dto.facebook_url !== undefined) newSocials['facebook'] = dto.facebook_url;
    profile.social_links = newSocials;

    // 3. Map JSON Fields (Academic)
    const newAcademic = { ...profile.academic_info };
    const academicKeys = [
      'university_name', 'current_semester', 'current_college_section', 'current_cgpa',
      'school_name', 'current_standard', 'current_school_section', 'roll_no'
    ];
    academicKeys.forEach(key => {
      if (dto[key] !== undefined) newAcademic[key] = dto[key];
    });
    profile.academic_info = newAcademic;

    // 4. Map JSON Fields (Preferences)
    const newPrefs = { ...profile.preferences };
    if (dto.hidden_elements) newPrefs['hidden_elements'] = dto.hidden_elements;
    if (dto.notifications) newPrefs['notifications'] = dto.notifications;
    profile.preferences = newPrefs;

    profile.profileLastUpdated = new Date();

    await this.profileRepository.save(profile);

    // 5. Update Starred Quizzes (Many-to-Many)
    if (dto.starred_quizzes) {
      const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['starredQuizzes'] });
      if (user) {
        const quizzes = await this.quizRepository.findBy({ id: In(dto.starred_quizzes) });
        user.starredQuizzes = quizzes;
        await this.userRepository.save(user);
      }
    }

    return { message: 'Profile updated successfully' };
  }

  async findByIdWithRelations(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'starredQuizzes'], 
    });
  }

  async getDashboard(userId: number) {
    // --- PART 1: CLASSES ---
    const recentClassActivities = await this.activityRepo.find({
      where: { user_id: userId, entity_type: ActivityEntityType.CLASS },
      order: { last_interacted_at: 'DESC' },
      take: 20,
      select: ['entity_id'],
    });

    const classIds = [...new Set(recentClassActivities.map((rc) => rc.entity_id))];
    let classesData: any[] = [];

    if (classIds.length > 0) {
      const classes = await this.classRepository.find({
        where: { id: In(classIds) },
        relations: ['owner', 'owner.profile'],
      });

      const allMembers = await this.dataSource.getRepository(ClassMember).find({
        where: { class_id: In(classIds) },
      });

      const allClassQuizzes = await this.dataSource.getRepository(ClassQuiz).find({
        where: { class_id: In(classIds) },
        select: ['class_id', 'quiz_id'],
      });

      
      // Map<class_id, ClassMember[]>
      const membersMap = new Map<number, ClassMember[]>();
      for (const m of allMembers) {
        if (!membersMap.has(m.class_id)) membersMap.set(m.class_id, []);
        membersMap.get(m.class_id)!.push(m);
      }

      // Map<class_id, ClassQuiz[]>
      const quizzesMap = new Map<number, ClassQuiz[]>();
      for (const q of allClassQuizzes) {
        if (!quizzesMap.has(q.class_id)) quizzesMap.set(q.class_id, []);
        quizzesMap.get(q.class_id)!.push(q);
      }

      classesData = classIds.map((classId) => {
        const cls = classes.find((c) => c.id === classId);
        if (!cls) return null;

        const members = membersMap.get(cls.id) || [];
        const quizzesInvolved = quizzesMap.get(cls.id) || [];

        const ownerName = cls.owner?.profile 
          ? `${cls.owner.profile.firstName} ${cls.owner.profile.lastName}`
          : 'Unknown Owner';
          
        const ownerPhoto = cls.owner?.profile?.profilePhotoUrl || null;

        return {
          class_id: cls.id.toString(),
          date_created: cls.date_created,
          owner_id: cls.owner_id.toString(),
          owner_name: ownerName,
          owner_photo_url: ownerPhoto,
          name: cls.name,
          description: cls.description,
          active_members: members
            .filter((m) => m.status === MemberStatus.ACTIVE)
            .map((m) => m.user_id),
          past_members: members
            .filter((m) => m.status === MemberStatus.PAST)
            .map((m) => m.user_id),
          admins: members
            .filter((m) => m.role === MemberRole.ADMIN && m.status === MemberStatus.ACTIVE)
            .map((m) => m.user_id),
          waiting_list: members
            .filter((m) => m.status === MemberStatus.WAITING)
            .map((m) => m.user_id),
          allowed_email_domains: cls.allowed_email_domains || [],
          allowed_emails: cls.allowed_emails || [],
          quizzes_involved: quizzesInvolved.map((q) => q.quiz_id),
          approval_required: cls.approval_required,
          banner_type: cls.banner_type,
          banner_url: cls.banner_url,
          purpose: cls.purpose,
          category: cls.category,
          subject: cls.subject,
        };
      }).filter(item => item !== null);
    }

    // --- PART 2: QUIZZES ---
    const recentQuizActivities = await this.activityRepo.find({
      where: { user_id: userId, entity_type: ActivityEntityType.QUIZ },
      order: { last_interacted_at: 'DESC' },
      take: 20,
      select: ['entity_id'],
    });

    const quizIds = [...new Set(recentQuizActivities.map((rq) => rq.entity_id))];
    let quizzesData: any[] = [];

    if (quizIds.length > 0) {
      const quizzes = await this.quizRepository.find({
        where: { id: In(quizIds) },
        relations: ['creator', 'creator.profile'],
      });

      const allAttempts = await this.attemptRepo.find({
        where: { 
           user_id: userId,
           quiz_id: In(quizIds) 
        }
      });

      const attemptsMap = new Map<number, QuizAttempt>();
      for (const a of allAttempts) {
        attemptsMap.set(a.quiz_id, a);
      }

      quizzesData = quizIds.map((quizId) => {
        const quiz = quizzes.find((q) => q.id === quizId);
        if (!quiz) return null;

        const isExaminer = quiz.user_id === userId;
        const now = new Date();
        let status = 'IS_SCHEDULED';
        if (now > quiz.validity_quiz_end) status = 'IS_FINISHED';
        else if (now >= quiz.validity_quiz_start && now <= quiz.validity_quiz_end) status = 'IS_LIVE';

        const attempt = attemptsMap.get(quiz.id);

        const examinerPhoto = quiz.creator?.profile?.profilePhotoUrl || null;

        return {
          quiz_id: quiz.id.toString(),
          name: quiz.name,
          is_examiner: isExaminer,
          description: quiz.description,
          total_marks: quiz.total_marks || 0,
          status: status,
          validity_quiz_start: quiz.validity_quiz_start,
          validity_quiz_end: quiz.validity_quiz_end,
          quiz_duration: quiz.quiz_duration,
          is_result_declared: !!quiz.result_declared,
          result_declare: quiz.result_declared,
          marks_secured: attempt ? attempt.score : 0, 
          examiner_photo_url: examinerPhoto,
        };
      }).filter(item => item !== null);
    }

    return {
      classes: classesData,
      quizzes: quizzesData,
    };
  }

  async logActivity(userId: number, type: ActivityEntityType, entityId: number) {
    return this.activityRepo.upsert(
      {
        user_id: userId,
        entity_type: type,
        entity_id: entityId,
        last_interacted_at: new Date(),
      },
      ['user_id', 'entity_type', 'entity_id']
    );
  }
}