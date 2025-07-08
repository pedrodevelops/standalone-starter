import { PasswordHelper } from '@/lib/helpers/password.helper';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import {
  USER_CREATED_EVENT,
  UserCreatedEvent,
} from '../users/events/user-created.event';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { Access } from './models/access.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordHelper: PasswordHelper,
    private readonly eventEmitter: EventEmitter2,
    private readonly mailerService: MailerService,
  ) {}

  async signIn({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<User> {
    const [user, storedPassword] = await Promise.all([
      await this.usersService.getByEmailOrThrow(email),
      await this.passwordHelper.getByEmailOrThrow(email),
    ]);

    const passwordMatch = Boolean(
      await this.passwordHelper.compare(password, storedPassword.hash),
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('password.invalid');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async signUp({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    await this.usersService.throwIfUniqueFieldsConflict({
      email,
    });

    const user = await this.usersService.create({
      email,
      name,
      password: {
        create: {
          hash: await this.passwordHelper.hash(password),
        },
      },
    });

    this.eventEmitter.emit(
      USER_CREATED_EVENT,
      new UserCreatedEvent({ email, userName: user.name }),
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async refreshToken(refreshToken: string): Promise<Access> {
    const payload = await this.jwtService.verifyAsync(refreshToken);
    const user = await this.usersService.getByIdOrThrow(payload.id);

    const { access_token, refresh_token } = await this.grantAccess(user);

    return {
      access_token,
      refresh_token,
    };
  }

  async grantAccess(user: User): Promise<Access> {
    const access_token = await this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      { expiresIn: '1d' },
    );

    const refresh_token = await this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      {
        expiresIn: '28d',
      },
    );

    return {
      access_token,
      refresh_token,
    };
  }
}
