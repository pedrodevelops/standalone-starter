import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { CookieHelper } from '../helpers/cookie.helper';
import { UserPayload } from '../models/user-payload.model';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: UserPayload | undefined }>();

    const token = this.extractTokenFromContext(context);

    if (!token) {
      throw new UnauthorizedException('Access token missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private extractTokenFromContext(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: UserPayload | undefined }>();

    if (context.getType() === 'http') {
      return CookieHelper.getAccessTokenCookie(request);
    }

    if (context.getType() === 'ws') {
      throw new InternalServerErrorException('Ws guard not implemented');
    }
  }
}
