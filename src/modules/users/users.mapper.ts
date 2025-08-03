import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { UserDTO } from './dto/user.dto';
import { UserRole } from './enums/user-role.enum';
import { User } from './models/user.model';
import { USER_SELECT } from './users.service';

type UserFromPrisma = Prisma.UserGetPayload<{
  select: typeof USER_SELECT;
}>;

@Injectable()
export class UsersMapper {
  constructor() {}

  toModel(user: UserFromPrisma): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: UserRole[user.role],
    };
  }

  toDTO(user: UserFromPrisma): UserDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: UserRole[user.role],
    };
  }
}
