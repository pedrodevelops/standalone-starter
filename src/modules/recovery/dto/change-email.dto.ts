import { ConfirmationService } from '@/modules/confirmation/confirmation.service';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ChangeEmailDTO {
  @ApiProperty({
    example: 'new@mail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: ConfirmationService.generateToken(),
  })
  @IsString()
  token: string;
}
