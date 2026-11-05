import { StandardSchemaValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { cleanupOpenApiDoc } from 'nestjs-zod';
// =========================================================
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Maglis Backend')
    .setDescription(
      'A comprehensive RESTful API powering Maglis, a social media platform for connecting users, sharing content, and interacting in real time.',
    )
    .addCookieAuth('access_token')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, cleanupOpenApiDoc(document));
  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
