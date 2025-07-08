import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { loaders } from './config';
import { getEnv } from './lib/utils/get-env.utils';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { RecoveryModule } from './modules/recovery/recovery.module';
import { UsersModule } from './modules/users/users.module';

const pluginModules = [
  MailerModule.forRoot({
    transport: getEnv('MAILER_TRANSPORT'),
    defaults: {
      from: '"No Reply" <noreply@your-app.com>',
    },
    template: {
      dir: join(__dirname, 'templates'),
      adapter: new PugAdapter(),
      options: {
        strict: true,
      },
    },
  }),
  ConfigModule.forRoot({
    cache: true,
    isGlobal: true,
    load: loaders,
  }),
  JwtModule.register({
    global: true,
    secret: getEnv('JWT_SECRET'),
  }),
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public'),
    serveStaticOptions: {
      extensions: ['ico'],
    },
  }),
  EventEmitterModule.forRoot({
    global: true,
    maxListeners: 10,
  }),
];

const domainModules = [AuthModule, RecoveryModule, UsersModule];

const sortedGlobalGuards = [
  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
];

@Module({
  imports: [...pluginModules, ...domainModules],
  providers: [...sortedGlobalGuards],
})
export class AppModule {}
