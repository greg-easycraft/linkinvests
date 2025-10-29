import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { UserInfo } from './UserInfo';
import { authClient } from '~/lib/auth-client';

// Mock auth client
vi.mock('~/lib/auth-client', () => ({
  authClient: {
    signOut: vi.fn(),
    useSession: vi.fn(),
  },
  useSession: vi.fn(),
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Import the mocked useSession
import { useSession } from '~/lib/auth-client';

describe('UserInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading skeleton when session is pending', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        isPending: true,
        error: null,
      });

      const { container } = render(<UserInfo />);

      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('No Session', () => {
    it('should render nothing when there is no session', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        isPending: false,
        error: null,
      });

      const { container } = render(<UserInfo />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('With Session', () => {
    const mockSession = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        image: 'https://example.com/avatar.jpg',
      },
      session: {
        id: 'session-1',
        userId: '1',
        expiresAt: new Date(Date.now() + 86400000),
      },
    };

    beforeEach(() => {
      vi.mocked(useSession).mockReturnValue({
        data: mockSession,
        isPending: false,
        error: null,
      });
    });

    it('should render user avatar button', () => {
      render(<UserInfo />);

      // Check that avatar button is rendered
      const avatarButton = screen.getByRole('button');
      expect(avatarButton).toBeInTheDocument();

      // Avatar component should be present (with fallback in test environment)
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render user initials when no image is provided', () => {
      vi.mocked(useSession).mockReturnValue({
        data: {
          ...mockSession,
          user: { ...mockSession.user, image: null },
        },
        isPending: false,
        error: null,
      });

      render(<UserInfo />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should calculate initials correctly for multi-word names', () => {
      vi.mocked(useSession).mockReturnValue({
        data: {
          ...mockSession,
          user: { ...mockSession.user, name: 'Jane Mary Smith', image: null },
        },
        isPending: false,
        error: null,
      });

      render(<UserInfo />);

      // Should take first 2 initials
      expect(screen.getByText('JM')).toBeInTheDocument();
    });

    it('should open dropdown menu when avatar is clicked', async () => {
      const user = userEvent.setup();
      render(<UserInfo />);

      const avatarButton = screen.getByRole('button');
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Sign out')).toBeInTheDocument();
      });
    });

    it('should display user name and email in dropdown', async () => {
      const user = userEvent.setup();
      render(<UserInfo />);

      const avatarButton = screen.getByRole('button');
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      });
    });

    it('should call signOut when sign out is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(authClient.signOut).mockResolvedValue(undefined);

      render(<UserInfo />);

      const avatarButton = screen.getByRole('button');
      await user.click(avatarButton);

      const signOutButton = await screen.findByText('Sign out');
      await user.click(signOutButton);

      expect(authClient.signOut).toHaveBeenCalledWith({
        fetchOptions: {
          onSuccess: expect.any(Function),
        },
      });
    });

    it('should redirect to home page after successful sign out', async () => {
      const user = userEvent.setup();
      let onSuccessCallback: (() => void) | undefined;

      vi.mocked(authClient.signOut).mockImplementation(async (options: any) => {
        onSuccessCallback = options?.fetchOptions?.onSuccess;
        return undefined;
      });

      render(<UserInfo />);

      const avatarButton = screen.getByRole('button');
      await user.click(avatarButton);

      const signOutButton = await screen.findByText('Sign out');
      await user.click(signOutButton);

      await waitFor(() => {
        expect(authClient.signOut).toHaveBeenCalled();
      });

      // Manually trigger the onSuccess callback
      if (onSuccessCallback) {
        onSuccessCallback();
      }

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should have profile menu item', async () => {
      const user = userEvent.setup();
      render(<UserInfo />);

      const avatarButton = screen.getByRole('button');
      await user.click(avatarButton);

      await waitFor(() => {
        const profileItem = screen.getByText('Profile');
        expect(profileItem).toBeInTheDocument();
      });
    });

    it('should have proper focus ring on avatar button', () => {
      render(<UserInfo />);

      const avatarButton = screen.getByRole('button');
      expect(avatarButton.className).toContain('focus:ring-2');
    });
  });

  describe('getInitials helper', () => {
    it('should handle single word names', () => {
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Madonna',
            email: 'madonna@example.com',
            image: null,
          },
          session: {
            id: 'session-1',
            userId: '1',
            expiresAt: new Date(Date.now() + 86400000),
          },
        },
        isPending: false,
        error: null,
      });

      render(<UserInfo />);

      expect(screen.getByText('M')).toBeInTheDocument();
    });

    it('should handle names with extra spaces', () => {
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'John  Doe',
            email: 'john@example.com',
            image: null,
          },
          session: {
            id: 'session-1',
            userId: '1',
            expiresAt: new Date(Date.now() + 86400000),
          },
        },
        isPending: false,
        error: null,
      });

      render(<UserInfo />);

      // Should still extract initials correctly
      const initialsElement = screen.queryByText(/^[A-Z]{1,2}$/);
      expect(initialsElement).toBeInTheDocument();
    });
  });
});
