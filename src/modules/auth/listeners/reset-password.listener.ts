import { UsersService } from '@/modules/users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  RESET_PASSWORD_EVENT,
  ResetPasswordEvent,
} from '../events/reset-password.event';

@Injectable()
export class ResetPasswordListener {
  constructor(
    private readonly mailer: MailerService,
    private readonly usersService: UsersService,
  ) {}

  @OnEvent(RESET_PASSWORD_EVENT, { async: true })
  async handle(event: ResetPasswordEvent) {
    const user = await this.usersService.getByIdOrThrow(event.userId);

    await this.mailer.sendMail({
      to: user.email,
      from: 'auth@your-app.com',
      subject: 'Your password was recovered',
      template: './reset-password',
      context: {
        userName: user.name,
      },
    });
  }
}
