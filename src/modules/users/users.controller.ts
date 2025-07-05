import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  CurrentUser,
  UserFromRequest,
} from '../auth/decorators/current-user.decorator';
import { UserDTO } from '../auth/dto/user.dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  async getUser(
    @CurrentUser() { id: userId }: UserFromRequest,
  ): Promise<UserDTO> {
    return this.usersService.getByIdOrThrow(userId);
  }

  @Get('/:id')
  async getUserById(
    @Param('id', new ParseIntPipe()) id: string,
  ): Promise<UserDTO> {
    return this.usersService.getByEmailOrThrow(id);
  }
}
