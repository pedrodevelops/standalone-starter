import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignUpDTO {
  @ApiProperty({
    example: 'Charles Oliveira',
  })
  @IsString({})
  @MinLength(3)
  @MaxLength(80)
  name: string;

  @ApiProperty({
    example: 'aa@bb.cc',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SVVVe9M4',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
