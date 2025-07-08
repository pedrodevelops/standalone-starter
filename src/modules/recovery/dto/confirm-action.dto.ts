import { ConfirmationService } from '@/modules/confirmation/confirmation.service';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConfirmActionDTO {
  @ApiProperty({
    example: ConfirmationService.generateToken(),
  })
  @IsString()
  token: string;
}
