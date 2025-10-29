import { vi } from 'vitest';

export const mockAuthClient = {
  signIn: {
    email: vi.fn(),
    social: vi.fn(),
  },
  signUp: {
    email: vi.fn(),
  },
  signOut: vi.fn(),
  forgetPassword: vi.fn(),
  resetPassword: vi.fn(),
  useSession: vi.fn(),
};

export const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: {
    id: 'test-session-id',
    userId: 'test-user-id',
    expiresAt: new Date(Date.now() + 86400000),
    token: 'test-token',
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: null,
    userAgent: null,
  },
};

vi.mock('~/lib/auth-client', () => ({
  authClient: mockAuthClient,
  useSession: () => ({ data: mockSession, isPending: false }),
}));
