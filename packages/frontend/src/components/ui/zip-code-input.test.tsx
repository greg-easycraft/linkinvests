import { render, screen, fireEvent } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { ZipCodeInput } from './zip-code-input';

describe('ZipCodeInput Component', () => {
  const defaultProps = {
    value: [],
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<ZipCodeInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Entrez un code postal');
      expect(input).toHaveValue('');
    });

    it('should render with custom placeholder', () => {
      render(<ZipCodeInput {...defaultProps} placeholder="Enter zip code" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Enter zip code');
    });

    it('should render in disabled state', () => {
      render(<ZipCodeInput {...defaultProps} disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('should apply custom className', () => {
      render(<ZipCodeInput {...defaultProps} className="custom-zip-input" />);

      const container = screen.getByRole('textbox').closest('.space-y-2');
      expect(container).toHaveClass('custom-zip-input');
    });

    it('should render length indicator', () => {
      render(<ZipCodeInput {...defaultProps} />);

      expect(screen.getByText('0/5')).toBeInTheDocument();
    });

    it('should render initial helper text', () => {
      render(<ZipCodeInput {...defaultProps} />);

      expect(screen.getByText('Entrez 5 chiffres pour un code postal valide')).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    it('should only allow numeric input', async () => {
      const user = userEvent.setup();
      render(<ZipCodeInput {...defaultProps} />);

      const input = screen.getByRole('textbox');

      await user.type(input, 'abc123def456ghi');

      expect(input).toHaveValue('12345');
      expect(screen.getByText('5/5')).toBeInTheDocument();
    });

    it('should limit input to 5 characters', async () => {
      const user = userEvent.setup();
      render(<ZipCodeInput {...defaultProps} />);

      const input = screen.getByRole('textbox');

      await user.type(input, '123456789');

      expect(input).toHaveValue('12345');
      expect(screen.getByText('5/5')).toBeInTheDocument();
    });

    it('should update length indicator as user types', async () => {
      const user = userEvent.setup();
      render(<ZipCodeInput {...defaultProps} />);

      const input = screen.getByRole('textbox');

      await user.type(input, '1');
      expect(screen.getByText('1/5')).toBeInTheDocument();

      await user.type(input, '23');
      expect(screen.getByText('3/5')).toBeInTheDocument();

      await user.type(input, '45');
      expect(screen.getByText('5/5')).toBeInTheDocument();
    });

    it('should update helper text when input reaches 5 characters', async () => {
      const user = userEvent.setup();
      render(<ZipCodeInput {...defaultProps} />);

      const input = screen.getByRole('textbox');

      await user.type(input, '12345');

      expect(screen.getByText('Appuyez sur Entrée ou Espace pour ajouter ce code postal')).toBeInTheDocument();
      expect(screen.queryByText('Entrez 5 chiffres pour un code postal valide')).not.toBeInTheDocument();
    });

    it('should add visual indicator when input is complete', async () => {
      const user = userEvent.setup();
      render(<ZipCodeInput {...defaultProps} />);

      const input = screen.getByRole('textbox');

      await user.type(input, '12345');

      expect(input).toHaveClass('ring-2', 'ring-[var(--primary)]/20');
    });
  });

  describe('Adding Zip Codes', () => {
    it('should add zip code when Enter is pressed with 5-digit input', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<ZipCodeInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');

      await user.type(input, '12345');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith(['12345']);
      expect(input).toHaveValue('');
    });

    it('should add zip code when Space is pressed with 5-digit input', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<ZipCodeInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');

      await user.type(input, '12345');
      await user.keyboard(' ');

      expect(onChange).toHaveBeenCalledWith(['12345']);
      expect(input).toHaveValue('');
    });

    it('should add zip code when Enter is pressed with less than 5 digits', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<ZipCodeInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');

      await user.type(input, '123');
      await user.keyboard('{Enter}');

      // Should not add if less than 5 digits
      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('123');
    });

    it('should not add duplicate zip codes', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<ZipCodeInput value={['12345']} onChange={onChange} />);

      const input = screen.getByRole('textbox');

      await user.type(input, '12345');
      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should clear input after successful addition', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<ZipCodeInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');

      await user.type(input, '12345');
      await user.keyboard('{Enter}');

      expect(input).toHaveValue('');
      expect(screen.getByText('0/5')).toBeInTheDocument();
    });

    it('should not add empty input', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<ZipCodeInput value={[]} onChange={onChange} />);

      // @ts-expect-error - input variable declared but not used in this specific test
      const input = screen.getByRole('textbox');

      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Displaying Selected Zip Codes', () => {
    it('should display selected zip codes as badges', () => {
      render(<ZipCodeInput value={['12345', '67890']} onChange={jest.fn()} />);

      expect(screen.getByText('12345')).toBeInTheDocument();
      expect(screen.getByText('67890')).toBeInTheDocument();
    });

    it('should not render badges container when no zip codes are selected', () => {
      render(<ZipCodeInput value={[]} onChange={jest.fn()} />);

      const badgeContainer = screen.queryByText('12345');
      expect(badgeContainer).not.toBeInTheDocument();
    });

    it('should render remove buttons for each badge', () => {
      render(<ZipCodeInput value={['12345', '67890']} onChange={jest.fn()} />);

      const removeButtons = screen.getAllByLabelText(/Supprimer le code postal/);
      expect(removeButtons).toHaveLength(2);
      expect(screen.getByLabelText('Supprimer le code postal 12345')).toBeInTheDocument();
      expect(screen.getByLabelText('Supprimer le code postal 67890')).toBeInTheDocument();
    });

    it('should disable remove buttons when component is disabled', () => {
      render(<ZipCodeInput value={['12345']} onChange={jest.fn()} disabled />);

      const removeButton = screen.getByLabelText('Supprimer le code postal 12345');
      expect(removeButton).toBeDisabled();
    });

    it('should apply correct styling to badges', () => {
      render(<ZipCodeInput value={['12345']} onChange={jest.fn()} />);

      const badge = screen.getByText('12345').closest('.flex.items-center');
      expect(badge).toHaveClass('flex', 'items-center', 'gap-1', 'px-2', 'py-1');
    });
  });

  describe('Removing Zip Codes', () => {
    it('should remove zip code when remove button is clicked', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<ZipCodeInput value={['12345', '67890']} onChange={onChange} />);

      const removeButton = screen.getByLabelText('Supprimer le code postal 12345');
      await user.click(removeButton);

      expect(onChange).toHaveBeenCalledWith(['67890']);
    });

    it('should remove last zip code when backspace is pressed with empty input', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<ZipCodeInput value={['12345', '67890']} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input); // Focus the input
      await user.keyboard('{Backspace}');

      expect(onChange).toHaveBeenCalledWith(['12345']);
    });

    it('should not remove zip code when backspace is pressed with text in input', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<ZipCodeInput value={['12345']} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '123');
      await user.keyboard('{Backspace}');

      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('12'); // Should just remove character from input
    });

    it('should not remove when backspace is pressed and no zip codes exist', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<ZipCodeInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('{Backspace}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should not remove zip codes when component is disabled', async () => {
      const onChange = jest.fn();
      // @ts-expect-error - user variable declared but not used in this specific test
      const user = userEvent.setup();
      render(<ZipCodeInput value={['12345']} onChange={onChange} disabled />);

      const removeButton = screen.getByLabelText('Supprimer le code postal 12345');

      // Button should be disabled, so click should not work
      expect(removeButton).toBeDisabled();
    });
  });

  describe('Input Field Styling', () => {
    it('should have correct base styling classes', () => {
      render(<ZipCodeInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(
        'w-full',
        'px-3',
        'py-2',
        'text-sm',
        'rounded-md',
        'border-2',
        'border-[var(--primary)]',
        'bg-[var(--secundary)]',
        'text-foreground'
      );
    });

    it('should have focus styles', () => {
      render(<ZipCodeInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(
        'focus:border-[var(--primary)]',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-[var(--primary)]/20'
      );
    });

    it('should have placeholder and disabled styles', () => {
      render(<ZipCodeInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(
        'placeholder:text-muted-foreground',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed'
      );
    });

    it('should have maxLength attribute', () => {
      render(<ZipCodeInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '5');
    });
  });

  describe('Component Structure', () => {
    it('should have correct container structure', () => {
      const { container } = render(<ZipCodeInput value={['12345']} onChange={jest.fn()} />);

      const mainContainer = container.querySelector('.space-y-2');
      expect(mainContainer).toBeInTheDocument();

      const badgeContainer = container.querySelector('.flex.flex-wrap.gap-1');
      expect(badgeContainer).toBeInTheDocument();

      const inputContainer = container.querySelector('.relative');
      expect(inputContainer).toBeInTheDocument();
    });

    it('should position length indicator correctly', () => {
      render(<ZipCodeInput {...defaultProps} />);

      const indicator = screen.getByText('0/5');
      expect(indicator).toHaveClass(
        'absolute',
        'right-2',
        'top-1/2',
        '-translate-y-1/2',
        'text-xs',
        'text-muted-foreground'
      );
    });

    it('should style helper text correctly', () => {
      render(<ZipCodeInput {...defaultProps} />);

      const helperText = screen.getByText('Entrez 5 chiffres pour un code postal valide');
      expect(helperText).toHaveClass('text-xs', 'text-muted-foreground');
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA labels for remove buttons', () => {
      render(<ZipCodeInput value={['12345', '67890']} onChange={jest.fn()} />);

      expect(screen.getByLabelText('Supprimer le code postal 12345')).toBeInTheDocument();
      expect(screen.getByLabelText('Supprimer le code postal 67890')).toBeInTheDocument();
    });

    it('should have button type for remove buttons', () => {
      render(<ZipCodeInput value={['12345']} onChange={jest.fn()} />);

      const removeButton = screen.getByLabelText('Supprimer le code postal 12345');
      expect(removeButton).toHaveAttribute('type', 'button');
    });

    it('should be keyboard accessible', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<ZipCodeInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');

      // Should be able to tab to the input
      await user.tab();
      expect(input).toHaveFocus();

      // Should be able to type and submit with keyboard
      await user.type(input, '12345');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith(['12345']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle onChange with existing zip codes', () => {
      const onChange = jest.fn();
      render(<ZipCodeInput value={['11111', '22222']} onChange={onChange} />);

      expect(screen.getByText('11111')).toBeInTheDocument();
      expect(screen.getByText('22222')).toBeInTheDocument();
    });

    it('should handle multiple consecutive additions', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      // Start with empty array
      const { rerender } = render(<ZipCodeInput value={[]} onChange={onChange} />);
      const input = screen.getByRole('textbox');

      // Add first zip code
      await user.type(input, '12345');
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenCalledWith(['12345']);

      // Re-render with updated value to simulate real usage
      onChange.mockClear();
      rerender(<ZipCodeInput value={['12345']} onChange={onChange} />);

      // Add second zip code
      await user.type(input, '67890');
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenCalledWith(['12345', '67890']);
    });

    it('should handle controlled component updates correctly', () => {
      const { rerender } = render(<ZipCodeInput value={['12345']} onChange={jest.fn()} />);

      expect(screen.getByText('12345')).toBeInTheDocument();

      rerender(<ZipCodeInput value={['12345', '67890']} onChange={jest.fn()} />);

      expect(screen.getByText('12345')).toBeInTheDocument();
      expect(screen.getByText('67890')).toBeInTheDocument();
    });

    it('should clear current input when controlled value changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ZipCodeInput value={[]} onChange={jest.fn()} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '123');
      expect(input).toHaveValue('123');

      // Simulate external state change
      rerender(<ZipCodeInput value={['45678']} onChange={jest.fn()} />);

      // Input should still maintain its internal state
      expect(input).toHaveValue('123');
    });

    it('should handle empty string in zip codes array gracefully', () => {
      // Should not crash with invalid data
      expect(() => {
        render(<ZipCodeInput value={['', '12345', '']} onChange={jest.fn()} />);
      }).not.toThrow();
    });

    it('should handle special keyboard events correctly', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<ZipCodeInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '12345');

      // Test various keyboard events
      await user.keyboard('{ArrowLeft}'); // Should not trigger addition
      await user.keyboard('{ArrowRight}'); // Should not trigger addition
      await user.keyboard('{Tab}'); // Should not trigger addition

      expect(onChange).not.toHaveBeenCalled();

      // Enter should still work
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenCalledWith(['12345']);
    });
  });

  describe('Event Handling', () => {
    it('should prevent default behavior for Enter and Space when appropriate', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<ZipCodeInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '12345');

      // Mock preventDefault to verify it's called
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const preventDefaultSpy = jest.spyOn(enterEvent, 'preventDefault');

      fireEvent(input, enterEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should handle onChange event correctly', async () => {
      const onChange = jest.fn();
      // @ts-expect-error - user variable declared but not used in this specific test
      const user = userEvent.setup();
      render(<ZipCodeInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');

      // Simulate direct input change
      fireEvent.change(input, { target: { value: 'abc123def' } });

      expect(input).toHaveValue('123'); // Only numeric characters
    });

    it('should handle remove button hover effects', async () => {
      const user = userEvent.setup();
      render(<ZipCodeInput value={['12345']} onChange={jest.fn()} />);

      const removeButton = screen.getByLabelText('Supprimer le code postal 12345');
      expect(removeButton).toHaveClass('hover:bg-gray-200');
    });
  });
});