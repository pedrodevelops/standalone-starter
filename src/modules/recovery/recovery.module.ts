import { PasswordHelper } from '@/lib/helpers/password.helper';
import { Module } from '@nestjs/common';
import { ConfirmationModule } from '../confirmation/confirmation.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { RecoveryController } from './recovery.controller';
import { RecoveryService } from './recovery.service';

@Module({
  imports: [UsersModule, ConfirmationModule, PrismaModule],
  controllers: [RecoveryController],
  providers: [RecoveryService, PasswordHelper],
  exports: [],
})
export class RecoveryModule {}
