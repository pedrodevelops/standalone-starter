import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { Password } from 'generated/prisma';

@Injectable()
export class PasswordHelper {
  constructor(private readonly prisma: PrismaService) {}

  async hash(raw: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(raw, salt);
  }

  async compare(raw: string, hash: string): Promise<boolean> {
    return bcrypt.compare(raw, hash);
  }

  /**
   * Gets a password record for a user's email, every existing user has a password
   * @throws NotFoundException if the user is not found
   * @throws InternalServerErrorException if the user's password is not found
   * @todo Remove internal server error if social auth is implemented
   */
  async getByEmailOrThrow(email: string): Promise<Password> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (!user.password) {
      throw new InternalServerErrorException(`User password not found`, {
        cause: new Error(`User password not found`),
        description: `User password not found`,
      });
    }

    return user.password;
  }

  async update(userId: number, newPassword: string): Promise<void> {
    await this.prisma.password.update({
      where: {
        userId,
      },
      data: {
        hash: await this.hash(newPassword),
      },
    });
  }
}
