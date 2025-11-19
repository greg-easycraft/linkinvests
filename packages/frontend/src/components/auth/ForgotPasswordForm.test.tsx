import { render, screen, waitFor } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordForm } from './ForgotPasswordForm';

// Mock authClient
jest.mock('~/lib/auth-client', () => ({
  authClient: {
    forgetPassword: jest.fn(),
  },
}));

import { authClient } from '~/lib/auth-client';

const mockAuthClient = authClient as {
  forgetPassword: jest.MockedFunction<any>;
};

describe('ForgotPasswordForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering - Form State', () => {
    it('should render form elements correctly', () => {
      render(<ForgotPasswordForm />);

      expect(screen.getByText('Mot de passe oublié')).toBeInTheDocument();
      expect(screen.getByText('Entrez votre adresse email et nous vous enverrons un lien de réinitialisation')).toBeInTheDocument();

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('votre@email.com')).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Retour à la connexion' })).toBeInTheDocument();
    });

    it('should have proper input attributes', () => {
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'votre@email.com');
    });

    it('should have link to login page', () => {
      render(<ForgotPasswordForm />);

      const backLink = screen.getByRole('link', { name: 'Retour à la connexion' });
      expect(backLink).toHaveAttribute('href', '/');
    });

    it('should have proper button type', () => {
      render(<ForgotPasswordForm />);

      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for invalid email', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Adresse email invalide')).toBeInTheDocument();
      });

      expect(mockAuthClient.forgetPassword).not.toHaveBeenCalled();
    });

    it('should show validation error for empty email', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Adresse email invalide')).toBeInTheDocument();
      });

      expect(mockAuthClient.forgetPassword).not.toHaveBeenCalled();
    });

    it('should clear validation error when valid email is entered', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      // Enter invalid email first
      await user.type(emailInput, 'invalid');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Adresse email invalide')).toBeInTheDocument();
      });

      // Clear and enter valid email
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText('Adresse email invalide')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const validEmail = 'test@example.com';

    it('should submit form with valid email', async () => {
      const user = userEvent.setup();
      mockAuthClient.forgetPassword.mockResolvedValue({});

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      await user.type(emailInput, validEmail);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthClient.forgetPassword).toHaveBeenCalledWith({
          email: validEmail,
          redirectTo: '/reset-password',
        });
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockAuthClient.forgetPassword.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      await user.type(emailInput, validEmail);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Envoi en cours...')).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });

    it('should show success state after successful submission', async () => {
      const user = userEvent.setup();
      mockAuthClient.forgetPassword.mockResolvedValue({});

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      await user.type(emailInput, validEmail);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Vérifiez votre email')).toBeInTheDocument();
        expect(screen.getByText('Nous vous avons envoyé un lien de réinitialisation. Veuillez vérifier votre boîte de réception.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Retour à la connexion' })).toBeInTheDocument();
      });

      // Form elements should no longer be present
      expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Envoyer le lien de réinitialisation' })).not.toBeInTheDocument();
    });

    it('should show error message when submission fails', async () => {
      const user = userEvent.setup();
      mockAuthClient.forgetPassword.mockRejectedValue(new Error('Network error'));

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      await user.type(emailInput, validEmail);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Échec de l\'envoi de l\'email de réinitialisation. Veuillez réessayer.')).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
      });

      // Form should still be visible
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' })).toBeInTheDocument();
    });

    it('should clear error message when resubmitting', async () => {
      const user = userEvent.setup();
      mockAuthClient.forgetPassword
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({});

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      await user.type(emailInput, validEmail);

      // First submission with error
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Échec de l\'envoi de l\'email de réinitialisation. Veuillez réessayer.')).toBeInTheDocument();
      });

      // Second submission should clear error
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.queryByText('Échec de l\'envoi de l\'email de réinitialisation. Veuillez réessayer.')).not.toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      mockAuthClient.forgetPassword.mockResolvedValue({});

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Vérifiez votre email')).toBeInTheDocument();
      });
    });

    it('should show success message and instructions', () => {
      expect(screen.getByText('Vérifiez votre email')).toBeInTheDocument();
      expect(screen.getByText('Nous vous avons envoyé un lien de réinitialisation. Veuillez vérifier votre boîte de réception.')).toBeInTheDocument();
    });

    it('should show back to login link in success state', () => {
      const backLink = screen.getByRole('link', { name: 'Retour à la connexion' });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/');
    });

    it('should not show form elements in success state', () => {
      expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Envoyer le lien de réinitialisation' })).not.toBeInTheDocument();
      expect(screen.queryByText('Mot de passe oublié')).not.toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in email field', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      // Tab to email input
      await user.tab();
      expect(screen.getByLabelText('Email')).toHaveFocus();

      // Tab to submit button
      await user.tab();
      expect(screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' })).toHaveFocus();

      // Tab to back link
      await user.tab();
      expect(screen.getByRole('link', { name: 'Retour à la connexion' })).toHaveFocus();
    });

    it('should submit form when Enter key is pressed', async () => {
      const user = userEvent.setup();
      mockAuthClient.forgetPassword.mockResolvedValue({});

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'test@example.com');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockAuthClient.forgetPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          redirectTo: '/reset-password',
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('id', 'email');

      const label = screen.getByText('Email');
      expect(label).toHaveAttribute('for', 'email');
    });

    it('should have semantic form structure', () => {
      render(<ForgotPasswordForm />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form.tagName).toBe('FORM');
    });

    it('should show error messages with proper styling', async () => {
      const user = userEvent.setup();
      mockAuthClient.forgetPassword.mockRejectedValue(new Error('Network error'));

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        const errorElement = screen.getByText('Échec de l\'envoi de l\'email de réinitialisation. Veuillez réessayer.');
        expect(errorElement).toHaveClass('text-red-800');
      });
    });

    it('should show validation errors with proper styling', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        const validationError = screen.getByText('Adresse email invalide');
        expect(validationError).toHaveClass('text-red-600');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty email submission', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Adresse email invalide')).toBeInTheDocument();
      });

      expect(mockAuthClient.forgetPassword).not.toHaveBeenCalled();
    });

    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup();
      mockAuthClient.forgetPassword.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      await user.type(emailInput, 'test@example.com');

      // Rapid clicks
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Should only be called once
      expect(mockAuthClient.forgetPassword).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters in email', async () => {
      const user = userEvent.setup();
      mockAuthClient.forgetPassword.mockResolvedValue({});

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      const specialEmail = 'test+tag@éxample.com';
      await user.type(emailInput, specialEmail);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthClient.forgetPassword).toHaveBeenCalledWith({
          email: specialEmail,
          redirectTo: '/reset-password',
        });
      });
    });

    it('should handle long email addresses', async () => {
      const user = userEvent.setup();
      mockAuthClient.forgetPassword.mockResolvedValue({});

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      const longEmail = 'very.long.email.address.with.many.dots@very-long-domain-name.example.com';
      await user.type(emailInput, longEmail);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthClient.forgetPassword).toHaveBeenCalledWith({
          email: longEmail,
          redirectTo: '/reset-password',
        });
      });
    });

    it('should handle whitespace in email input', async () => {
      const user = userEvent.setup();
      mockAuthClient.forgetPassword.mockResolvedValue({});

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      // Type email with leading/trailing whitespace
      await user.type(emailInput, '  test@example.com  ');
      await user.click(submitButton);

      await waitFor(() => {
        // The form should handle whitespace appropriately (either trim or validate)
        expect(mockAuthClient.forgetPassword).toHaveBeenCalled();
      });
    });
  });

  describe('Component State Transitions', () => {
    it('should transition from form to success state correctly', async () => {
      const user = userEvent.setup();
      mockAuthClient.forgetPassword.mockResolvedValue({});

      render(<ForgotPasswordForm />);

      // Initial state
      expect(screen.getByText('Mot de passe oublié')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();

      // Submit form
      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      // Success state
      await waitFor(() => {
        expect(screen.getByText('Vérifiez votre email')).toBeInTheDocument();
        expect(screen.queryByText('Mot de passe oublié')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
      });
    });

    it('should maintain form state after error', async () => {
      const user = userEvent.setup();
      mockAuthClient.forgetPassword.mockRejectedValue(new Error('Network error'));

      render(<ForgotPasswordForm />);

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Échec de l\'envoi de l\'email de réinitialisation. Veuillez réessayer.')).toBeInTheDocument();
      });

      // Form should still be in form state (not success state)
      expect(screen.getByText('Mot de passe oublié')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Envoyer le lien de réinitialisation' })).toBeInTheDocument();

      // Email input should retain its value
      expect(emailInput).toHaveValue('test@example.com');
    });
  });
});