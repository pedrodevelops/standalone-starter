import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfirmationService } from './confirmation.service';

@Module({
  imports: [PrismaModule],
  providers: [ConfirmationService],
  exports: [ConfirmationService],
})
export class ConfirmationModule {}
