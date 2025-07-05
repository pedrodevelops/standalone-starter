import { ApiProperty } from '@nestjs/swagger';

export class MessageDTO {
  @ApiProperty({
    example: 'Hello World!',
  })
  message: string;
}
