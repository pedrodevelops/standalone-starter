import { UserRole } from '@/modules/users/enums/user-role.enum';

export type UserPayload = {
  sub: number;
  email: string;
  role: UserRole;
};
