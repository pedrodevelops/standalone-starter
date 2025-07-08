import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SignInDTO {
  @ApiProperty({
    example: 'aa@bb.cc',
  })
  @IsString({})
  @MinLength(3)
  email: string;

  @ApiProperty({
    example: 'SVVVe9M4',
  })
  @IsString()
  password: string;
}
