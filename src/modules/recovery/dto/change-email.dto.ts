import { ConfirmationService } from '@/modules/confirmation/confirmation.service';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeEmailDTO {
  @ApiProperty({
    example: 'new@mail.com',
  })
  email: string;

  @ApiProperty({
    example: ConfirmationService.generateToken(),
  })
  token: string;
}
