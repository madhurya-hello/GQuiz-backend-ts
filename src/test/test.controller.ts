import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestItem } from './test.entity';

@Controller('test')
export class TestController {
  constructor(
    @InjectRepository(TestItem)
    private testRepository: Repository<TestItem>,
  ) {}

  // 1. Create a new item (Test writing to DB)
  @Post()
  create(@Body('name') name: string) {
    const newItem = this.testRepository.create({ name });
    return this.testRepository.save(newItem);
  }

  // 2. Get all items (Test reading from DB)
  @Get()
  findAll() {
    return this.testRepository.find();
  }
}