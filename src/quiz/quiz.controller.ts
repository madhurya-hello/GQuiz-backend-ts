import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { AuthGuard } from '@nestjs/passport'; 

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt')) 
  create(@Body() createQuizDto: any, @Req() req: any) {
    const userId = req.user.sub; 
    return this.quizService.create(createQuizDto, userId);
  }
}