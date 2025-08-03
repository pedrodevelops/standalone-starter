import { UserRole } from '../enums/user-role.enum';

export type IUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
};

export class User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
}
