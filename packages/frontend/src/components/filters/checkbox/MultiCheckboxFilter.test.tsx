import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { MultiCheckboxFilter } from './MultiCheckboxFilter';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', colorClass: 'text-red-500' },
] as const;

describe('MultiCheckboxFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    label: 'Test Checkbox Filter',
    options: mockOptions,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with label', () => {
      render(<MultiCheckboxFilter {...defaultProps} />);

      expect(screen.getByText('Test Checkbox Filter')).toBeInTheDocument();
    });

    it('should render all checkbox options', () => {
      render(<MultiCheckboxFilter {...defaultProps} />);

      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
    });

    it('should render checkboxes with proper type', () => {
      render(<MultiCheckboxFilter {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('type', 'checkbox');
      });
    });

    it('should apply custom color classes to labels', () => {
      render(<MultiCheckboxFilter {...defaultProps} />);

      const option3Label = screen.getByText('Option 3');
      expect(option3Label).toHaveClass('text-red-500');
    });

    it('should generate unique IDs when idPrefix is provided', () => {
      render(<MultiCheckboxFilter {...defaultProps} idPrefix="test-filter" />);

      expect(screen.getByLabelText('Option 1')).toHaveAttribute('id', 'test-filter-option1');
      expect(screen.getByLabelText('Option 2')).toHaveAttribute('id', 'test-filter-option2');
      expect(screen.getByLabelText('Option 3')).toHaveAttribute('id', 'test-filter-option3');
    });

    it('should generate default IDs when idPrefix is not provided', () => {
      render(<MultiCheckboxFilter {...defaultProps} />);

      expect(screen.getByLabelText('Option 1')).toHaveAttribute('id', 'option1');
      expect(screen.getByLabelText('Option 2')).toHaveAttribute('id', 'option2');
      expect(screen.getByLabelText('Option 3')).toHaveAttribute('id', 'option3');
    });
  });

  describe('Value Display', () => {
    it('should display checked checkboxes for selected values', () => {
      const value = ['option1', 'option3'];
      render(<MultiCheckboxFilter {...defaultProps} value={value} />);

      expect(screen.getByLabelText('Option 1')).toBeChecked();
      expect(screen.getByLabelText('Option 2')).not.toBeChecked();
      expect(screen.getByLabelText('Option 3')).toBeChecked();
    });

    it('should handle undefined value', () => {
      render(<MultiCheckboxFilter {...defaultProps} value={undefined} />);

      expect(screen.getByLabelText('Option 1')).not.toBeChecked();
      expect(screen.getByLabelText('Option 2')).not.toBeChecked();
      expect(screen.getByLabelText('Option 3')).not.toBeChecked();
    });

    it('should handle empty array value', () => {
      render(<MultiCheckboxFilter {...defaultProps} value={[]} />);

      expect(screen.getByLabelText('Option 1')).not.toBeChecked();
      expect(screen.getByLabelText('Option 2')).not.toBeChecked();
      expect(screen.getByLabelText('Option 3')).not.toBeChecked();
    });

    it('should handle single selected value', () => {
      const value = ['option2'];
      render(<MultiCheckboxFilter {...defaultProps} value={value} />);

      expect(screen.getByLabelText('Option 1')).not.toBeChecked();
      expect(screen.getByLabelText('Option 2')).toBeChecked();
      expect(screen.getByLabelText('Option 3')).not.toBeChecked();
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when checkbox is checked', async () => {
      const user = userEvent.setup();
      render(<MultiCheckboxFilter {...defaultProps} />);

      const checkbox = screen.getByLabelText('Option 1');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(['option1']);
    });

    it('should add to existing selection when additional checkbox is checked', async () => {
      const user = userEvent.setup();
      const value = ['option1'];
      render(<MultiCheckboxFilter {...defaultProps} value={value} />);

      const checkbox = screen.getByLabelText('Option 2');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option2']);
    });

    it('should remove from selection when checkbox is unchecked', async () => {
      const user = userEvent.setup();
      const value = ['option1', 'option2'];
      render(<MultiCheckboxFilter {...defaultProps} value={value} />);

      const checkbox = screen.getByLabelText('Option 1');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(['option2']);
    });

    it('should call onChange with undefined when last checkbox is unchecked', async () => {
      const user = userEvent.setup();
      const value = ['option1'];
      render(<MultiCheckboxFilter {...defaultProps} value={value} />);

      const checkbox = screen.getByLabelText('Option 1');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });

    it('should handle clicking labels to toggle checkboxes', async () => {
      const user = userEvent.setup();
      render(<MultiCheckboxFilter {...defaultProps} />);

      const label = screen.getByText('Option 1');
      await user.click(label);

      expect(mockOnChange).toHaveBeenCalledWith(['option1']);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation between checkboxes', async () => {
      const user = userEvent.setup();
      render(<MultiCheckboxFilter {...defaultProps} />);

      const checkbox1 = screen.getByLabelText('Option 1');
      const checkbox2 = screen.getByLabelText('Option 2');
      const checkbox3 = screen.getByLabelText('Option 3');

      await user.click(checkbox1);
      expect(checkbox1).toHaveFocus();

      await user.tab();
      expect(checkbox2).toHaveFocus();

      await user.tab();
      expect(checkbox3).toHaveFocus();
    });

    it('should toggle checkbox on Space key press', async () => {
      const user = userEvent.setup();
      render(<MultiCheckboxFilter {...defaultProps} />);

      const checkbox = screen.getByLabelText('Option 1');
      checkbox.focus();
      await user.keyboard(' ');

      expect(mockOnChange).toHaveBeenCalledWith(['option1']);
    });
  });

  describe('Component Structure and Styling', () => {
    it('should have proper label styling', () => {
      render(<MultiCheckboxFilter {...defaultProps} />);

      const label = screen.getByText('Test Checkbox Filter');
      expect(label).toHaveClass(
        'text-sm',
        'font-medium',
        'mb-2',
        'block',
        'font-heading'
      );
    });

    it('should have proper layout for checkbox items', () => {
      render(<MultiCheckboxFilter {...defaultProps} />);

      const container = screen.getByText('Test Checkbox Filter').nextElementSibling;
      expect(container).toHaveClass('space-y-2');
    });

    it('should have proper checkbox styling', () => {
      render(<MultiCheckboxFilter {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveClass('mr-2');
      });
    });

    it('should have proper label element associations', () => {
      render(<MultiCheckboxFilter {...defaultProps} />);

      const checkbox1 = screen.getByLabelText('Option 1');
      const label1 = screen.getByText('Option 1').closest('label');

      expect(label1).toHaveAttribute('for', checkbox1.id);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      render(<MultiCheckboxFilter {...defaultProps} options={[]} />);

      expect(screen.getByText('Test Checkbox Filter')).toBeInTheDocument();
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should handle options with special characters', async () => {
      const user = userEvent.setup();
      const specialOptions = [
        { value: 'special-1', label: 'Option with "quotes"' },
        { value: 'special-2', label: 'Option & ampersand' },
        { value: 'special-3', label: 'Option < > brackets' },
      ];
      render(<MultiCheckboxFilter {...defaultProps} options={specialOptions} />);

      expect(screen.getByLabelText('Option with "quotes"')).toBeInTheDocument();
      expect(screen.getByLabelText('Option & ampersand')).toBeInTheDocument();
      expect(screen.getByLabelText('Option < > brackets')).toBeInTheDocument();

      const checkbox = screen.getByLabelText('Option with "quotes"');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(['special-1']);
    });

    it('should handle numeric option values', async () => {
      const user = userEvent.setup();
      const numericOptions = [
        { value: 1, label: 'Number One' },
        { value: 2, label: 'Number Two' },
      ] as const;
      render(<MultiCheckboxFilter {...defaultProps} options={numericOptions} />);

      const checkbox = screen.getByLabelText('Number One');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith([1]);
    });

    it('should handle invalid value prop', () => {
      expect(() => {
        render(<MultiCheckboxFilter {...defaultProps} value={null as any} />);
      }).not.toThrow();
    });

    it('should handle value with non-existent option values', () => {
      const value = ['option1', 'non-existent', 'option2'];
      render(<MultiCheckboxFilter {...defaultProps} value={value} />);

      expect(screen.getByLabelText('Option 1')).toBeChecked();
      expect(screen.getByLabelText('Option 2')).toBeChecked();
      // Non-existent option should not cause errors
    });

    it('should handle invalid onChange prop', () => {
      expect(() => {
        render(<MultiCheckboxFilter {...defaultProps} onChange={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<MultiCheckboxFilter {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('type', 'checkbox');
      });
    });

    it('should support screen reader navigation', () => {
      render(<MultiCheckboxFilter {...defaultProps} />);

      const checkbox1 = screen.getByLabelText('Option 1');
      const checkbox2 = screen.getByLabelText('Option 2');
      const checkbox3 = screen.getByLabelText('Option 3');

      expect(checkbox1).toBeInTheDocument();
      expect(checkbox2).toBeInTheDocument();
      expect(checkbox3).toBeInTheDocument();
    });

    it('should have proper label associations for accessibility', () => {
      render(<MultiCheckboxFilter {...defaultProps} />);

      const checkbox1 = screen.getByLabelText('Option 1');
      const checkbox2 = screen.getByLabelText('Option 2');
      const checkbox3 = screen.getByLabelText('Option 3');

      expect(checkbox1.id).toBeTruthy();
      expect(checkbox2.id).toBeTruthy();
      expect(checkbox3.id).toBeTruthy();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <MultiCheckboxFilter {...defaultProps} value={['option1']} />
      );

      expect(screen.getByLabelText('Option 1')).toBeChecked();
      expect(screen.getByLabelText('Option 2')).not.toBeChecked();

      rerender(
        <MultiCheckboxFilter {...defaultProps} value={['option2', 'option3']} />
      );

      expect(screen.getByLabelText('Option 1')).not.toBeChecked();
      expect(screen.getByLabelText('Option 2')).toBeChecked();
      expect(screen.getByLabelText('Option 3')).toBeChecked();
    });

    it('should update when options prop changes', () => {
      const newOptions = [
        { value: 'new1', label: 'New Option 1' },
        { value: 'new2', label: 'New Option 2' },
      ];

      const { rerender } = render(<MultiCheckboxFilter {...defaultProps} />);

      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();

      rerender(<MultiCheckboxFilter {...defaultProps} options={newOptions} />);

      expect(screen.queryByLabelText('Option 1')).not.toBeInTheDocument();
      expect(screen.getByLabelText('New Option 1')).toBeInTheDocument();
    });

    it('should clear checkboxes when value is set to undefined', () => {
      const { rerender } = render(
        <MultiCheckboxFilter {...defaultProps} value={['option1', 'option2']} />
      );

      expect(screen.getByLabelText('Option 1')).toBeChecked();
      expect(screen.getByLabelText('Option 2')).toBeChecked();

      rerender(<MultiCheckboxFilter {...defaultProps} value={undefined} />);

      expect(screen.getByLabelText('Option 1')).not.toBeChecked();
      expect(screen.getByLabelText('Option 2')).not.toBeChecked();
    });
  });
});