export const RESET_PASSWORD_EVENT = 'auth.resetPassword';

export class ResetPasswordEvent {
  public userId: number;

  constructor(event: ResetPasswordEvent) {
    Object.assign(this, event);
  }
}
