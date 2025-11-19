/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { VerifyEmailCard } from './VerifyEmailCard';

// Mock authClient
jest.mock('~/lib/auth-client', () => ({
  authClient: {
    getSession: jest.fn(),
    sendVerificationEmail: jest.fn(),
  },
}));

import { authClient } from '~/lib/auth-client';

const mockAuthClient = authClient as {
  getSession: jest.MockedFunction<any>;
  sendVerificationEmail: jest.MockedFunction<any>;
};

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
  },
  writable: true,
});

// Mock Date.now for consistent timing tests
const mockDateNow = jest.spyOn(Date, 'now');

// Mock setTimeout and setInterval for timer tests
jest.useFakeTimers();

describe('VerifyEmailCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    mockDateNow.mockReturnValue(1000000); // Fixed timestamp
  });

  afterAll(() => {
    jest.useRealTimers();
    mockDateNow.mockRestore();
  });

  describe('Basic Rendering', () => {
    it('should render card elements correctly', () => {
      render(<VerifyEmailCard />);

      expect(screen.getByText('Vérifiez votre email')).toBeInTheDocument();
      expect(screen.getByText('Nous avons envoyé un email de vérification à votre adresse. Cliquez sur le lien dans l\'email pour activer votre compte.')).toBeInTheDocument();
      expect(screen.getByText('Vous n\'avez pas reçu l\'email ? Vérifiez votre dossier spam ou cliquez ci-dessous pour renvoyer.')).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Retour à la connexion' })).toBeInTheDocument();
    });

    it('should have email icon', () => {
      render(<VerifyEmailCard />);

      const emailIcon = screen.getByRole('img', { hidden: true });
      expect(emailIcon).toBeInTheDocument();
    });

    it('should have link to sign in page', () => {
      render(<VerifyEmailCard />);

      const backLink = screen.getByRole('link', { name: 'Retour à la connexion' });
      expect(backLink).toHaveAttribute('href', '/');
    });

    it('should have proper button type', () => {
      render(<VerifyEmailCard />);

      const resendButton = screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' });
      expect(resendButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Resend Email Functionality', () => {
    const mockSession = {
      data: {
        user: {
          email: 'test@example.com',
        },
      },
    };

    it('should resend verification email successfully', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockResolvedValue(mockSession);
      mockAuthClient.sendVerificationEmail.mockResolvedValue({});

      render(<VerifyEmailCard />);

      const resendButton = screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' });
      await user.click(resendButton);

      await waitFor(() => {
        expect(mockAuthClient.getSession).toHaveBeenCalled();
        expect(mockAuthClient.sendVerificationEmail).toHaveBeenCalledWith({
          email: 'test@example.com',
          callbackURL: 'http://localhost:3000/email-verified',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Verification email sent! Please check your inbox.')).toBeInTheDocument();
      });
    });

    it('should show loading state during resend', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<VerifyEmailCard />);

      const resendButton = screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' });
      await user.click(resendButton);

      await waitFor(() => {
        expect(screen.getByText('Envoi en cours...')).toBeInTheDocument();
        expect(resendButton).toBeDisabled();
      });
    });

    it('should show error when no session available', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockResolvedValue(null);

      render(<VerifyEmailCard />);

      const resendButton = screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' });
      await user.click(resendButton);

      await waitFor(() => {
        expect(screen.getByText('Unable to resend email. Please sign up again.')).toBeInTheDocument();
      });
    });

    it('should show error when session has no email', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockResolvedValue({
        data: { user: {} }
      });

      render(<VerifyEmailCard />);

      const resendButton = screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' });
      await user.click(resendButton);

      await waitFor(() => {
        expect(screen.getByText('Unable to resend email. Please sign up again.')).toBeInTheDocument();
      });
    });

    it('should show error when sendVerificationEmail fails', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockResolvedValue(mockSession);
      mockAuthClient.sendVerificationEmail.mockRejectedValue(new Error('Network error'));

      render(<VerifyEmailCard />);

      const resendButton = screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' });
      await user.click(resendButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to resend email. Please try again later.')).toBeInTheDocument();
      });

      // Button should be enabled again after error
      expect(resendButton).not.toBeDisabled();
    });

    it('should show error when getSession fails', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockRejectedValue(new Error('Session error'));

      render(<VerifyEmailCard />);

      const resendButton = screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' });
      await user.click(resendButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to resend email. Please try again later.')).toBeInTheDocument();
      });
    });
  });

  describe('Rate Limiting', () => {
    const mockSession = {
      data: {
        user: {
          email: 'test@example.com',
        },
      },
    };

    it('should enforce rate limiting after successful resend', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockResolvedValue(mockSession);
      mockAuthClient.sendVerificationEmail.mockResolvedValue({});

      render(<VerifyEmailCard />);

      const resendButton = screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' });

      // First click - should succeed
      await user.click(resendButton);

      await waitFor(() => {
        expect(screen.getByText('Verification email sent! Please check your inbox.')).toBeInTheDocument();
      });

      // Advance time by 30 seconds (less than 60s rate limit)
      mockDateNow.mockReturnValue(1000000 + 30000);

      // Second click - should be rate limited
      await user.click(resendButton);

      await waitFor(() => {
        expect(screen.getByText('Please wait 30 seconds before resending.')).toBeInTheDocument();
      });

      // Should not call API again
      expect(mockAuthClient.sendVerificationEmail).toHaveBeenCalledTimes(1);
    });

    it('should allow resend after rate limit expires', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockResolvedValue(mockSession);
      mockAuthClient.sendVerificationEmail.mockResolvedValue({});

      render(<VerifyEmailCard />);

      const resendButton = screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' });

      // First click
      await user.click(resendButton);
      await waitFor(() => {
        expect(screen.getByText('Verification email sent! Please check your inbox.')).toBeInTheDocument();
      });

      // Advance time by 61 seconds (past rate limit)
      mockDateNow.mockReturnValue(1000000 + 61000);

      // Should be able to resend again
      await user.click(resendButton);

      await waitFor(() => {
        expect(mockAuthClient.sendVerificationEmail).toHaveBeenCalledTimes(2);
      });
    });

    it('should show countdown timer when rate limited', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockResolvedValue(mockSession);
      mockAuthClient.sendVerificationEmail.mockResolvedValue({});

      render(<VerifyEmailCard />);

      const resendButton = screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' });

      // First successful resend
      await user.click(resendButton);
      await waitFor(() => {
        expect(screen.getByText('Verification email sent! Please check your inbox.')).toBeInTheDocument();
      });

      // Check button shows countdown
      mockDateNow.mockReturnValue(1000000 + 10000); // 10 seconds later

      // Re-render to update button text
      render(<VerifyEmailCard />);

      // Button should show remaining time
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Renvoyer dans \d+s/ })).toBeInTheDocument();
      });
    });

    it('should disable button when rate limited', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockResolvedValue(mockSession);
      mockAuthClient.sendVerificationEmail.mockResolvedValue({});

      render(<VerifyEmailCard />);

      const resendButton = screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' });

      // First click
      await user.click(resendButton);
      await waitFor(() => {
        expect(screen.getByText('Verification email sent! Please check your inbox.')).toBeInTheDocument();
      });

      // Advance time slightly
      mockDateNow.mockReturnValue(1000000 + 1000);

      // Re-render component to see updated state
      render(<VerifyEmailCard />);

      // Button should be disabled due to rate limiting
      const updatedButton = screen.getByRole('button', { name: /Renvoyer dans/ });
      expect(updatedButton).toBeDisabled();
    });
  });

  describe('Message States', () => {
    it('should show success message with green styling', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockResolvedValue({
        data: { user: { email: 'test@example.com' } }
      });
      mockAuthClient.sendVerificationEmail.mockResolvedValue({});

      render(<VerifyEmailCard />);

      await user.click(screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' }));

      await waitFor(() => {
        const successMessage = screen.getByText('Verification email sent! Please check your inbox.');
        expect(successMessage).toHaveClass('text-green-800');
        expect(successMessage.closest('div')).toHaveClass('bg-green-50', 'border-green-200');
      });
    });

    it('should show error message with red styling', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockResolvedValue(null);

      render(<VerifyEmailCard />);

      await user.click(screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' }));

      await waitFor(() => {
        const errorMessage = screen.getByText('Unable to resend email. Please sign up again.');
        expect(errorMessage).toHaveClass('text-red-800');
        expect(errorMessage.closest('div')).toHaveClass('bg-red-50', 'border-red-200');
      });
    });

    it('should clear previous messages when starting new resend', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession
        .mockResolvedValueOnce(null) // First call fails
        .mockResolvedValueOnce({ data: { user: { email: 'test@example.com' } } }); // Second call succeeds
      mockAuthClient.sendVerificationEmail.mockResolvedValue({});

      render(<VerifyEmailCard />);

      const resendButton = screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' });

      // First click - error
      await user.click(resendButton);
      await waitFor(() => {
        expect(screen.getByText('Unable to resend email. Please sign up again.')).toBeInTheDocument();
      });

      // Second click - success (should clear previous error)
      await user.click(resendButton);
      await waitFor(() => {
        expect(screen.getByText('Verification email sent! Please check your inbox.')).toBeInTheDocument();
        expect(screen.queryByText('Unable to resend email. Please sign up again.')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button type', () => {
      render(<VerifyEmailCard />);

      const resendButton = screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' });
      expect(resendButton).toHaveAttribute('type', 'button');
    });

    it('should have accessible email icon', () => {
      render(<VerifyEmailCard />);

      // SVG should be present and accessible
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<VerifyEmailCard />);

      // Tab to resend button
      await user.tab();
      expect(screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' })).toHaveFocus();

      // Tab to back link
      await user.tab();
      expect(screen.getByRole('link', { name: 'Retour à la connexion' })).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<VerifyEmailCard />);

      const resendButton = screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' });

      // Rapid clicks
      await user.click(resendButton);
      await user.click(resendButton);
      await user.click(resendButton);

      await waitFor(() => {
        expect(resendButton).toBeDisabled();
      });

      // Should only be called once
      expect(mockAuthClient.getSession).toHaveBeenCalledTimes(1);
    });

    it('should handle malformed session data', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockResolvedValue({
        data: null
      });

      render(<VerifyEmailCard />);

      await user.click(screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' }));

      await waitFor(() => {
        expect(screen.getByText('Unable to resend email. Please sign up again.')).toBeInTheDocument();
      });
    });

    it('should handle session with undefined user', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockResolvedValue({
        data: { user: undefined }
      });

      render(<VerifyEmailCard />);

      await user.click(screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' }));

      await waitFor(() => {
        expect(screen.getByText('Unable to resend email. Please sign up again.')).toBeInTheDocument();
      });
    });

    it('should handle different window origins', async () => {
      const user = userEvent.setup();
      // Mock different origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://mydomain.com' },
        writable: true,
      });

      mockAuthClient.getSession.mockResolvedValue({
        data: { user: { email: 'test@example.com' } }
      });
      mockAuthClient.sendVerificationEmail.mockResolvedValue({});

      render(<VerifyEmailCard />);

      await user.click(screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' }));

      await waitFor(() => {
        expect(mockAuthClient.sendVerificationEmail).toHaveBeenCalledWith({
          email: 'test@example.com',
          callbackURL: 'https://mydomain.com/email-verified',
        });
      });
    });

    it('should handle console.error for failed resends', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockAuthClient.getSession.mockResolvedValue({
        data: { user: { email: 'test@example.com' } }
      });
      mockAuthClient.sendVerificationEmail.mockRejectedValue(new Error('API Error'));

      render(<VerifyEmailCard />);

      await user.click(screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' }));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to resend verification email:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Timer and State Management', () => {
    it('should calculate remaining time correctly', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockResolvedValue({
        data: { user: { email: 'test@example.com' } }
      });
      mockAuthClient.sendVerificationEmail.mockResolvedValue({});

      render(<VerifyEmailCard />);

      // Send email first
      await user.click(screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' }));
      await waitFor(() => {
        expect(screen.getByText('Verification email sent! Please check your inbox.')).toBeInTheDocument();
      });

      // Advance time to 30 seconds remaining
      mockDateNow.mockReturnValue(1000000 + 30000);

      // Re-render to update state
      render(<VerifyEmailCard />);

      await waitFor(() => {
        const buttonText = screen.getByRole('button').textContent;
        expect(buttonText).toMatch(/Renvoyer dans 30s/);
      });
    });

    it('should handle time calculations at boundaries', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockResolvedValue({
        data: { user: { email: 'test@example.com' } }
      });
      mockAuthClient.sendVerificationEmail.mockResolvedValue({});

      render(<VerifyEmailCard />);

      // Send email first
      await user.click(screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' }));
      await waitFor(() => {
        expect(screen.getByText('Verification email sent! Please check your inbox.')).toBeInTheDocument();
      });

      // Test exactly at rate limit boundary (60 seconds)
      mockDateNow.mockReturnValue(1000000 + 60000);

      // Re-render to update state
      render(<VerifyEmailCard />);

      // Should be able to resend again
      const resendButton = screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' });
      expect(resendButton).not.toBeDisabled();
    });

    it('should maintain state across re-renders', async () => {
      const user = userEvent.setup();
      mockAuthClient.getSession.mockResolvedValue({
        data: { user: { email: 'test@example.com' } }
      });
      mockAuthClient.sendVerificationEmail.mockResolvedValue({});

      const { rerender } = render(<VerifyEmailCard />);

      // Send email
      await user.click(screen.getByRole('button', { name: 'Renvoyer l\'email de vérification' }));
      await waitFor(() => {
        expect(screen.getByText('Verification email sent! Please check your inbox.')).toBeInTheDocument();
      });

      // Re-render component
      rerender(<VerifyEmailCard />);

      // Message should still be there
      expect(screen.getByText('Verification email sent! Please check your inbox.')).toBeInTheDocument();
    });
  });
});