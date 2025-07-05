import { UserRole } from '@/modules/users/enums/user-role.enum';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/role.decorator';
import { UserPayload } from '../models/user-payload.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = this.extractUserFromContext(context);

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }

  /**
   * Handles the context nature where the user needs to be extracted from
   */
  private extractUserFromContext(
    context: ExecutionContext,
  ): UserPayload | undefined {
    const contextType = context.getType();

    if (contextType === 'http') {
      const httpRequest = context.switchToHttp().getRequest();
      return httpRequest.user as UserPayload | undefined;
    }

    if (contextType === 'ws') {
      const wsClient = context.switchToWs().getClient();
      return wsClient.user as UserPayload | undefined;
    }

    return undefined;
  }
}
