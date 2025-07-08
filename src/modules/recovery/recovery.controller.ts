import { Tags } from '@/lib/constants/docs.constants';
import { MessageDTO } from '@/lib/dto/message.dto';
import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  UserFromRequest,
} from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ChangeEmailDTO } from './dto/change-email.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { RecoveryService } from './recovery.service';

@ApiTags(Tags.RECOVERY)
@Controller('recovery')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @Public()
  @Post('/forgot-password')
  @ApiOperation({
    summary: 'Sends a token for the user to reset the password',
  })
  async forgotPassword(@Body() body: ForgotPasswordDTO): Promise<MessageDTO> {
    await this.recoveryService.requestPasswordReset(body.email);

    return {
      message: "If the email matches a account, we'll send you a token",
    };
  }

  @Public()
  @Patch('/reset-password')
  @ApiOperation({
    summary: 'Resets the password consuming a token',
  })
  async resetPassword(@Body() body: ResetPasswordDTO): Promise<MessageDTO> {
    const { token, password } = body;

    await this.recoveryService.resetPassword(token, password);

    return {
      message: 'Your password has been reset, you can now login',
    };
  }

  @Get('/request-email-change')
  @ApiOperation({
    summary: 'Request a email change',
  })
  async requestEmailChange(
    @CurrentUser() user: UserFromRequest,
  ): Promise<MessageDTO> {
    await this.recoveryService.requestEmailChange(user.id, user.email);

    return {
      message: "If the email matches a account, we'll send you a token",
    };
  }

  @Patch('/change-email')
  @ApiOperation({
    summary: 'Changes the user email consuming a token',
  })
  async changeEmail(@Body() body: ChangeEmailDTO): Promise<MessageDTO> {
    const { token, email } = body;

    await this.recoveryService.changeEmail(token, email);

    return {
      message: 'Your email has been changed',
    };
  }
}
