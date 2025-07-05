import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDTO {
  @ApiProperty({
    example: 'aa@bb.cc',
  })
  email: string;
}
