import { ApiProperty } from '@nestjs/swagger';

export class SignInDTO {
  @ApiProperty({
    example: 'aa@bb.cc',
  })
  email: string;

  @ApiProperty({
    example: 'SVVVe9M4',
  })
  password: string;
}
