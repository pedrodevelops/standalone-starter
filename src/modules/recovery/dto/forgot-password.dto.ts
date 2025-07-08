import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDTO {
  @ApiProperty({
    example: 'aa@bb.cc',
  })
  @IsEmail()
  email: string;
}
