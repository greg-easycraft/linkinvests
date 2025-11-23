import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { MultiSelectFilter } from './MultiSelectFilter';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
] as const;

describe('MultiSelectFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    label: 'Test Filter',
    options: mockOptions,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with label', () => {
      render(<MultiSelectFilter {...defaultProps} />);

      expect(screen.getByText('Test Filter')).toBeInTheDocument();
    });

    it('should render select trigger with placeholder', () => {
      render(<MultiSelectFilter {...defaultProps} placeholder="Select options..." />);

      expect(screen.getByText('Select options...')).toBeInTheDocument();
    });

    it('should render default placeholder when none provided', () => {
      render(<MultiSelectFilter {...defaultProps} />);

      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });

    it('should have select role', () => {
      render(<MultiSelectFilter {...defaultProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Options Display', () => {
    it('should show all options when select is opened', async () => {
      const user = userEvent.setup();
      render(<MultiSelectFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should handle empty options array', () => {
      render(<MultiSelectFilter {...defaultProps} options={[]} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle single option', async () => {
      const user = userEvent.setup();
      const singleOption = [{ value: 'single', label: 'Single Option' }];
      render(<MultiSelectFilter {...defaultProps} options={singleOption} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.getByText('Single Option')).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('should display selected values as badges', () => {
      const value = ['option1', 'option2'];
      render(<MultiSelectFilter {...defaultProps} value={value} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('should handle undefined value', () => {
      render(<MultiSelectFilter {...defaultProps} value={undefined} />);

      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });

    it('should handle empty array value', () => {
      render(<MultiSelectFilter {...defaultProps} value={[]} />);

      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });

    it('should display single selected value', () => {
      const value = ['option1'];
      render(<MultiSelectFilter {...defaultProps} value={value} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('should display multiple selected values', () => {
      const value = ['option1', 'option2', 'option3'];
      render(<MultiSelectFilter {...defaultProps} value={value} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });
  });

  describe('Badge Colors', () => {
    it('should apply default badge color when none specified', () => {
      const value = ['option1'];
      render(<MultiSelectFilter {...defaultProps} value={value} />);

      const badge = screen.getByText('Option 1');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should apply custom badge color when specified', () => {
      const value = ['option1'];
      render(<MultiSelectFilter {...defaultProps} value={value} badgeColor="bg-red-100 text-red-800" />);

      const badge = screen.getByText('Option 1');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('should apply custom badge color to all selected options', () => {
      const value = ['option1', 'option2'];
      render(<MultiSelectFilter {...defaultProps} value={value} badgeColor="bg-green-100 text-green-800" />);

      const badge1 = screen.getByText('Option 1');
      const badge2 = screen.getByText('Option 2');

      expect(badge1).toHaveClass('bg-green-100', 'text-green-800');
      expect(badge2).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when option is selected', async () => {
      const user = userEvent.setup();
      render(<MultiSelectFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Option 1');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(['option1']);
    });

    it('should add to existing selection when multiple options are selected', async () => {
      const user = userEvent.setup();
      const value = ['option1'];
      render(<MultiSelectFilter {...defaultProps} value={value} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Option 2');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option2']);
    });

    it('should toggle selection when already selected option is clicked', async () => {
      const user = userEvent.setup();
      const value = ['option1', 'option2'];
      render(<MultiSelectFilter {...defaultProps} value={value} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Option 1');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(['option2']);
    });

    it('should call onChange with undefined when last item is deselected', async () => {
      const user = userEvent.setup();
      const value = ['option1'];
      render(<MultiSelectFilter {...defaultProps} value={value} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Option 1');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });

    it('should remove badge when X button is clicked', async () => {
      const user = userEvent.setup();
      const value = ['option1', 'option2'];
      render(<MultiSelectFilter {...defaultProps} value={value} />);

      const badge = screen.getByText('Option 1');
      const removeButton = badge.querySelector('svg');

      if (removeButton) {
        await user.click(removeButton);
        expect(mockOnChange).toHaveBeenCalledWith(['option2']);
      }
    });

    it('should call onChange with undefined when removing the only remaining badge', async () => {
      const user = userEvent.setup();
      const value = ['option1'];
      render(<MultiSelectFilter {...defaultProps} value={value} />);

      const badge = screen.getByText('Option 1');
      const removeButton = badge.querySelector('svg');

      if (removeButton) {
        await user.click(removeButton);
        expect(mockOnChange).toHaveBeenCalledWith(undefined);
      }
    });
  });

  describe('Keyboard Navigation', () => {
    it('should open dropdown on Enter key', async () => {
      const user = userEvent.setup();
      render(<MultiSelectFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);
      await user.keyboard('{Enter}');

      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('should close dropdown on Escape key', async () => {
      const user = userEvent.setup();
      render(<MultiSelectFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.getByText('Option 1')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      // Options should no longer be visible
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    it('should support tab navigation', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <MultiSelectFilter {...defaultProps} />
          <button>Next Element</button>
        </div>
      );

      await user.tab();
      expect(screen.getByRole('combobox')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Next Element')).toHaveFocus();
    });
  });

  describe('Badge Behavior', () => {
    it('should display badges for all selected values', () => {
      const value = ['option1', 'option2', 'option3'];
      render(<MultiSelectFilter {...defaultProps} value={value} />);

      const badges = screen.getAllByText(/Option [123]/);
      expect(badges).toHaveLength(3);
    });

    it('should handle removing badges in any order', async () => {
      const user = userEvent.setup();
      const value = ['option1', 'option2', 'option3'];
      render(<MultiSelectFilter {...defaultProps} value={value} />);

      // Remove middle badge
      const badge2 = screen.getByText('Option 2');
      const removeButton = badge2.querySelector('svg');

      if (removeButton) {
        await user.click(removeButton);
        expect(mockOnChange).toHaveBeenCalledWith(['option1', 'option3']);
      }
    });

    it('should maintain badge order based on selection order', () => {
      const value = ['option3', 'option1', 'option2'];
      render(<MultiSelectFilter {...defaultProps} value={value} />);

      const badges = screen.getAllByText(/Option [123]/);
      expect(badges[0]).toHaveTextContent('Option 3');
      expect(badges[1]).toHaveTextContent('Option 1');
      expect(badges[2]).toHaveTextContent('Option 2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle options with special characters', async () => {
      const user = userEvent.setup();
      const specialOptions = [
        { value: 'special-1', label: 'Option with "quotes"' },
        { value: 'special-2', label: 'Option & ampersand' },
        { value: 'special-3', label: 'Option < > brackets' },
      ];
      render(<MultiSelectFilter {...defaultProps} options={specialOptions} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.getByText('Option with "quotes"')).toBeInTheDocument();
      expect(screen.getByText('Option & ampersand')).toBeInTheDocument();
      expect(screen.getByText('Option < > brackets')).toBeInTheDocument();
    });

    it('should handle very long option labels', async () => {
      const user = userEvent.setup();
      const longOptions = [
        { value: 'long', label: 'This is a very long option label that might wrap or be truncated depending on the design' },
      ];
      render(<MultiSelectFilter {...defaultProps} options={longOptions} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.getByText(/This is a very long option label/)).toBeInTheDocument();
    });

    it('should handle options with numeric values', async () => {
      const user = userEvent.setup();
      const numericOptions = [
        { value: 1, label: 'Number One' },
        { value: 2, label: 'Number Two' },
      ] as const;
      render(<MultiSelectFilter {...defaultProps} options={numericOptions} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Number One');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith([1]);
    });

    it('should handle invalid value prop gracefully', () => {
      expect(() => {
        render(<MultiSelectFilter {...defaultProps} value={null as any} />);
      }).not.toThrow();
    });

    it('should handle value with non-existent option values', () => {
      const value = ['option1', 'non-existent', 'option2'];
      render(<MultiSelectFilter {...defaultProps} value={value} />);

      // Should only display badges for existing options
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.queryByText('non-existent')).not.toBeInTheDocument();
    });

    it('should handle invalid onChange prop', () => {
      expect(() => {
        render(<MultiSelectFilter {...defaultProps} onChange={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('Component Structure and Styling', () => {
    it('should have proper label styling', () => {
      render(<MultiSelectFilter {...defaultProps} />);

      const label = screen.getByText('Test Filter');
      expect(label).toHaveClass(
        'text-sm',
        'font-medium',
        'mb-2',
        'block',
        'font-heading'
      );
    });

    it('should apply flex layout for badges', () => {
      const value = ['option1', 'option2'];
      render(<MultiSelectFilter {...defaultProps} value={value} />);

      const badgesContainer = screen.getByText('Option 1').parentElement;
      expect(badgesContainer).toHaveClass('flex', 'flex-wrap', 'gap-1', 'mb-1');
    });

    it('should have proper select trigger styling', () => {
      render(<MultiSelectFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toHaveClass('w-full');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<MultiSelectFilter {...defaultProps} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should support screen reader navigation', () => {
      const value = ['option1'];
      render(<MultiSelectFilter {...defaultProps} value={value} />);

      const badge = screen.getByText('Option 1');
      expect(badge).toBeInTheDocument();
    });

    it('should have focusable trigger', async () => {
      const user = userEvent.setup();
      render(<MultiSelectFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(selectTrigger).toHaveFocus();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(<MultiSelectFilter {...defaultProps} value={['option1']} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();

      rerender(<MultiSelectFilter {...defaultProps} value={['option2', 'option3']} />);

      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should update when options prop changes', async () => {
      const user = userEvent.setup();
      const newOptions = [
        { value: 'new1', label: 'New Option 1' },
        { value: 'new2', label: 'New Option 2' },
      ];

      const { rerender } = render(<MultiSelectFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.getByText('Option 1')).toBeInTheDocument();

      rerender(<MultiSelectFilter {...defaultProps} options={newOptions} />);

      await user.click(selectTrigger);

      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      expect(screen.getByText('New Option 1')).toBeInTheDocument();
    });

    it('should clear badges when value is set to undefined', () => {
      const { rerender } = render(<MultiSelectFilter {...defaultProps} value={['option1', 'option2']} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();

      rerender(<MultiSelectFilter {...defaultProps} value={undefined} />);

      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });
  });
});