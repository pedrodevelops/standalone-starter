import { ConfirmationType } from '@/modules/confirmation/enums/confirmation-type.enum';
import { UserRole } from '@/modules/users/enums/user-role.enum';
import { vi } from 'vitest';

export const createMockUser = (
  overrides: Partial<{
    id: number;
    email: string;
    name: string;
    role: string;
  }> = {},
) => ({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: UserRole.USER,
  ...overrides,
});

export const createMockConfirmation = (
  overrides: Partial<{
    id: number;
    token: string;
    userId: number;
    type: ConfirmationType;
  }> = {},
) => ({
  id: 1,
  token: 'mock-token-123',
  userId: 1,
  type: ConfirmationType.PASSWORD_RESET,
  ...overrides,
});

export const createMockPrismaService = () => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
});

export const createMockUsersService = () => ({
  getByEmail: vi.fn(),
  getByEmailOrThrow: vi.fn(),
  getById: vi.fn(),
  getByIdOrThrow: vi.fn(),
  throwIfUniqueFieldsConflict: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
});

export const createMockConfirmationService = () => ({
  request: vi.fn(),
  consume: vi.fn(),
});

export const createMockMailerService = () => ({
  sendMail: vi.fn(),
});

export const createMockPasswordHelper = () => ({
  update: vi.fn(),
});

export const createMockPrismaConfirmationService = () => ({
  confirmation: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
});
