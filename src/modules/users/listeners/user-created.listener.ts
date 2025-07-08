import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  USER_CREATED_EVENT,
  UserCreatedEvent,
} from '../events/user-created.event';

@Injectable()
export class UserCreatedListener {
  constructor(private readonly mailer: MailerService) {}

  @OnEvent(USER_CREATED_EVENT)
  handle({ email, userName }: UserCreatedEvent) {
    return this.mailer.sendMail({
      to: email,
      from: 'hello@your-app.com',
      subject: 'Welcome to our app!',
      template: './welcome',
      context: {
        userName: userName,
      },
    });
  }
}
