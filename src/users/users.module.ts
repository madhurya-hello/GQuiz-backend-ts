import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { UserRecentActivity } from './entities/user-recent-activity.entity'; 
import { QuizAttempt } from '../quiz/entities/quiz-attempt.entity';
import { Class } from '../classes/entities/class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      UserProfile, 
      Quiz, 
      UserRecentActivity, 
      QuizAttempt,
      Class       
    ])
  ], 
  controllers: [UsersController], 
  providers: [UsersService],
  exports: [UsersService], 
})
export class UsersModule {}