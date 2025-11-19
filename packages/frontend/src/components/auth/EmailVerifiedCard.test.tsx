import { render, screen, waitFor } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { EmailVerifiedCard } from './EmailVerifiedCard';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock window.location
const mockLocation = {
  search: '',
  href: 'http://localhost:3000/email-verified',
  origin: 'http://localhost:3000',
  pathname: '/email-verified',
  hash: '',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock URLSearchParams
const originalURLSearchParams = window.URLSearchParams;

describe('EmailVerifiedCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockLocation.search = '';
  });

  afterEach(() => {
    window.URLSearchParams = originalURLSearchParams;
  });

  describe('Success State - Default Rendering', () => {
    it('should render success card elements correctly', () => {
      render(<EmailVerifiedCard />);

      expect(screen.getByText('Email vérifié !')).toBeInTheDocument();
      expect(screen.getByText('Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme.')).toBeInTheDocument();
      expect(screen.getByText('Bienvenue sur LinkInvests !')).toBeInTheDocument();
      expect(screen.getByText('Vous pouvez maintenant explorer les opportunités d\'investissement et commencer à constituer votre portefeuille immobilier.')).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Continuer vers l\'application' })).toBeInTheDocument();
    });

    it('should have success icon with green styling', () => {
      render(<EmailVerifiedCard />);

      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-green-600');
      expect(icon.closest('div')).toHaveClass('bg-green-100');
    });

    it('should have proper card structure', () => {
      const { container } = render(<EmailVerifiedCard />);

      const card = container.querySelector('.max-w-md');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-[var(--secundary)]');
    });

    it('should have correct button type', () => {
      render(<EmailVerifiedCard />);

      const continueButton = screen.getByRole('button', { name: 'Continuer vers l\'application' });
      expect(continueButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Navigation Functionality', () => {
    it('should navigate to search page when continue button is clicked', async () => {
      const user = userEvent.setup();
      render(<EmailVerifiedCard />);

      const continueButton = screen.getByRole('button', { name: 'Continuer vers l\'application' });
      await user.click(continueButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/search');
    });

    it('should show loading state during redirect', async () => {
      const user = userEvent.setup();
      render(<EmailVerifiedCard />);

      const continueButton = screen.getByRole('button', { name: 'Continuer vers l\'application' });
      await user.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('Redirection...')).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeDisabled();
      });
    });

    it('should disable button when redirecting', async () => {
      const user = userEvent.setup();
      render(<EmailVerifiedCard />);

      const continueButton = screen.getByRole('button', { name: 'Continuer vers l\'application' });
      await user.click(continueButton);

      await waitFor(() => {
        expect(continueButton).toBeDisabled();
      });
    });
  });

  describe('Error States', () => {
    it('should render error state for invalid_token error', () => {
      // Mock URLSearchParams to return invalid_token error
      const mockURLSearchParams = jest.fn().mockImplementation(() => ({
        get: jest.fn((key) => key === 'error' ? 'invalid_token' : null),
      }));
      window.URLSearchParams = mockURLSearchParams;

      render(<EmailVerifiedCard />);

      expect(screen.getByText('Vérification échouée')).toBeInTheDocument();
      expect(screen.getByText('Le lien de vérification est invalide ou a expiré. Veuillez vous inscrire à nouveau.')).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Créer un nouveau compte' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retour à la connexion' })).toBeInTheDocument();
    });

    it('should render error state for generic error', () => {
      // Mock URLSearchParams to return generic error
      const mockURLSearchParams = jest.fn().mockImplementation(() => ({
        get: jest.fn((key) => key === 'error' ? 'unknown_error' : null),
      }));
      window.URLSearchParams = mockURLSearchParams;

      render(<EmailVerifiedCard />);

      expect(screen.getByText('Vérification échouée')).toBeInTheDocument();
      expect(screen.getByText('Une erreur s\'est produite lors de la vérification. Veuillez réessayer.')).toBeInTheDocument();
    });

    it('should have error icon with red styling', () => {
      const mockURLSearchParams = jest.fn().mockImplementation(() => ({
        get: jest.fn((key) => key === 'error' ? 'invalid_token' : null),
      }));
      window.URLSearchParams = mockURLSearchParams;

      render(<EmailVerifiedCard />);

      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-red-600');
      expect(icon.closest('div')).toHaveClass('bg-red-100');
    });

    it('should navigate to sign-up when create account button is clicked', async () => {
      const user = userEvent.setup();
      const mockURLSearchParams = jest.fn().mockImplementation(() => ({
        get: jest.fn((key) => key === 'error' ? 'invalid_token' : null),
      }));
      window.URLSearchParams = mockURLSearchParams;

      render(<EmailVerifiedCard />);

      const createAccountButton = screen.getByRole('button', { name: 'Créer un nouveau compte' });
      await user.click(createAccountButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/sign-up');
    });

    it('should navigate to login when back to login button is clicked', async () => {
      const user = userEvent.setup();
      const mockURLSearchParams = jest.fn().mockImplementation(() => ({
        get: jest.fn((key) => key === 'error' ? 'invalid_token' : null),
      }));
      window.URLSearchParams = mockURLSearchParams;

      render(<EmailVerifiedCard />);

      const backToLoginButton = screen.getByRole('button', { name: 'Retour à la connexion' });
      await user.click(backToLoginButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    it('should have correct button types in error state', () => {
      const mockURLSearchParams = jest.fn().mockImplementation(() => ({
        get: jest.fn((key) => key === 'error' ? 'invalid_token' : null),
      }));
      window.URLSearchParams = mockURLSearchParams;

      render(<EmailVerifiedCard />);

      const createAccountButton = screen.getByRole('button', { name: 'Créer un nouveau compte' });
      const backToLoginButton = screen.getByRole('button', { name: 'Retour à la connexion' });

      expect(createAccountButton).toHaveAttribute('type', 'button');
      expect(backToLoginButton).toHaveAttribute('type', 'button');
    });

    it('should have outline variant for back to login button', () => {
      const mockURLSearchParams = jest.fn().mockImplementation(() => ({
        get: jest.fn((key) => key === 'error' ? 'invalid_token' : null),
      }));
      window.URLSearchParams = mockURLSearchParams;

      render(<EmailVerifiedCard />);

      const backToLoginButton = screen.getByRole('button', { name: 'Retour à la connexion' });
      expect(backToLoginButton.closest('button')).toHaveClass('border-input');
    });
  });

  describe('URL Parameter Parsing', () => {
    it('should not show error state when no error parameter is present', () => {
      const mockURLSearchParams = jest.fn().mockImplementation(() => ({
        get: jest.fn(() => null),
      }));
      window.URLSearchParams = mockURLSearchParams;

      render(<EmailVerifiedCard />);

      expect(screen.getByText('Email vérifié !')).toBeInTheDocument();
      expect(screen.queryByText('Vérification échouée')).not.toBeInTheDocument();
    });

    it('should handle empty error parameter', () => {
      const mockURLSearchParams = jest.fn().mockImplementation(() => ({
        get: jest.fn((key) => key === 'error' ? '' : null),
      }));
      window.URLSearchParams = mockURLSearchParams;

      render(<EmailVerifiedCard />);

      expect(screen.getByText('Email vérifié !')).toBeInTheDocument();
      expect(screen.queryByText('Vérification échouée')).not.toBeInTheDocument();
    });

    it('should handle undefined window object gracefully', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(() => render(<EmailVerifiedCard />)).not.toThrow();

      global.window = originalWindow;
    });

    it('should parse different error types correctly', () => {
      const testCases = [
        {
          error: 'invalid_token',
          expectedMessage: 'Le lien de vérification est invalide ou a expiré. Veuillez vous inscrire à nouveau.'
        },
        {
          error: 'expired',
          expectedMessage: 'Une erreur s\'est produite lors de la vérification. Veuillez réessayer.'
        },
        {
          error: 'malformed',
          expectedMessage: 'Une erreur s\'est produite lors de la vérification. Veuillez réessayer.'
        }
      ];

      testCases.forEach(({ error, expectedMessage }) => {
        const mockURLSearchParams = jest.fn().mockImplementation(() => ({
          get: jest.fn((key) => key === 'error' ? error : null),
        }));
        window.URLSearchParams = mockURLSearchParams;

        const { unmount } = render(<EmailVerifiedCard />);

        expect(screen.getByText(expectedMessage)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible icons', () => {
      render(<EmailVerifiedCard />);

      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toBeInTheDocument();
    });

    it('should support keyboard navigation in success state', async () => {
      const user = userEvent.setup();
      render(<EmailVerifiedCard />);

      await user.tab();
      expect(screen.getByRole('button', { name: 'Continuer vers l\'application' })).toHaveFocus();
    });

    it('should support keyboard navigation in error state', async () => {
      const user = userEvent.setup();
      const mockURLSearchParams = jest.fn().mockImplementation(() => ({
        get: jest.fn((key) => key === 'error' ? 'invalid_token' : null),
      }));
      window.URLSearchParams = mockURLSearchParams;

      render(<EmailVerifiedCard />);

      // Tab to first button
      await user.tab();
      expect(screen.getByRole('button', { name: 'Créer un nouveau compte' })).toHaveFocus();

      // Tab to second button
      await user.tab();
      expect(screen.getByRole('button', { name: 'Retour à la connexion' })).toHaveFocus();
    });

    it('should have proper semantic structure', () => {
      render(<EmailVerifiedCard />);

      // Check for proper heading structure
      const title = screen.getByText('Email vérifié !');
      expect(title.tagName).toBe('H3'); // CardTitle renders as h3

      // Check for proper description
      const description = screen.getByText(/Votre adresse email a été vérifiée/);
      expect(description).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup();
      render(<EmailVerifiedCard />);

      const continueButton = screen.getByRole('button', { name: 'Continuer vers l\'application' });

      // Rapid clicks
      await user.click(continueButton);
      await user.click(continueButton);
      await user.click(continueButton);

      await waitFor(() => {
        expect(continueButton).toBeDisabled();
      });

      // Should only navigate once
      expect(mockRouter.push).toHaveBeenCalledTimes(1);
    });

    it('should handle malformed URL parameters', () => {
      const mockURLSearchParams = jest.fn().mockImplementation(() => {
        throw new Error('Invalid URL');
      });
      window.URLSearchParams = mockURLSearchParams;

      expect(() => render(<EmailVerifiedCard />)).not.toThrow();
    });

    it('should maintain state during multiple re-renders', () => {
      const { rerender } = render(<EmailVerifiedCard />);

      expect(screen.getByText('Email vérifié !')).toBeInTheDocument();

      rerender(<EmailVerifiedCard />);

      expect(screen.getByText('Email vérifié !')).toBeInTheDocument();
    });

    it('should handle router push errors gracefully', async () => {
      const user = userEvent.setup();
      mockRouter.push.mockImplementation(() => {
        throw new Error('Navigation error');
      });

      render(<EmailVerifiedCard />);

      const continueButton = screen.getByRole('button', { name: 'Continuer vers l\'application' });

      // Should not crash on router error
      expect(async () => {
        await user.click(continueButton);
      }).not.toThrow();
    });

    it('should handle null URLSearchParams get result', () => {
      const mockURLSearchParams = jest.fn().mockImplementation(() => ({
        get: jest.fn(() => null),
      }));
      window.URLSearchParams = mockURLSearchParams;

      expect(() => render(<EmailVerifiedCard />)).not.toThrow();
      expect(screen.getByText('Email vérifié !')).toBeInTheDocument();
    });
  });

  describe('Component State Management', () => {
    it('should initialize with correct default state', () => {
      render(<EmailVerifiedCard />);

      const continueButton = screen.getByRole('button', { name: 'Continuer vers l\'application' });
      expect(continueButton).not.toBeDisabled();
      expect(screen.queryByText('Redirection...')).not.toBeInTheDocument();
    });

    it('should update state correctly after button click', async () => {
      const user = userEvent.setup();
      render(<EmailVerifiedCard />);

      const continueButton = screen.getByRole('button', { name: 'Continuer vers l\'application' });

      // Initial state
      expect(continueButton).not.toBeDisabled();
      expect(continueButton).toHaveTextContent('Continuer vers l\'application');

      // After click
      await user.click(continueButton);

      await waitFor(() => {
        expect(continueButton).toBeDisabled();
        expect(continueButton).toHaveTextContent('Redirection...');
      });
    });

    it('should handle component unmounting during redirect', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<EmailVerifiedCard />);

      const continueButton = screen.getByRole('button', { name: 'Continuer vers l\'application' });
      await user.click(continueButton);

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Error State Styling', () => {
    it('should have red styling for error card title', () => {
      const mockURLSearchParams = jest.fn().mockImplementation(() => ({
        get: jest.fn((key) => key === 'error' ? 'invalid_token' : null),
      }));
      window.URLSearchParams = mockURLSearchParams;

      render(<EmailVerifiedCard />);

      const title = screen.getByText('Vérification échouée');
      expect(title).toHaveClass('!text-red-600');
    });

    it('should have primary color for error description', () => {
      const mockURLSearchParams = jest.fn().mockImplementation(() => ({
        get: jest.fn((key) => key === 'error' ? 'invalid_token' : null),
      }));
      window.URLSearchParams = mockURLSearchParams;

      render(<EmailVerifiedCard />);

      const description = screen.getByText(/Le lien de vérification est invalide/);
      expect(description).toHaveClass('!text-[var(--primary)]');
    });
  });

  describe('Success State Styling', () => {
    it('should have primary color for success title', () => {
      render(<EmailVerifiedCard />);

      const title = screen.getByText('Email vérifié !');
      expect(title).toHaveClass('!text-[var(--primary)]');
    });

    it('should have primary color for success description', () => {
      render(<EmailVerifiedCard />);

      const description = screen.getByText(/Votre adresse email a été vérifiée/);
      expect(description).toHaveClass('!text-[var(--primary)]');
    });

    it('should have border styling in success state', () => {
      const { container } = render(<EmailVerifiedCard />);

      const border = container.querySelector('.border-\\[var\\(--primary\\)\\]');
      expect(border).toBeInTheDocument();
    });
  });
});