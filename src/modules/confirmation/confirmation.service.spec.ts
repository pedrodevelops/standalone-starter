import { NotFoundException } from '@nestjs/common';
import {
  createMockConfirmation,
  createMockPrismaConfirmationService,
} from '@test/mocks/users.mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmationService } from './confirmation.service';
import { ConfirmationType } from './enums/confirmation-type.enum';

describe('ConfirmationService', () => {
  let service: ConfirmationService;
  let mockPrisma: ReturnType<typeof createMockPrismaConfirmationService>;

  beforeEach(() => {
    mockPrisma = createMockPrismaConfirmationService();
    service = new ConfirmationService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('request', () => {
    it('should delete previous confirmations and create new one', async () => {
      const mockConfirmation = createMockConfirmation({
        userId: 1,
        type: ConfirmationType.PASSWORD_RESET,
      });

      mockPrisma.confirmation.create.mockResolvedValue(mockConfirmation);

      const result = await service.request(1, ConfirmationType.PASSWORD_RESET);

      expect(mockPrisma.confirmation.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          type: ConfirmationType.PASSWORD_RESET,
        },
      });

      expect(mockPrisma.confirmation.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          expiry: expect.any(Date),
          token: expect.any(String),
          type: ConfirmationType.PASSWORD_RESET,
          used: false,
        },
        select: {
          userId: true,
          token: true,
          id: true,
          type: true,
        },
      });

      expect(result).toEqual(mockConfirmation);
    });

    it('should generate unique tokens for different requests', async () => {
      const mockConfirmation1 = createMockConfirmation({ token: 'token1' });
      const mockConfirmation2 = createMockConfirmation({ token: 'token2' });

      mockPrisma.confirmation.create
        .mockResolvedValueOnce(mockConfirmation1)
        .mockResolvedValueOnce(mockConfirmation2);

      const result1 = await service.request(1, ConfirmationType.PASSWORD_RESET);
      const result2 = await service.request(1, ConfirmationType.EMAIL_CHANGE);

      expect(result1.token).not.toEqual(result2.token);
    });
  });

  describe('consume', () => {
    it('should throw NotFoundException when confirmation not found', async () => {
      mockPrisma.confirmation.findUnique.mockResolvedValue(null);

      await expect(
        service.consume('invalid-token', ConfirmationType.PASSWORD_RESET),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.consume('invalid-token', ConfirmationType.PASSWORD_RESET),
      ).rejects.toThrow('This link has expired, please request again.');

      expect(mockPrisma.confirmation.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when token is expired', async () => {
      mockPrisma.confirmation.findUnique.mockResolvedValue(null);

      await expect(
        service.consume('expired-token', ConfirmationType.PASSWORD_RESET),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.confirmation.update).not.toHaveBeenCalled();
    });

    it('should consume valid confirmation and mark as used', async () => {
      const mockConfirmation = createMockConfirmation({
        id: 1,
        token: 'valid-token',
        type: ConfirmationType.PASSWORD_RESET,
        userId: 1,
      });

      mockPrisma.confirmation.findUnique.mockResolvedValue(mockConfirmation);

      const result = await service.consume(
        'valid-token',
        ConfirmationType.PASSWORD_RESET,
      );

      expect(mockPrisma.confirmation.findUnique).toHaveBeenCalledWith({
        where: {
          token_type: {
            token: 'valid-token',
            type: ConfirmationType.PASSWORD_RESET,
          },
          expiry: {
            gte: expect.any(Date),
          },
        },
        select: {
          userId: true,
          token: true,
          id: true,
          type: true,
        },
      });

      expect(mockPrisma.confirmation.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { used: true },
      });

      expect(result).toEqual(mockConfirmation);
    });

    it('should validate confirmation type matches desired type', async () => {
      mockPrisma.confirmation.findUnique.mockResolvedValue(null);

      await expect(
        service.consume('valid-token', ConfirmationType.EMAIL_CHANGE),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.confirmation.findUnique).toHaveBeenCalledWith({
        where: {
          token_type: {
            token: 'valid-token',
            type: ConfirmationType.EMAIL_CHANGE,
          },
          expiry: {
            gte: expect.any(Date),
          },
        },
        select: {
          userId: true,
          token: true,
          id: true,
          type: true,
        },
      });
    });
  });

  describe('getValidByTokenAndTypeOrThrow', () => {
    it('should throw NotFoundException when confirmation not found', async () => {
      mockPrisma.confirmation.findUnique.mockResolvedValue(null);

      await expect(
        service.getValidByTokenAndTypeOrThrow(
          'invalid-token',
          ConfirmationType.PASSWORD_RESET,
        ),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getValidByTokenAndTypeOrThrow(
          'invalid-token',
          ConfirmationType.PASSWORD_RESET,
        ),
      ).rejects.toThrow('This link has expired, please request again.');
    });

    it('should return confirmation with transformed type when found', async () => {
      const mockConfirmation = createMockConfirmation({
        token: 'valid-token',
        type: ConfirmationType.PASSWORD_RESET,
      });

      mockPrisma.confirmation.findUnique.mockResolvedValue(mockConfirmation);

      const result = await service.getValidByTokenAndTypeOrThrow(
        'valid-token',
        ConfirmationType.PASSWORD_RESET,
      );

      expect(result).toEqual({
        ...mockConfirmation,
        type: ConfirmationType[mockConfirmation.type],
      });
    });
  });

  describe('deletePreviousByType', () => {
    it('should delete all previous confirmations of same type for user', async () => {
      await service.deletePreviousByType(1, ConfirmationType.PASSWORD_RESET);

      expect(mockPrisma.confirmation.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          type: ConfirmationType.PASSWORD_RESET,
        },
      });
    });

    it('should not delete confirmations of different types', async () => {
      await service.deletePreviousByType(1, ConfirmationType.EMAIL_CHANGE);

      expect(mockPrisma.confirmation.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          type: ConfirmationType.EMAIL_CHANGE,
        },
      });
    });
  });

  describe('business logic validation', () => {
    it('should handle complete confirmation lifecycle', async () => {
      const userId = 1;
      const type = ConfirmationType.PASSWORD_RESET;
      const mockConfirmation = createMockConfirmation({
        userId,
        type,
        token: 'lifecycle-token',
      });

      mockPrisma.confirmation.create.mockResolvedValue(mockConfirmation);
      mockPrisma.confirmation.findUnique.mockResolvedValue(mockConfirmation);

      const requested = await service.request(userId, type);
      expect(requested).toEqual(mockConfirmation);

      const consumed = await service.consume(requested.token, type);
      expect(consumed).toEqual(mockConfirmation);

      expect(mockPrisma.confirmation.update).toHaveBeenCalledWith({
        where: { id: mockConfirmation.id },
        data: { used: true },
      });
    });

    it('should prevent token reuse by different types', async () => {
      const token = 'shared-token';

      mockPrisma.confirmation.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(
          createMockConfirmation({
            token,
            type: ConfirmationType.PASSWORD_RESET,
          }),
        );

      await expect(
        service.consume(token, ConfirmationType.EMAIL_CHANGE),
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.consume(token, ConfirmationType.PASSWORD_RESET),
      ).resolves.not.toThrow();
    });

    it('should handle security by cleaning previous tokens', async () => {
      const userId = 1;
      const type = ConfirmationType.PASSWORD_RESET;

      await service.request(userId, type);

      expect(mockPrisma.confirmation.deleteMany).toHaveBeenCalledWith({
        where: { userId, type },
      });

      expect(mockPrisma.confirmation.create).toHaveBeenCalled();
    });

    it('should generate token with proper length', () => {
      const token = ConfirmationService.generateToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(8);
    });
  });
});
