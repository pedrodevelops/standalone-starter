import { UserRole } from '@/modules/users/enums/user-role.enum';
import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export type UserFromRequest = {
  id: number;
  email: string;
  role: UserRole;
};

/**
 * Gets the current user previously attached by JwtGuard,
 * should not be used inside public controllers/handlers
 * @throws InternalServerErrorException if the user is not attached
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      throw new InternalServerErrorException('A unexpected error occurred', {
        cause: new Error(
          'CurrentUser being called inside a non-protected controller',
        ),
      });
    }

    return request.user as UserFromRequest;
  },
);
