import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { loaders } from './config';
import { getEnv } from './lib/helpers/env.helper';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/guards/jwt.guard';
import { RecoveryModule } from './modules/recovery/recovery.module';

const mailerModule = MailerModule.forRoot({
  transport: 'smtps://user@domain.com:pass@smtp.domain.com',
  template: {
    dir: __dirname + '/templates',
    adapter: new PugAdapter(),
    options: {
      strict: true,
    },
  },
});

const configModule = ConfigModule.forRoot({
  cache: true,
  isGlobal: true,
  load: loaders,
});

const jwtModule = JwtModule.register({
  global: true,
  secret: getEnv('JWT_SECRET'),
});

const serveStaticModule = ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', 'public'),
  serveStaticOptions: {
    extensions: ['ico'],
  },
});

const pluginModules = [
  mailerModule,
  configModule,
  jwtModule,
  serveStaticModule,
];

const domainModules = [AuthModule, RecoveryModule];

const globalGuard = {
  provide: APP_GUARD,
  useClass: AuthGuard,
};

@Module({
  imports: [...pluginModules, ...domainModules],
  controllers: [],
  providers: [globalGuard],
})
export class AppModule {}
