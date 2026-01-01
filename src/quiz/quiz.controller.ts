import { Controller, Post, Body } from '@nestjs/common';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('create')
  create(@Body() createQuizDto: any) {
    return this.quizService.create(createQuizDto);
  }
}