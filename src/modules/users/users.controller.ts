import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import {
  CurrentUser,
  UserFromRequest,
} from '../auth/decorators/current-user.decorator';
import { UserDTO } from './dto/user.dto';
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

  @Patch('/me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: "Updates the authenticated user's avatar" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar image file',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async updateAvatar(
    @CurrentUser() user: UserFromRequest,
    @UploadedFile() file: any,
  ): Promise<UserDTO> {
    const uploadResult = await this.usersService.uploadAvatar(file);

    return this.usersService.update(user.id, {
      avatarUrl: uploadResult.publicUrl,
    });
  }
}
