import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { UploadResult, UploadService } from '../upload/upload.service';
import { User } from './models/user.model';
import { UsersMapper } from './users.mapper';

export const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatarUrl: true,
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersMapper: UsersMapper,
    private readonly uploadService: UploadService,
  ) {}

  async getByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: USER_SELECT,
    });

    if (!user) {
      return null;
    }

    return this.usersMapper.toModel(user);
  }

  async getByEmailOrThrow(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return this.usersMapper.toModel(user);
  }

  async getById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return this.usersMapper.toModel(user);
  }

  async getByIdOrThrow(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return this.usersMapper.toModel(user);
  }

  async throwIfUniqueFieldsConflict(where: Prisma.UserWhereUniqueInput) {
    const userFound = await this.prisma.user.findUnique({
      where,
    });

    if (userFound) {
      const uniqueKeys = Object.keys(where);
      const conflictingKey = uniqueKeys.find(
        (key) => where[key] === userFound[key as keyof typeof userFound],
      );

      throw new ConflictException(`${conflictingKey} already in use.`);
    }
  }

  async create(input: Prisma.UserCreateInput): Promise<User> {
    await this.throwIfUniqueFieldsConflict({
      email: input.email,
    });

    const user = await this.prisma.user.create({
      data: input,
      select: USER_SELECT,
    });

    return this.usersMapper.toModel(user);
  }

  async update(id: number, input: Prisma.UserUpdateInput): Promise<User> {
    if (input.email) {
      await this.throwIfUniqueFieldsConflict({
        email: input.email as string,
      });
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: input,
      select: USER_SELECT,
    });

    return this.usersMapper.toModel(user);
  }

  async delete(id: number): Promise<User> {
    const user = await this.prisma.user.delete({
      where: { id },
      select: USER_SELECT,
    });

    return this.usersMapper.toModel(user);
  }

  uploadAvatar(file: any): Promise<UploadResult> {
    return this.uploadService.uploadImage(file, 'avatars', {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto',
    });
  }
}
