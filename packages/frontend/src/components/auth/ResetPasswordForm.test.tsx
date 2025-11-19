/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { ResetPasswordForm } from './ResetPasswordForm';

// Mock authClient
jest.mock('~/lib/auth-client', () => ({
  authClient: {
    resetPassword: jest.fn(),
  },
}));

import { authClient } from '~/lib/auth-client';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockAuthClient = authClient as {
  resetPassword: jest.MockedFunction<any>;
};

// Mock setTimeout to avoid waiting in tests
jest.useFakeTimers();

describe('ResetPasswordForm Component', () => {
  const defaultProps = {
    token: 'valid-reset-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('Basic Rendering - Form State', () => {
    it('should render form elements correctly', () => {
      render(<ResetPasswordForm {...defaultProps} />);

      expect(screen.getByText('Reset your password')).toBeInTheDocument();
      expect(screen.getByText('Enter your new password')).toBeInTheDocument();

      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back to sign in' })).toBeInTheDocument();
    });

    it('should have proper input attributes', () => {
      render(<ResetPasswordForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('id', 'password');
      expect(passwordInput).toHaveAttribute('placeholder', '••••••••');

      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('id', 'confirmPassword');
      expect(confirmPasswordInput).toHaveAttribute('placeholder', '••••••••');
    });

    it('should have link to sign in page', () => {
      render(<ResetPasswordForm {...defaultProps} />);

      const backLink = screen.getByRole('link', { name: 'Back to sign in' });
      expect(backLink).toHaveAttribute('href', '/');
    });

    it('should have proper button type', () => {
      render(<ResetPasswordForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty fields', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
        expect(screen.getByText('Passwords don\'t match')).toBeInTheDocument();
      });

      expect(mockAuthClient.resetPassword).not.toHaveBeenCalled();
    });

    it('should validate password minimum length', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText('New Password');
      await user.type(passwordInput, 'short');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });
    });

    it('should validate password uppercase requirement', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText('New Password');
      await user.type(passwordInput, 'password123'); // No uppercase
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument();
      });
    });

    it('should validate password lowercase requirement', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText('New Password');
      await user.type(passwordInput, 'PASSWORD123'); // No lowercase
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one lowercase letter')).toBeInTheDocument();
      });
    });

    it('should validate password number requirement', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText('New Password');
      await user.type(passwordInput, 'Password'); // No number
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
      });
    });

    it('should validate password confirmation match', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'DifferentPassword123');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Passwords don\'t match')).toBeInTheDocument();
      });
    });

    it('should clear validation errors when valid input is provided', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText('New Password');
      const submitButton = screen.getByRole('button', { name: 'Reset Password' });

      // Trigger validation error
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });

      // Fix the error
      await user.type(passwordInput, 'Password123');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText('Password must be at least 8 characters')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const validFormData = {
      password: 'Password123',
      confirmPassword: 'Password123',
    };

    it('should submit form with valid data and correct token', async () => {
      const user = userEvent.setup();
      mockAuthClient.resetPassword.mockResolvedValue({});

      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByLabelText('New Password'), validFormData.password);
      await user.type(screen.getByLabelText('Confirm Password'), validFormData.confirmPassword);

      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthClient.resetPassword).toHaveBeenCalledWith({
          newPassword: validFormData.password,
          token: defaultProps.token,
        });
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockAuthClient.resetPassword.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByLabelText('New Password'), validFormData.password);
      await user.type(screen.getByLabelText('Confirm Password'), validFormData.confirmPassword);

      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Resetting...')).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });

    it('should show success state and redirect after successful reset', async () => {
      const user = userEvent.setup();
      mockAuthClient.resetPassword.mockResolvedValue({});

      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByLabelText('New Password'), validFormData.password);
      await user.type(screen.getByLabelText('Confirm Password'), validFormData.confirmPassword);

      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      await user.click(submitButton);

      // Should show success state
      await waitFor(() => {
        expect(screen.getByText('Password reset successful')).toBeInTheDocument();
        expect(screen.getByText('Your password has been reset. Redirecting to sign in...')).toBeInTheDocument();
      });

      // Form should no longer be visible
      expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Confirm Password')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Reset Password' })).not.toBeInTheDocument();

      // Should redirect after 2 seconds
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should show error message when reset fails', async () => {
      const user = userEvent.setup();
      mockAuthClient.resetPassword.mockRejectedValue(new Error('Network error'));

      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByLabelText('New Password'), validFormData.password);
      await user.type(screen.getByLabelText('Confirm Password'), validFormData.confirmPassword);

      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to reset password. The link may be expired.')).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
      });

      // Form should still be visible
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    });

    it('should clear error message when resubmitting', async () => {
      const user = userEvent.setup();
      mockAuthClient.resetPassword
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({});

      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByLabelText('New Password'), validFormData.password);
      await user.type(screen.getByLabelText('Confirm Password'), validFormData.confirmPassword);

      const submitButton = screen.getByRole('button', { name: 'Reset Password' });

      // First submission with error
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Failed to reset password. The link may be expired.')).toBeInTheDocument();
      });

      // Second submission should clear error
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.queryByText('Failed to reset password. The link may be expired.')).not.toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      mockAuthClient.resetPassword.mockResolvedValue({});

      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByLabelText('New Password'), 'Password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'Password123');
      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      await waitFor(() => {
        expect(screen.getByText('Password reset successful')).toBeInTheDocument();
      });
    });

    it('should show success message', () => {
      expect(screen.getByText('Password reset successful')).toBeInTheDocument();
      expect(screen.getByText('Your password has been reset. Redirecting to sign in...')).toBeInTheDocument();
    });

    it('should not show form elements in success state', () => {
      expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Confirm Password')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Reset Password' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Back to sign in' })).not.toBeInTheDocument();
    });

    it('should redirect to home page after 2 seconds', async () => {
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should not redirect immediately', () => {
      jest.advanceTimersByTime(1000); // 1 second
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Token Handling', () => {
    it('should use provided token in API call', async () => {
      const user = userEvent.setup();
      const customToken = 'custom-reset-token-123';
      mockAuthClient.resetPassword.mockResolvedValue({});

      render(<ResetPasswordForm token={customToken} />);

      await user.type(screen.getByLabelText('New Password'), 'Password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'Password123');
      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      await waitFor(() => {
        expect(mockAuthClient.resetPassword).toHaveBeenCalledWith({
          newPassword: 'Password123',
          token: customToken,
        });
      });
    });

    it('should work with empty token', async () => {
      const user = userEvent.setup();
      mockAuthClient.resetPassword.mockResolvedValue({});

      render(<ResetPasswordForm token="" />);

      await user.type(screen.getByLabelText('New Password'), 'Password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'Password123');
      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      await waitFor(() => {
        expect(mockAuthClient.resetPassword).toHaveBeenCalledWith({
          newPassword: 'Password123',
          token: '',
        });
      });
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in both password fields', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'Password123');

      expect(passwordInput).toHaveValue('Password123');
      expect(confirmPasswordInput).toHaveValue('Password123');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      // Tab through form elements
      await user.tab();
      expect(screen.getByLabelText('New Password')).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('Confirm Password')).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Reset Password' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: 'Back to sign in' })).toHaveFocus();
    });

    it('should submit form when Enter key is pressed', async () => {
      const user = userEvent.setup();
      mockAuthClient.resetPassword.mockResolvedValue({});

      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByLabelText('New Password'), 'Password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'Password123');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockAuthClient.resetPassword).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels associated with inputs', () => {
      render(<ResetPasswordForm {...defaultProps} />);

      expect(screen.getByLabelText('New Password')).toHaveAttribute('id', 'password');
      expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('id', 'confirmPassword');
    });

    it('should have semantic form structure', () => {
      render(<ResetPasswordForm {...defaultProps} />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form.tagName).toBe('FORM');
    });

    it('should show error messages with proper styling', async () => {
      const user = userEvent.setup();
      mockAuthClient.resetPassword.mockRejectedValue(new Error('Network error'));

      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByLabelText('New Password'), 'Password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'Password123');
      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      await waitFor(() => {
        const errorElement = screen.getByText('Failed to reset password. The link may be expired.');
        expect(errorElement).toHaveClass('text-red-800');
      });
    });

    it('should show validation errors with proper styling', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: 'Reset Password' });
      await user.click(submitButton);

      await waitFor(() => {
        const validationError = screen.getByText('Password must be at least 8 characters');
        expect(validationError).toHaveClass('text-red-600');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup();
      mockAuthClient.resetPassword.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByLabelText('New Password'), 'Password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'Password123');

      const submitButton = screen.getByRole('button', { name: 'Reset Password' });

      // Rapid clicks
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Should only be called once
      expect(mockAuthClient.resetPassword).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters in password', async () => {
      const user = userEvent.setup();
      mockAuthClient.resetPassword.mockResolvedValue({});

      render(<ResetPasswordForm {...defaultProps} />);

      const specialPassword = 'Pássword123!@#';
      await user.type(screen.getByLabelText('New Password'), specialPassword);
      await user.type(screen.getByLabelText('Confirm Password'), specialPassword);
      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      await waitFor(() => {
        expect(mockAuthClient.resetPassword).toHaveBeenCalledWith({
          newPassword: specialPassword,
          token: defaultProps.token,
        });
      });
    });

    it('should handle very long passwords', async () => {
      const user = userEvent.setup();
      mockAuthClient.resetPassword.mockResolvedValue({});

      render(<ResetPasswordForm {...defaultProps} />);

      const longPassword = 'Password123' + 'a'.repeat(100);
      await user.type(screen.getByLabelText('New Password'), longPassword);
      await user.type(screen.getByLabelText('Confirm Password'), longPassword);
      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      await waitFor(() => {
        expect(mockAuthClient.resetPassword).toHaveBeenCalledWith({
          newPassword: longPassword,
          token: defaultProps.token,
        });
      });
    });

    it('should maintain form state after error', async () => {
      const user = userEvent.setup();
      mockAuthClient.resetPassword.mockRejectedValue(new Error('Network error'));

      render(<ResetPasswordForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'Password123');
      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      await waitFor(() => {
        expect(screen.getByText('Failed to reset password. The link may be expired.')).toBeInTheDocument();
      });

      // Form values should be retained
      expect(passwordInput).toHaveValue('Password123');
      expect(confirmPasswordInput).toHaveValue('Password123');

      // Form should still be in form state (not success state)
      expect(screen.getByText('Reset your password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();
    });

    it('should handle timeout cleanup on unmount', async () => {
      const user = userEvent.setup();
      mockAuthClient.resetPassword.mockResolvedValue({});

      const { unmount } = render(<ResetPasswordForm {...defaultProps} />);

      await user.type(screen.getByLabelText('New Password'), 'Password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'Password123');
      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Password reset successful')).toBeInTheDocument();
      });

      // Unmount before timeout fires
      unmount();

      // Advance time - should not call router.push
      jest.advanceTimersByTime(2000);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Component State Transitions', () => {
    it('should transition from form to success state correctly', async () => {
      const user = userEvent.setup();
      mockAuthClient.resetPassword.mockResolvedValue({});

      render(<ResetPasswordForm {...defaultProps} />);

      // Initial state
      expect(screen.getByText('Reset your password')).toBeInTheDocument();
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();

      // Submit form
      await user.type(screen.getByLabelText('New Password'), 'Password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'Password123');
      await user.click(screen.getByRole('button', { name: 'Reset Password' }));

      // Success state
      await waitFor(() => {
        expect(screen.getByText('Password reset successful')).toBeInTheDocument();
        expect(screen.queryByText('Reset your password')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument();
      });
    });
  });
});