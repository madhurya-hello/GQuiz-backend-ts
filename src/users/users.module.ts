import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Quiz } from '../quiz/entities/quiz.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, Quiz])], 
  controllers: [UsersController], 
  providers: [UsersService],
  exports: [UsersService], 
})
export class UsersModule {}