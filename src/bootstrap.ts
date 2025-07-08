import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { docsPlugin } from './lib/plugins/docs.plugin';

export async function bootstrap(predefinedApp?: INestApplication) {
  const app = predefinedApp ?? (await NestFactory.create(AppModule));

  app.use(cookieParser());
  app.setGlobalPrefix('/api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  docsPlugin(app);

  return app;
}
