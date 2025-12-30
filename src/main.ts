import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🟢 ADD THIS LINE: Enable CORS to allow your mobile app to talk to the server
  app.enableCors();
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
