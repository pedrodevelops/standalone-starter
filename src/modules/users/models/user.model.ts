import { UserRole } from '../enums/user-role.enum';

export type User = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
};
