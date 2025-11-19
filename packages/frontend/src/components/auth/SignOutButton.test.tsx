// describe, it, expect, beforeEach are Jest globals
import { render, screen, waitFor } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { SignOutButton } from './SignOutButton';
import { authClient } from '~/lib/auth-client';

// Mock the auth client
jest.mock('~/lib/auth-client', () => ({
  authClient: {
    signOut: jest.fn(),
  },
}));

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SignOutButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sign-out button', () => {
    render(<SignOutButton />);

    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('should call signOut when clicked', async () => {
    const user = userEvent.setup();
    const mockSignOut = jest.fn((options) => {
      options.fetchOptions.onSuccess();
      return Promise.resolve();
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.mocked(authClient.signOut).mockImplementation(mockSignOut as any);

    render(<SignOutButton />);

    const button = screen.getByRole('button', { name: /sign out/i });
    await user.click(button);

    await waitFor(() => {
      expect(authClient.signOut).toHaveBeenCalled();
    });
  });

  it('should redirect to home page on successful sign-out', async () => {
    const user = userEvent.setup();
    const mockSignOut = jest.fn((options) => {
      options.fetchOptions.onSuccess();
      return Promise.resolve();
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.mocked(authClient.signOut).mockImplementation(mockSignOut as any);

    render(<SignOutButton />);

    const button = screen.getByRole('button', { name: /sign out/i });
    await user.click(button);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should show loading state during sign-out', async () => {
    const user = userEvent.setup();
    jest.mocked(authClient.signOut).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(undefined), 100))
    );

    render(<SignOutButton />);

    const button = screen.getByRole('button', { name: /sign out/i });
    await user.click(button);

    expect(screen.getByRole('button', { name: /signing out/i })).toBeDisabled();
  });
});
