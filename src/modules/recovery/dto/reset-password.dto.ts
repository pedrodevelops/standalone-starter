import { ConfirmationService } from '@/modules/confirmation/confirmation.service';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDTO {
  @ApiProperty({
    example: '123456',
  })
  password: string;

  @ApiProperty({
    example: ConfirmationService.generateToken(),
  })
  token: string;
}
