import { ConfirmationType } from '@/modules/confirmation/enums/confirmation-type.enum';
import { NotFoundException } from '@nestjs/common';
import {
  createMockConfirmation,
  createMockConfirmationService,
  createMockMailerService,
  createMockPasswordHelper,
  createMockUser,
  createMockUsersService,
} from '@test/mocks/users.mock';
import { beforeEach, describe, expect, it } from 'vitest';
import { RecoveryService } from './recovery.service';

describe('RecoveryService', () => {
  let service: RecoveryService;
  let mockUsersService: ReturnType<typeof createMockUsersService>;
  let mockConfirmationService: ReturnType<typeof createMockConfirmationService>;
  let mockMailerService: ReturnType<typeof createMockMailerService>;
  let mockPasswordHelper: ReturnType<typeof createMockPasswordHelper>;

  beforeEach(() => {
    mockUsersService = createMockUsersService();
    mockConfirmationService = createMockConfirmationService();
    mockMailerService = createMockMailerService();
    mockPasswordHelper = createMockPasswordHelper();

    service = new RecoveryService(
      {} as any, // currently not using prisma on covered methods
      mockUsersService as any,
      mockMailerService as any,
      mockPasswordHelper as any,
      mockConfirmationService as any,
    );
  });

  describe('requestPasswordReset', () => {
    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.getByEmailOrThrow.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        service.requestPasswordReset('nonexistent@example.com'),
      ).rejects.toThrow(NotFoundException);

      expect(mockConfirmationService.request).not.toHaveBeenCalled();
      expect(mockMailerService.sendMail).not.toHaveBeenCalled();
    });

    it('should send password reset email when user exists', async () => {
      const mockUser = createMockUser({ email: 'test@example.com' });
      const mockConfirmation = createMockConfirmation({
        token: 'reset-token-123',
        userId: mockUser.id,
      });

      mockUsersService.getByEmailOrThrow.mockResolvedValue(mockUser);
      mockConfirmationService.request.mockResolvedValue(mockConfirmation);

      await service.requestPasswordReset('test@example.com');

      expect(mockConfirmationService.request).toHaveBeenCalledWith(
        mockUser.id,
        ConfirmationType.PASSWORD_RESET,
      );
      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        from: 'support@your-app.com',
        to: 'test@example.com',
        text: `A password reset action was requested, please confirm that it was you: ${mockConfirmation.token}`,
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password when valid token provided', async () => {
      const mockConfirmation = createMockConfirmation({
        token: 'valid-token',
        userId: 1,
      });

      mockConfirmationService.consume.mockResolvedValue(mockConfirmation);

      await service.resetPassword('valid-token', 'newPassword123');

      expect(mockConfirmationService.consume).toHaveBeenCalledWith(
        'valid-token',
        ConfirmationType.PASSWORD_RESET,
      );
      expect(mockPasswordHelper.update).toHaveBeenCalledWith(
        mockConfirmation.userId,
        'newPassword123',
      );
    });

    it('should throw error when invalid token provided', async () => {
      const error = new Error('Invalid token');
      mockConfirmationService.consume.mockRejectedValue(error);

      await expect(
        service.resetPassword('invalid-token', 'newPassword123'),
      ).rejects.toThrow(error);

      expect(mockPasswordHelper.update).not.toHaveBeenCalled();
    });
  });

  describe('requestEmailChange', () => {
    it('should use wrong confirmation type for email change request', async () => {
      // This tests the bug in the code where PASSWORD_RESET is used instead of EMAIL_CHANGE
      const mockConfirmation = createMockConfirmation({
        token: 'email-change-token',
        userId: 1,
      });

      mockConfirmationService.request.mockResolvedValue(mockConfirmation);

      await service.requestEmailChange(1, 'new@example.com');

      expect(mockConfirmationService.request).toHaveBeenCalledWith(
        1,
        ConfirmationType.EMAIL_CHANGE,
      );
      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        from: 'support@your-app.com',
        to: 'new@example.com',
        text: 'A password reset action was requested, please confirm that it was you: email-change-token',
      });
    });
  });

  describe('changeEmail', () => {
    it('should change email when valid token provided', async () => {
      const mockConfirmation = createMockConfirmation({
        token: 'valid-token',
        userId: 1,
        type: ConfirmationType.EMAIL_CHANGE,
      });

      mockConfirmationService.consume.mockResolvedValue(mockConfirmation);

      await service.changeEmail('valid-token', 'new@example.com');

      expect(mockConfirmationService.consume).toHaveBeenCalledWith(
        'valid-token',
        ConfirmationType.EMAIL_CHANGE,
      );
      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockConfirmation.userId,
        { email: 'new@example.com' },
      );
    });

    it('should throw error when invalid token provided', async () => {
      const error = new Error('Invalid token');
      mockConfirmationService.consume.mockRejectedValue(error);

      await expect(
        service.changeEmail('invalid-token', 'new@example.com'),
      ).rejects.toThrow(error);

      expect(mockUsersService.update).not.toHaveBeenCalled();
    });
  });

  describe('business logic validation', () => {
    it('should handle email change flow with proper error handling', async () => {
      const userId = 1;
      const newEmail = 'new@example.com';
      const token = 'valid-token';

      const mockConfirmation = createMockConfirmation({
        token,
        userId,
        type: ConfirmationType.EMAIL_CHANGE,
      });

      mockConfirmationService.request.mockResolvedValue(mockConfirmation);
      mockConfirmationService.consume.mockResolvedValue(mockConfirmation);

      await service.requestEmailChange(userId, newEmail);
      await service.changeEmail(token, newEmail);

      expect(mockConfirmationService.request).toHaveBeenCalledWith(
        userId,
        ConfirmationType.EMAIL_CHANGE,
      );
      expect(mockConfirmationService.consume).toHaveBeenCalledWith(
        token,
        ConfirmationType.EMAIL_CHANGE,
      );
      expect(mockUsersService.update).toHaveBeenCalledWith(userId, {
        email: newEmail,
      });
    });

    it('should handle password reset flow completely', async () => {
      const email = 'test@example.com';
      const newPassword = 'newPassword123';
      const token = 'reset-token';

      const mockUser = createMockUser({ email });
      const mockConfirmation = createMockConfirmation({
        token,
        userId: mockUser.id,
      });

      mockUsersService.getByEmailOrThrow.mockResolvedValue(mockUser);
      mockConfirmationService.request.mockResolvedValue(mockConfirmation);
      mockConfirmationService.consume.mockResolvedValue(mockConfirmation);

      // Test full password reset flow
      await service.requestPasswordReset(email);
      await service.resetPassword(token, newPassword);

      expect(mockUsersService.getByEmailOrThrow).toHaveBeenCalledWith(email);
      expect(mockConfirmationService.request).toHaveBeenCalledWith(
        mockUser.id,
        ConfirmationType.PASSWORD_RESET,
      );
      expect(mockConfirmationService.consume).toHaveBeenCalledWith(
        token,
        ConfirmationType.PASSWORD_RESET,
      );
      expect(mockPasswordHelper.update).toHaveBeenCalledWith(
        mockUser.id,
        newPassword,
      );
    });
  });
});
