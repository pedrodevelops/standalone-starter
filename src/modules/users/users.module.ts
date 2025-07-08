import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { usersEventListeners } from './listeners';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, ...usersEventListeners],
  exports: [UsersService],
})
export class UsersModule {}
