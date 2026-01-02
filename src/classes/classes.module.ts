import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { Class } from './entities/class.entity';
import { ClassMember } from './entities/class-member.entity';
import { ClassQuiz } from './entities/class-quiz.entity';
import { Quiz } from '../quiz/entities/quiz.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Class, ClassMember, ClassQuiz, Quiz])],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}