// vi is available as jest global

export const mockAuthClient = {
  signIn: {
    email: jest.fn(),
    social: jest.fn(),
  },
  signUp: {
    email: jest.fn(),
  },
  signOut: jest.fn(),
  forgetPassword: jest.fn(),
  resetPassword: jest.fn(),
  useSession: jest.fn(),
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

jest.mock('~/lib/auth-client', () => ({
  authClient: mockAuthClient,
  useSession: () => ({ data: mockSession, isPending: false }),
}));
