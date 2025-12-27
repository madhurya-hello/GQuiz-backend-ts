import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestController } from './test/test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestItem } from './test/test.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',      
      password: 'touchmedaddy@nytime:P', 
      database: 'classroom_app',
      entities: [__dirname + '/**/*.entity{.ts,.js}'], 
      synchronize: true, 
    }),
    TypeOrmModule.forFeature([TestItem]),
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}
