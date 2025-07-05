import { ConfirmationService } from '@/modules/confirmation/confirmation.service';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmActionDTO {
  @ApiProperty({
    example: ConfirmationService.generateToken(),
  })
  token: string;
}
