// describe, it, expect are Jest globals
import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text" />);

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should handle text input', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');

    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('Hello');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should render with different types', () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    // Password inputs don't have textbox role
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it('should accept custom className', () => {
    render(<Input className="custom-input" />);

    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });

  it('should forward ref correctly', () => {
    const ref = jest.fn();
    render(<Input ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it('should handle value prop', () => {
    render(<Input value="Controlled value" readOnly />);

    expect(screen.getByRole('textbox')).toHaveValue('Controlled value');
  });
});
