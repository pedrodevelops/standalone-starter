import { ConfirmationService } from '@/modules/confirmation/confirmation.service';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDTO {
  @ApiProperty({
    example: '123456',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: ConfirmationService.generateToken(),
  })
  @IsString()
  token: string;
}
