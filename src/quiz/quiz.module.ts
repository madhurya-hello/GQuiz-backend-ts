import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserProfile } from '../users/entities/user-profile.entity';
import { ClassMember } from '../classes/entities/class-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfile, ClassMember]), 
    NotificationsModule
  ],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}