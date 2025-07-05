import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  createMockPrismaService,
  createMockUser,
} from '@test/mocks/users.mock';
import { beforeEach, describe, expect, it } from 'vitest';
import { UserRole } from './enums/user-role.enum';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    service = new UsersService(mockPrisma as any);
  });

  describe('getByEmailOrThrow', () => {
    it('should throw NotFoundException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.getByEmailOrThrow('nonexistent@example.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return user when found', async () => {
      const mockUser = createMockUser();
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getByEmailOrThrow('test@example.com');

      expect(result).toEqual({
        ...mockUser,
        role: UserRole[mockUser.role],
      });
    });
  });

  describe('getByIdOrThrow', () => {
    it('should throw NotFoundException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getByIdOrThrow(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return user when found', async () => {
      const mockUser = createMockUser();
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getByIdOrThrow(1);

      expect(result).toEqual({
        ...mockUser,
        role: UserRole[mockUser.role],
      });
    });
  });

  describe('throwIfUniqueFieldsConflict', () => {
    it('should throw ConflictException when email already exists', async () => {
      const existingUser = createMockUser({ email: 'existing@example.com' });
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      await expect(
        service.throwIfUniqueFieldsConflict({ email: 'existing@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should not throw when no conflict exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.throwIfUniqueFieldsConflict({ email: 'new@example.com' }),
      ).resolves.not.toThrow();
    });
  });

  describe('create', () => {
    it('should throw ConflictException when email already exists', async () => {
      const existingUser = createMockUser({ email: 'existing@example.com' });
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      const createInput = {
        email: 'existing@example.com',
        name: 'New User',
        role: UserRole.USER,
      };

      await expect(service.create(createInput)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create user when no conflicts exist', async () => {
      const newUser = createMockUser({ email: 'new@example.com' });
      mockPrisma.user.findUnique.mockResolvedValue(null); // No conflict
      mockPrisma.user.create.mockResolvedValue(newUser);

      const createInput = {
        email: 'new@example.com',
        name: 'New User',
        role: UserRole.USER,
      };

      const result = await service.create(createInput);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: createInput,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      expect(result).toEqual({
        ...newUser,
        role: UserRole[newUser.role],
      });
    });
  });
});
