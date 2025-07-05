import { PasswordHelper } from '@/lib/helpers/password.helper';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfirmationService } from '../confirmation/confirmation.service';
import { ConfirmationType } from '../confirmation/enums/confirmation-type.enum';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class RecoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly mailer: MailerService,
    private readonly passwordHelper: PasswordHelper,
    private readonly confirmationService: ConfirmationService,
  ) {}

  /**
   * Sends a password reset email to the user with the given email address.
   */
  async requestPasswordReset(email: string) {
    const user = await this.usersService.getByEmailOrThrow(email);

    const confirmation = await this.confirmationService.request(
      user.id,
      ConfirmationType.PASSWORD_RESET,
    );

    await this.mailer.sendMail({
      from: 'support@your-app.com',
      to: email,
      text: `A password reset action was requested, please confirm that it was you: ${confirmation.token}`,
    });
  }

  /**
   * Consumes a confirmation and resets the user's password.
   * @param token The sent confirmation code informed by the user.
   * @param newPassword The new password to set for the user.
   */
  async resetPassword(token: string, newPassword: string) {
    const confirmation = await this.confirmationService.consume(
      token,
      ConfirmationType.PASSWORD_RESET,
    );

    await this.passwordHelper.update(confirmation.userId, newPassword);
  }

  async requestEmailChange(userId: number, email: string) {
    const confirmation = await this.confirmationService.request(
      userId,
      ConfirmationType.EMAIL_CHANGE,
    );

    await this.mailer.sendMail({
      from: 'support@your-app.com',
      to: email,
      text: `A password reset action was requested, please confirm that it was you: ${confirmation.token}`,
    });
  }

  /**
   * Consumes a confirmation and changes the user's email.
   * @param token The sent confirmation code informed by the user.
   * @param newEmail The new email to set for the user.
   */
  async changeEmail(token: string, newEmail: string) {
    const confirmation = await this.confirmationService.consume(
      token,
      ConfirmationType.EMAIL_CHANGE,
    );

    await this.usersService.update(confirmation.userId, { email: newEmail });
  }
}
