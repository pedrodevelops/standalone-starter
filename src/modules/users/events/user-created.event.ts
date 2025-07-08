export const USER_CREATED_EVENT = 'user.created';

export class UserCreatedEvent {
  email: string;
  userName: string;

  constructor(data: UserCreatedEvent) {
    Object.assign(this, data);
  }
}
