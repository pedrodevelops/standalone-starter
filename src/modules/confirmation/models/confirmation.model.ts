import { ConfirmationType } from 'generated/prisma';

export type Confirmation = {
  id: number;
  token: string;
  type: ConfirmationType;
  userId: number;
};
