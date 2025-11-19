import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { MultiInput } from './multi-input';

describe('MultiInput Component', () => {
  const defaultProps = {
    values: [],
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<MultiInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Enter values separated by commas...');
      expect(input).toHaveValue('');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render with custom placeholder', () => {
      render(<MultiInput {...defaultProps} placeholder="Custom placeholder" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Custom placeholder');
    });

    it('should render with number type', () => {
      render(<MultiInput {...defaultProps} type="number" />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should apply custom className', () => {
      const { container } = render(<MultiInput {...defaultProps} className="custom-multi-input" />);

      const wrapper = container.querySelector('.custom-multi-input');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('w-full', 'custom-multi-input');
    });

    it('should render in disabled state', () => {
      render(<MultiInput {...defaultProps} disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should show maxValues counter when provided', () => {
      render(<MultiInput {...defaultProps} maxValues={5} />);

      expect(screen.getByText('0 / 5 items')).toBeInTheDocument();
    });

    it('should update placeholder when values exist', () => {
      render(<MultiInput values={['value1']} onChange={jest.fn()} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Add more...');
    });
  });

  describe('Value Display', () => {
    it('should display existing values as badges', () => {
      render(<MultiInput values={['value1', 'value2']} onChange={jest.fn()} />);

      expect(screen.getByText('value1')).toBeInTheDocument();
      expect(screen.getByText('value2')).toBeInTheDocument();
    });

    it('should show remove buttons for each badge', () => {
      render(<MultiInput values={['value1', 'value2']} onChange={jest.fn()} />);

      const removeButtons = screen.getAllByRole('button');
      expect(removeButtons).toHaveLength(2);
    });

    it('should not render badges when no values', () => {
      render(<MultiInput {...defaultProps} />);

      const badges = screen.queryAllByText(/value/);
      expect(badges).toHaveLength(0);
    });

    it('should disable remove buttons when component is disabled', () => {
      render(<MultiInput values={['value1']} onChange={jest.fn()} disabled />);

      const removeButton = screen.getByRole('button');
      expect(removeButton).toHaveStyle('pointer-events: none');
    });
  });

  describe('Adding Values via Enter/Comma', () => {
    it('should add value when Enter is pressed', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'new value');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith(['new value']);
    });

    it('should add value when comma is entered', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'new value,');

      expect(onChange).toHaveBeenCalledWith(['new value']);
    });

    it('should handle multiple comma-separated values', async () => {
      let currentValues: string[] = [];
      const onChange = jest.fn().mockImplementation((newValues) => {
        currentValues = newValues;
      });
      const user = userEvent.setup();

      const { rerender } = render(<MultiInput values={currentValues} onChange={onChange} />);

      const input = screen.getByRole('textbox');

      // Type first value and comma
      await user.type(input, 'value1,');

      // Rerender with updated values
      rerender(<MultiInput values={currentValues} onChange={onChange} />);

      // Type second value and comma
      await user.type(input, 'value2,');

      // Rerender with updated values
      rerender(<MultiInput values={currentValues} onChange={onChange} />);

      // Type third value and Enter
      await user.type(input, 'value3');
      await user.keyboard('{Enter}');

      // Should have added all three values through separate onChange calls
      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenNthCalledWith(1, ['value1']);
      expect(onChange).toHaveBeenNthCalledWith(2, ['value1', 'value2']);
      expect(onChange).toHaveBeenNthCalledWith(3, ['value1', 'value2', 'value3']);
    });

    it('should trim whitespace from values', async () => {
      let currentValues: string[] = [];
      const onChange = jest.fn().mockImplementation((newValues) => {
        currentValues = newValues;
      });
      const user = userEvent.setup();

      const { rerender } = render(<MultiInput values={currentValues} onChange={onChange} />);

      const input = screen.getByRole('textbox');

      // Type with whitespace and comma
      await user.type(input, '  value1  ,');

      // Rerender with updated values
      rerender(<MultiInput values={currentValues} onChange={onChange} />);

      // Type second value with whitespace and Enter
      await user.type(input, ' value2  ');
      await user.keyboard('{Enter}');

      // Should have trimmed whitespace
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenNthCalledWith(1, ['value1']);
      expect(onChange).toHaveBeenNthCalledWith(2, ['value1', 'value2']);
    });

    it('should not add empty values', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '   ');
      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should not add duplicate values', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={['existing']} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'existing');
      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should clear input after adding values', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test value');
      await user.keyboard('{Enter}');

      expect(input).toHaveValue('');
    });
  });

  describe('Paste Functionality', () => {
    it('should handle paste with comma-separated values', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      // Mock clipboard data
      const clipboardData = 'value1,value2,value3';
      await user.paste(clipboardData);

      expect(onChange).toHaveBeenCalledWith(['value1', 'value2', 'value3']);
    });

    it('should handle paste with different separators', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      // Mock clipboard data with different separators
      const clipboardData = 'value1\nvalue2\rvalue3\tvalue4';
      await user.paste(clipboardData);

      expect(onChange).toHaveBeenCalledWith(['value1', 'value2', 'value3', 'value4']);
    });

    it('should filter duplicates on paste', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={['existing']} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      const clipboardData = 'existing,new1,new2';
      await user.paste(clipboardData);

      expect(onChange).toHaveBeenCalledWith(['existing', 'new1', 'new2']);
    });

    it('should clear input after paste', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'typed');

      const clipboardData = 'pasted1,pasted2';
      await user.paste(clipboardData);

      expect(input).toHaveValue('');
    });
  });

  describe('Removing Values', () => {
    it('should remove value when X button is clicked', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={['value1', 'value2']} onChange={onChange} />);

      const removeButtons = screen.getAllByRole('button');
      // @ts-expect-error - removeButtons[0] could be undefined but we know it exists in test
      await user.click(removeButtons[0]);

      expect(onChange).toHaveBeenCalledWith(['value2']);
    });

    it('should remove last value when backspace is pressed with empty input', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={['value1', 'value2']} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('{Backspace}');

      expect(onChange).toHaveBeenCalledWith(['value1']);
    });

    it('should not remove value when backspace is pressed with text in input', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={['value1']} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'text');
      await user.keyboard('{Backspace}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should handle keyboard navigation for remove buttons', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={['value1']} onChange={onChange} />);

      const removeButton = screen.getByRole('button');
      await user.click(removeButton);
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Max Values Limitation', () => {
    it('should respect maxValues when adding values', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={['val1', 'val2']} onChange={onChange} maxValues={3} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'val3,val4,val5');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith(['val1', 'val2', 'val3']);
    });

    it('should respect maxValues when pasting values', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={['existing']} onChange={onChange} maxValues={2} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      const clipboardData = 'paste1,paste2,paste3';
      await user.paste(clipboardData);

      expect(onChange).toHaveBeenCalledWith(['existing', 'paste1']);
    });

    it('should disable input when maxValues is reached', () => {
      render(<MultiInput values={['val1', 'val2']} onChange={jest.fn()} maxValues={2} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should update counter when maxValues is set', () => {
      render(<MultiInput values={['val1', 'val2']} onChange={jest.fn()} maxValues={5} />);

      expect(screen.getByText('2 / 5 items')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should use validator function when provided', async () => {
      const onChange = jest.fn();
      const validator = jest.fn().mockReturnValue(true);
      const user = userEvent.setup();

      render(
        <MultiInput
          values={[]}
          onChange={onChange}
          validator={validator}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      await user.keyboard('{Enter}');

      expect(validator).toHaveBeenCalledWith('test');
      expect(onChange).toHaveBeenCalledWith(['test']);
    });

    it('should reject invalid values', async () => {
      const onChange = jest.fn();
      const validator = jest.fn().mockReturnValue(false);
      const user = userEvent.setup();

      render(
        <MultiInput
          values={[]}
          onChange={onChange}
          validator={validator}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'invalid');
      await user.keyboard('{Enter}');

      expect(validator).toHaveBeenCalledWith('invalid');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should validate on paste', async () => {
      const onChange = jest.fn();
      const validator = jest.fn()
        .mockReturnValueOnce(true)  // valid1
        .mockReturnValueOnce(false) // invalid
        .mockReturnValueOnce(true); // valid2
      const user = userEvent.setup();

      render(
        <MultiInput
          values={[]}
          onChange={onChange}
          validator={validator}
        />
      );

      const input = screen.getByRole('textbox');
      await user.click(input);

      const clipboardData = 'valid1,invalid,valid2';
      await user.paste(clipboardData);

      expect(onChange).toHaveBeenCalledWith(['valid1', 'valid2']);
    });
  });

  describe('Component Structure and Styling', () => {
    it('should have correct container structure', () => {
      const { container } = render(<MultiInput values={['test']} onChange={jest.fn()} />);

      const mainContainer = container.querySelector('.w-full');
      expect(mainContainer).toBeInTheDocument();

      const innerContainer = container.querySelector('.min-h-\\[2\\.5rem\\]');
      expect(innerContainer).toBeInTheDocument();
    });

    it('should apply focus-within styling', () => {
      const { container } = render(<MultiInput {...defaultProps} />);

      const innerContainer = container.querySelector('.min-h-\\[2\\.5rem\\]');
      expect(innerContainer).toHaveClass(
        'focus-within:ring-2',
        'focus-within:ring-ring',
        'focus-within:ring-offset-2'
      );
    });

    it('should have correct input styling', () => {
      render(<MultiInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(
        'flex-1',
        'border-none',
        'bg-transparent',
        'p-0',
        'shadow-none',
        'focus-visible:ring-0',
        'focus-visible:ring-offset-0',
        'min-w-[120px]'
      );
    });

    it('should style badges correctly', () => {
      render(<MultiInput values={['test']} onChange={jest.fn()} />);

      const badge = screen.getByText('test').closest('.mb-1');
      expect(badge).toHaveClass('mb-1');
    });
  });

  describe('Accessibility', () => {
    it('should have proper role for remove buttons', () => {
      render(<MultiInput values={['test']} onChange={jest.fn()} />);

      const removeButton = screen.getByRole('button');
      expect(removeButton).toHaveAttribute('role', 'button');
      expect(removeButton).toHaveAttribute('tabIndex', '0');
    });

    it('should handle keyboard navigation on remove buttons', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={['test']} onChange={onChange} />);

      const removeButton = screen.getByRole('button');
      removeButton.focus();
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('should disable remove button interactions when disabled', () => {
      render(<MultiInput values={['test']} onChange={jest.fn()} disabled />);

      const removeButton = screen.getByRole('button');
      expect(removeButton).toHaveAttribute('tabIndex', '-1');
      expect(removeButton).toHaveStyle('pointer-events: none');
    });

    it('should be keyboard accessible', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');

      await user.tab();
      expect(input).toHaveFocus();

      await user.type(input, 'value1');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith(['value1']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle controlled component updates', () => {
      const { rerender } = render(<MultiInput values={['initial']} onChange={jest.fn()} />);

      expect(screen.getByText('initial')).toBeInTheDocument();

      rerender(<MultiInput values={['initial', 'updated']} onChange={jest.fn()} />);

      expect(screen.getByText('initial')).toBeInTheDocument();
      expect(screen.getByText('updated')).toBeInTheDocument();
    });

    it('should handle empty string in values array', () => {
      expect(() => {
        render(<MultiInput values={['', 'valid', '']} onChange={jest.fn()} />);
      }).not.toThrow();

      expect(screen.getByText('valid')).toBeInTheDocument();
    });

    it('should handle very long values gracefully', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      const longValue = 'a'.repeat(1000);

      render(<MultiInput values={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, longValue);
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith([longValue]);
    });

    it('should handle special characters in values', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      const specialValue = 'test@domain.com#123!$%';

      render(<MultiInput values={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, specialValue);
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith([specialValue]);
    });

    it('should handle rapid key presses', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      await user.keyboard('{Enter}{Enter}{Enter}');

      // Should only be called once
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(['test']);
    });

    it('should handle mixed separators in single paste', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      const mixedData = 'val1,val2\nval3\tval4\rval5';
      await user.paste(mixedData);

      expect(onChange).toHaveBeenCalledWith(['val1', 'val2', 'val3', 'val4', 'val5']);
    });

    it('should maintain input focus after adding values', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      await user.keyboard('{Enter}');

      expect(input).toHaveFocus();
    });
  });

  describe('Event Handling', () => {
    it('should prevent default on Enter and comma keys', async () => {
      const user = userEvent.setup();
      render(<MultiInput values={[]} onChange={jest.fn()} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      // Can't directly test preventDefault, but ensure the value is added
      await user.keyboard('{Enter}');

      // If preventDefault worked, the form won't submit and our onChange will be called
      expect(input).toHaveValue('');
    });

    it('should handle mouseDown events on remove buttons', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiInput values={['test']} onChange={onChange} />);

      const removeButton = screen.getByRole('button');

      // Test mouseDown, then click
      await user.pointer({ target: removeButton, keys: '[MouseLeft>]' });
      await user.pointer({ target: removeButton, keys: '[/MouseLeft]' });

      expect(onChange).toHaveBeenCalledWith([]);
    });
  });
});