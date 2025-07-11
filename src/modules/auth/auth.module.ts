import { PasswordHelper } from '@/lib/helpers/password.helper';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { authEventListeners } from './listeners';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordHelper, ...authEventListeners],
})
export class AuthModule {}
