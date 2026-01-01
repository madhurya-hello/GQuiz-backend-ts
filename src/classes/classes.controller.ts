import { Controller, Post, Body } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';

@Controller('class')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post('create')
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }
}