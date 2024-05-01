import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Machine Test')
    .setDescription('Machine Test API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Set up validation pipe globally
  app.useGlobalPipes(new ValidationPipe());

  const port = 4000
  await app.listen(port);

  console.log(`Server started at  http://localhost:${port}/api`)
}
bootstrap();