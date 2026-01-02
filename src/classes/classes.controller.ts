import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { AuthGuard } from '@nestjs/passport'; 

@Controller('class')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt')) 
  create(@Body() createClassDto: CreateClassDto, @Req() req: any) {
    const userId = req.user.sub;
    return this.classesService.create(createClassDto, userId); 
  }
}