import { UserRole } from '@/modules/users/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UserDTO {
  @ApiProperty({
    example: 215,
  })
  id: number;

  @ApiProperty({
    example: 'Charles Oliveira',
  })
  name: string;

  @ApiProperty({
    example: 'aa@bb.cc',
  })
  email: string;

  @ApiProperty({
    example: 'https://github.com/shadcn.png',
  })
  avatarUrl: string | null;

  @ApiProperty({
    example: UserRole.USER,
    enum: () => UserRole,
  })
  role: UserRole;
}
