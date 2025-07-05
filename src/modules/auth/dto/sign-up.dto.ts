import { ApiProperty } from '@nestjs/swagger';

export class SignUpDTO {
  @ApiProperty({
    example: 'Charles Oliveira',
  })
  name: string;

  @ApiProperty({
    example: 'aa@bb.cc',
  })
  email: string;

  @ApiProperty({
    example: 'SVVVe9M4',
  })
  password: string;
}
