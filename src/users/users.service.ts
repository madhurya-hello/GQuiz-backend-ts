import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserProfile) private profileRepository: Repository<UserProfile>,
    @InjectRepository(Quiz) private quizRepository: Repository<Quiz>,
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
}