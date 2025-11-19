import { render, screen, waitFor } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from './SignUpForm';

// Mock authClient
jest.mock('~/lib/auth-client', () => ({
  authClient: {
    signUp: {
      email: jest.fn(),
    },
    signIn: {
      social: jest.fn(),
    },
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
  signUp: {
    email: jest.MockedFunction<any>;
  };
  signIn: {
    social: jest.MockedFunction<any>;
  };
};

describe('SignUpForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render all form fields', () => {
      render(<SignUpForm />);

      expect(screen.getByText('Créer un compte')).toBeInTheDocument();
      expect(screen.getByText('Créez votre nouveau compte')).toBeInTheDocument();

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    });

    it('should have proper input placeholders', () => {
      render(<SignUpForm />);

      expect(screen.getByPlaceholderText('Your full name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
    });

    it('should have sign in link', () => {
      render(<SignUpForm />);

      const signInLink = screen.getByRole('link', { name: 'Connectez-vous' });
      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute('href', '/');
    });

    it('should show Google sign up option', () => {
      render(<SignUpForm />);

      expect(screen.getByText('Ou continuez avec')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
        expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
      });
    });

    it('should validate name length requirements', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const nameInput = screen.getByLabelText('Name');

      // Test minimum length
      await user.type(nameInput, 'A');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      });

      // Test maximum length (simulate typing very long name)
      await user.clear(nameInput);
      await user.type(nameInput, 'A'.repeat(101));
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Name must be less than 100 characters')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const emailInput = screen.getByLabelText('Email');

      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });

    it('should validate password requirements', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const passwordInput = screen.getByLabelText('Password');

      // Test minimum length
      await user.type(passwordInput, 'short');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });

      // Test lowercase requirement
      await user.clear(passwordInput);
      await user.type(passwordInput, 'PASSWORD1');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one lowercase letter')).toBeInTheDocument();
      });

      // Test uppercase requirement
      await user.clear(passwordInput);
      await user.type(passwordInput, 'password1');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument();
      });

      // Test number requirement
      await user.clear(passwordInput);
      await user.type(passwordInput, 'Password');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
      });
    });

    it('should validate password confirmation match', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'DifferentPassword123');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should clear validation errors when valid input is provided', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const nameInput = screen.getByLabelText('Name');
      const submitButton = screen.getByRole('button', { name: 'Sign Up' });

      // Trigger validation error
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });

      // Fix the error
      await user.type(nameInput, 'John Doe');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const validFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    };

    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      mockAuthClient.signUp.email.mockResolvedValue({});

      render(<SignUpForm />);

      await user.type(screen.getByLabelText('Name'), validFormData.name);
      await user.type(screen.getByLabelText('Email'), validFormData.email);
      await user.type(screen.getByLabelText('Password'), validFormData.password);
      await user.type(screen.getByLabelText('Confirm Password'), validFormData.confirmPassword);

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthClient.signUp.email).toHaveBeenCalledWith({
          name: validFormData.name,
          email: validFormData.email,
          password: validFormData.password,
        });
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockAuthClient.signUp.email.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<SignUpForm />);

      await user.type(screen.getByLabelText('Name'), validFormData.name);
      await user.type(screen.getByLabelText('Email'), validFormData.email);
      await user.type(screen.getByLabelText('Password'), validFormData.password);
      await user.type(screen.getByLabelText('Confirm Password'), validFormData.confirmPassword);

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Creating account...')).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeDisabled();
      });
    });

    it('should redirect to verify-email page on successful signup', async () => {
      const user = userEvent.setup();
      mockAuthClient.signUp.email.mockResolvedValue({});

      render(<SignUpForm />);

      await user.type(screen.getByLabelText('Name'), validFormData.name);
      await user.type(screen.getByLabelText('Email'), validFormData.email);
      await user.type(screen.getByLabelText('Password'), validFormData.password);
      await user.type(screen.getByLabelText('Confirm Password'), validFormData.confirmPassword);

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/verify-email');
      });
    });

    it('should show error message when signup fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Email already exists';
      mockAuthClient.signUp.email.mockResolvedValue({
        error: { message: errorMessage }
      });

      render(<SignUpForm />);

      await user.type(screen.getByLabelText('Name'), validFormData.name);
      await user.type(screen.getByLabelText('Email'), validFormData.email);
      await user.type(screen.getByLabelText('Password'), validFormData.password);
      await user.type(screen.getByLabelText('Confirm Password'), validFormData.confirmPassword);

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should show generic error message when signup fails without specific message', async () => {
      const user = userEvent.setup();
      mockAuthClient.signUp.email.mockResolvedValue({
        error: {}
      });

      render(<SignUpForm />);

      await user.type(screen.getByLabelText('Name'), validFormData.name);
      await user.type(screen.getByLabelText('Email'), validFormData.email);
      await user.type(screen.getByLabelText('Password'), validFormData.password);
      await user.type(screen.getByLabelText('Confirm Password'), validFormData.confirmPassword);

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An error occurred during sign up')).toBeInTheDocument();
      });
    });

    it('should handle unexpected errors during signup', async () => {
      const user = userEvent.setup();
      mockAuthClient.signUp.email.mockRejectedValue(new Error('Network error'));

      render(<SignUpForm />);

      await user.type(screen.getByLabelText('Name'), validFormData.name);
      await user.type(screen.getByLabelText('Email'), validFormData.email);
      await user.type(screen.getByLabelText('Password'), validFormData.password);
      await user.type(screen.getByLabelText('Confirm Password'), validFormData.confirmPassword);

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should clear error message when resubmitting', async () => {
      const user = userEvent.setup();
      mockAuthClient.signUp.email
        .mockResolvedValueOnce({ error: { message: 'First error' } })
        .mockResolvedValueOnce({});

      render(<SignUpForm />);

      await user.type(screen.getByLabelText('Name'), validFormData.name);
      await user.type(screen.getByLabelText('Email'), validFormData.email);
      await user.type(screen.getByLabelText('Password'), validFormData.password);
      await user.type(screen.getByLabelText('Confirm Password'), validFormData.confirmPassword);

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });

      // First submission with error
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second submission should clear error
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Google Sign Up', () => {
    it('should call Google sign up when button is clicked', async () => {
      const user = userEvent.setup();
      mockAuthClient.signIn.social.mockResolvedValue({});

      render(<SignUpForm />);

      const googleButton = screen.getByRole('button', { name: 'Continue with Google' });
      await user.click(googleButton);

      await waitFor(() => {
        expect(mockAuthClient.signIn.social).toHaveBeenCalledWith({
          provider: 'google',
          callbackURL: '/search',
        });
      });
    });

    it('should show loading state during Google sign up', async () => {
      const user = userEvent.setup();
      mockAuthClient.signIn.social.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<SignUpForm />);

      const googleButton = screen.getByRole('button', { name: 'Continue with Google' });
      await user.click(googleButton);

      await waitFor(() => {
        expect(googleButton).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Sign Up' })).toBeDisabled();
      });
    });

    it('should show error message when Google sign up fails', async () => {
      const user = userEvent.setup();
      mockAuthClient.signIn.social.mockRejectedValue(new Error('Google auth failed'));

      render(<SignUpForm />);

      const googleButton = screen.getByRole('button', { name: 'Continue with Google' });
      await user.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to sign up with Google')).toBeInTheDocument();
        expect(googleButton).not.toBeDisabled();
      });
    });

    it('should clear error message when starting new Google sign up', async () => {
      const user = userEvent.setup();
      mockAuthClient.signIn.social
        .mockRejectedValueOnce(new Error('Google auth failed'))
        .mockResolvedValueOnce({});

      render(<SignUpForm />);

      const googleButton = screen.getByRole('button', { name: 'Continue with Google' });

      // First attempt with error
      await user.click(googleButton);
      await waitFor(() => {
        expect(screen.getByText('Failed to sign up with Google')).toBeInTheDocument();
      });

      // Second attempt should clear error
      await user.click(googleButton);
      await waitFor(() => {
        expect(screen.queryByText('Failed to sign up with Google')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in all fields', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'Password123');
      await user.type(confirmPasswordInput, 'Password123');

      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('john@example.com');
      expect(passwordInput).toHaveValue('Password123');
      expect(confirmPasswordInput).toHaveValue('Password123');
    });

    it('should have proper input types', () => {
      render(<SignUpForm />);

      expect(screen.getByLabelText('Name')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('type', 'password');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      // Tab through form elements
      await user.tab();
      expect(screen.getByLabelText('Name')).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('Email')).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('Password')).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('Confirm Password')).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Sign Up' })).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels associated with inputs', () => {
      render(<SignUpForm />);

      expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'name');
      expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email');
      expect(screen.getByLabelText('Password')).toHaveAttribute('id', 'password');
      expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('id', 'confirmPassword');
    });

    it('should have proper button types', () => {
      render(<SignUpForm />);

      expect(screen.getByRole('button', { name: 'Sign Up' })).toHaveAttribute('type', 'submit');
      expect(screen.getByRole('button', { name: 'Continue with Google' })).toHaveAttribute('type', 'button');
    });

    it('should have semantic form structure', () => {
      render(<SignUpForm />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form.tagName).toBe('FORM');
    });

    it('should show error messages with proper styling', async () => {
      const user = userEvent.setup();
      mockAuthClient.signUp.email.mockResolvedValue({
        error: { message: 'Test error' }
      });

      render(<SignUpForm />);

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(submitButton);

      await waitFor(() => {
        const errorElement = screen.getByText('Test error');
        expect(errorElement).toHaveClass('text-red-800');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty form submission', async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(submitButton);

      // Should show validation errors but not call API
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });

      expect(mockAuthClient.signUp.email).not.toHaveBeenCalled();
    });

    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup();
      mockAuthClient.signUp.email.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<SignUpForm />);

      await user.type(screen.getByLabelText('Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'Password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'Password123');

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });

      // Rapid clicks
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Should only be called once
      expect(mockAuthClient.signUp.email).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters in form fields', async () => {
      const user = userEvent.setup();
      mockAuthClient.signUp.email.mockResolvedValue({});

      render(<SignUpForm />);

      await user.type(screen.getByLabelText('Name'), 'José María O\'Connor');
      await user.type(screen.getByLabelText('Email'), 'josé@example.com');
      await user.type(screen.getByLabelText('Password'), 'Pássword123');
      await user.type(screen.getByLabelText('Confirm Password'), 'Pássword123');

      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthClient.signUp.email).toHaveBeenCalledWith({
          name: 'José María O\'Connor',
          email: 'josé@example.com',
          password: 'Pássword123',
        });
      });
    });
  });
});