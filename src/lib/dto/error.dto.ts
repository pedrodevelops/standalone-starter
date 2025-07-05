import { ApiProperty } from '@nestjs/swagger';

export class ErrorDTO {
  @ApiProperty({
    example: 'An error occurred',
  })
  message: string;

  @ApiProperty({
    example: 500,
  })
  statusCode: number;

  @ApiProperty({
    example: 'Internal Server Error',
  })
  error: string;
}
