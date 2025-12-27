import { Controller, Get } from '@nestjs/common';

@Controller('test') // This sets the base route to /test
export class TestController {

  @Get('hello') // This sets the endpoint to /test/hello
  getHello(): string {
    return 'This is my first NestJS API response!';
  }

  @Get('data') // This sets the endpoint to /test/data
  getJsonData() {
    return { 
      status: 'success', 
      message: 'API is working', 
      timestamp: new Date() 
    };
  }
}