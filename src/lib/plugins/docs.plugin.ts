import { NodeEnv } from '@/config/app.config';
import { authConstants } from '@/modules/auth/auth.constants';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { Tags } from '../constants/docs.constants';
import { getEnv } from '../helpers/env.helper';

const swaggerConfig = new DocumentBuilder()
  .setTitle('Standalone Starter')
  .setDescription(
    `
## Introduction

Welcome to the Standalone Starter API documentation. This API provides a set of endpoints for managing users, profiles, and health checks.

`,
  )
  .setVersion('0.0.1')
  .addCookieAuth(
    authConstants.accessTokenCookieName,
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'Cookie HTTP-only contendo o Bearer token de acesso. Formato: Bearer <token>',
      in: 'cookie',
    },
    'cookie-auth',
  )
  .addTag(Tags.AUTH, `#### Endpoints related to authentication`)
  .addTag(
    Tags.RECOVERY,
    `#### Endpoints for password recovery or account security info management`,
  )
  .build();

export const docsPlugin = (app: INestApplication) => {
  if (getEnv('NODE_ENV') == NodeEnv.TEST) {
    return;
  }
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  app.use(
    '/reference',
    apiReference({
      content: documentFactory,
      metaData: {
        title: 'Standalone Starter | Documentation',
        description: 'Documentation for Standalone Starter API',
        ogTitle: 'Standalone Starter | Documentation',
      },
    }),
  );
};
