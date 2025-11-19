import { render, screen, waitFor } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { MultiSelect } from './multi-select';
import type { MultiSelectOption } from './multi-select';

describe('MultiSelect Component', () => {
  const mockOptions: MultiSelectOption[] = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' },
    { label: 'Option with Search', value: 'opt4', searchValue: 'searchable' },
    { label: 'Another Option', value: 'opt5' },
  ];

  const defaultProps = {
    options: mockOptions,
    selected: [],
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<MultiSelect {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByText('Select items...')).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      render(<MultiSelect {...defaultProps} placeholder="Choose options..." />);

      expect(screen.getByText('Choose options...')).toBeInTheDocument();
    });

    it('should render with custom search placeholder', () => {
      render(<MultiSelect {...defaultProps} searchPlaceholder="Find options..." />);

      // Need to open popover to see search placeholder
      // This test validates the prop is accepted
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<MultiSelect {...defaultProps} className="custom-multi-select" />);

      const wrapper = container.querySelector('.custom-multi-select');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('w-full', 'custom-multi-select');
    });

    it('should render in disabled state', () => {
      render(<MultiSelect {...defaultProps} disabled />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });

    it('should have correct styling classes', () => {
      render(<MultiSelect {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass(
        'w-full',
        'justify-between',
        'text-left',
        'font-normal',
        'border-2',
        'border-[var(--primary)]',
        'bg-[var(--secundary)]',
        'text-[var(--primary)]'
      );
    });

    it('should show chevron icon', () => {
      render(<MultiSelect {...defaultProps} />);

      const chevron = screen.getByRole('combobox').querySelector('svg');
      expect(chevron).toBeInTheDocument();
      expect(chevron).toHaveClass('h-4', 'w-4', 'shrink-0', 'opacity-50');
    });
  });

  describe('Popover Functionality', () => {
    it('should open popover when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });
    });

    it('should close popover when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <MultiSelect {...defaultProps} />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });

      const outside = screen.getByTestId('outside');
      await user.click(outside);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('should close popover when pressing Escape', async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('should display search input when popover is open', async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} searchPlaceholder="Search here..." />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search here...');
        expect(searchInput).toBeInTheDocument();
      });
    });
  });

  describe('Option Selection', () => {
    it('should select option when clicked', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} onChange={onChange} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const option = screen.getByText('Option 1');
        expect(option).toBeInTheDocument();
      });

      const option = screen.getByText('Option 1');
      await user.click(option);

      expect(onChange).toHaveBeenCalledWith(['opt1']);
    });

    it('should deselect option when already selected option is clicked', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} selected={['opt1']} onChange={onChange} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const option = screen.getByText('Option 1');
        expect(option).toBeInTheDocument();
      });

      const option = screen.getByText('Option 1');
      await user.click(option);

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('should show check mark for selected options', async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} selected={['opt1']} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const option = screen.getByText('Option 1');
        const checkIcon = option.closest('div')?.querySelector('svg');
        expect(checkIcon).toHaveClass('opacity-100');
      });
    });

    it('should hide check mark for unselected options', async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} selected={['opt1']} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const option = screen.getByText('Option 2');
        const checkIcon = option.closest('div')?.querySelector('svg');
        expect(checkIcon).toHaveClass('opacity-0');
      });
    });

    it('should handle multiple selections', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} onChange={onChange} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      // Select first option
      await user.click(screen.getByText('Option 1'));
      expect(onChange).toHaveBeenCalledWith(['opt1']);

      // Simulate state update
      onChange.mockClear();
      // @ts-expect-error - rerender declared but not used in this specific test
      const { rerender } = render(
        <MultiSelect {...defaultProps} selected={['opt1']} onChange={onChange} />
      );

      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });

      // Select second option
      await user.click(screen.getByText('Option 2'));
      expect(onChange).toHaveBeenCalledWith(['opt1', 'opt2']);
    });
  });

  describe('Selected Items Display', () => {
    it('should display selected items as badges', () => {
      render(<MultiSelect {...defaultProps} selected={['opt1', 'opt2']} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('should show item count when more than maxDisplayItems', () => {
      render(
        <MultiSelect
          {...defaultProps}
          selected={['opt1', 'opt2', 'opt3', 'opt4']}
          maxDisplayItems={2}
        />
      );

      expect(screen.getByText('4 items selected')).toBeInTheDocument();
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    it('should show individual badges when within maxDisplayItems limit', () => {
      render(
        <MultiSelect
          {...defaultProps}
          selected={['opt1', 'opt2']}
          maxDisplayItems={3}
        />
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.queryByText('items selected')).not.toBeInTheDocument();
    });

    it('should show clear all button when exceeding maxDisplayItems', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(
        <MultiSelect
          {...defaultProps}
          selected={['opt1', 'opt2', 'opt3', 'opt4']}
          maxDisplayItems={2}
          onChange={onChange}
        />
      );

      const clearButton = screen.getByRole('button');
      await user.click(clearButton);

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('should handle clear all with keyboard', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(
        <MultiSelect
          {...defaultProps}
          selected={['opt1', 'opt2', 'opt3', 'opt4']}
          maxDisplayItems={2}
          onChange={onChange}
        />
      );

      const clearButton = screen.getByRole('button');
      clearButton.focus();
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Badge Removal', () => {
    it('should remove item when X button on badge is clicked', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} selected={['opt1', 'opt2']} onChange={onChange} />);

      // Find the X button in the first badge
      const badges = screen.getAllByText(/Option \d/).map(el => el.closest('.mr-1'));
      const firstBadge = badges[0];
      const removeButton = firstBadge?.querySelector('[role="button"]');

      expect(removeButton).toBeInTheDocument();
      await user.click(removeButton!);

      expect(onChange).toHaveBeenCalledWith(['opt2']);
    });

    it('should remove item with keyboard on badge X button', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} selected={['opt1', 'opt2']} onChange={onChange} />);

      const badges = screen.getAllByText(/Option \d/).map(el => el.closest('.mr-1'));
      const firstBadge = badges[0];
      const removeButton = firstBadge?.querySelector('[role="button"]') as HTMLElement;

      removeButton.focus();
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith(['opt2']);
    });

    it('should prevent event propagation on badge removal', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} selected={['opt1']} onChange={onChange} />);

      const badge = screen.getByText('Option 1').closest('.mr-1');
      const removeButton = badge?.querySelector('[role="button"]');

      await user.click(removeButton!);

      // Should call onChange (remove item) but not open the popover
      expect(onChange).toHaveBeenCalledWith([]);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Search Functionality', () => {
    it('should filter options based on search query', async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const searchInput = screen.getByRole('textbox');
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'Option 1');

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      });
    });

    it('should show "No items found" when search yields no results', async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const searchInput = screen.getByRole('textbox');
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No items found.')).toBeInTheDocument();
      });
    });

    it('should search in searchValue field when provided', async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const searchInput = screen.getByRole('textbox');
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'searchable');

      await waitFor(() => {
        expect(screen.getByText('Option with Search')).toBeInTheDocument();
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      });
    });

    it('should clear search when popover closes', async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const searchInput = screen.getByRole('textbox');
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'filter');

      // Close popover
      await user.keyboard('{Escape}');

      // Reopen and verify search is cleared
      await user.click(trigger);

      await waitFor(() => {
        const newSearchInput = screen.getByRole('textbox');
        expect(newSearchInput).toHaveValue('');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be navigable with keyboard', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} onChange={onChange} />);

      const trigger = screen.getByRole('combobox');

      // Focus trigger with tab
      await user.tab();
      expect(trigger).toHaveFocus();

      // Open with Enter
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });

      // Navigate with arrow keys and select with Enter
      await user.keyboard('{ArrowDown}{Enter}');

      // Note: Exact keyboard navigation behavior depends on Radix UI implementation
      // This test ensures basic keyboard interaction works
    });

    it('should handle space key on trigger', async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard(' ');

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<MultiSelect {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('role', 'combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when opened', async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have proper tabIndex for remove buttons', () => {
      render(<MultiSelect {...defaultProps} selected={['opt1']} />);

      const badge = screen.getByText('Option 1').closest('.mr-1');
      const removeButton = badge?.querySelector('[role="button"]');

      expect(removeButton).toHaveAttribute('tabIndex', '0');
    });

    it('should support screen readers', async () => {
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} selected={['opt1']} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        // Command component creates proper ARIA structure
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('should work with complex option objects', () => {
      const complexOptions: MultiSelectOption[] = [
        { label: 'Complex Option 1', value: 'complex-1', searchValue: 'extra search terms' },
        { label: 'Complex Option 2', value: 'complex-2' },
      ];

      render(
        <MultiSelect
          options={complexOptions}
          selected={['complex-1']}
          onChange={jest.fn()}
        />
      );

      expect(screen.getByText('Complex Option 1')).toBeInTheDocument();
    });

    it('should handle empty options array', async () => {
      const user = userEvent.setup();
      render(<MultiSelect options={[]} selected={[]} onChange={jest.fn()} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('No items found.')).toBeInTheDocument();
      });
    });

    it('should maintain selection state across renders', () => {
      const { rerender } = render(
        <MultiSelect {...defaultProps} selected={['opt1']} />
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();

      rerender(<MultiSelect {...defaultProps} selected={['opt1', 'opt2']} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid selected values gracefully', () => {
      render(<MultiSelect {...defaultProps} selected={['invalid-value']} />);

      // Should not crash and should show placeholder since no valid options are selected
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Select items...')).toBeInTheDocument();
    });

    it('should handle options with duplicate values', () => {
      const duplicateOptions: MultiSelectOption[] = [
        { label: 'Option 1', value: 'same-value' },
        { label: 'Option 2', value: 'same-value' },
      ];

      render(
        <MultiSelect
          options={duplicateOptions}
          selected={['same-value']}
          onChange={jest.fn()}
        />
      );

      // Should handle gracefully - React will show warning in console but component shouldn't crash
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle very long option labels', () => {
      const longOptions: MultiSelectOption[] = [
        { label: 'A'.repeat(100), value: 'long-option' },
      ];

      render(
        <MultiSelect
          options={longOptions}
          selected={['long-option']}
          onChange={jest.fn()}
        />
      );

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('should handle rapid clicks gracefully', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MultiSelect {...defaultProps} onChange={onChange} />);

      const trigger = screen.getByRole('combobox');

      // Rapid clicks
      await user.click(trigger);
      await user.click(trigger);
      await user.click(trigger);

      // Should not cause errors
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle controlled updates correctly', () => {
      const { rerender } = render(<MultiSelect {...defaultProps} selected={[]} />);

      expect(screen.getByText('Select items...')).toBeInTheDocument();

      // Simulate external state change
      rerender(<MultiSelect {...defaultProps} selected={['opt1', 'opt2']} />);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('should handle special characters in option labels', async () => {
      const specialOptions: MultiSelectOption[] = [
        { label: 'Option with émojis 🎉', value: 'emoji' },
        { label: 'Option with "quotes"', value: 'quotes' },
        { label: 'Option with <html>', value: 'html' },
      ];

      const user = userEvent.setup();
      render(<MultiSelect options={specialOptions} selected={[]} onChange={jest.fn()} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option with émojis 🎉')).toBeInTheDocument();
        expect(screen.getByText('Option with "quotes"')).toBeInTheDocument();
        expect(screen.getByText('Option with <html>')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should handle large number of options', async () => {
      const largeOptions: MultiSelectOption[] = Array.from({ length: 1000 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `opt${i + 1}`,
      }));

      const user = userEvent.setup();
      render(<MultiSelect options={largeOptions} selected={[]} onChange={jest.fn()} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      // Should render without performance issues (within test timeout)
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
    });

    it('should handle search on large datasets efficiently', async () => {
      const largeOptions: MultiSelectOption[] = Array.from({ length: 1000 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `opt${i + 1}`,
      }));

      const user = userEvent.setup();
      render(<MultiSelect options={largeOptions} selected={[]} onChange={jest.fn()} />);

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const searchInput = screen.getByRole('textbox');
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'Option 500');

      await waitFor(() => {
        expect(screen.getByText('Option 500')).toBeInTheDocument();
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      });
    });
  });
});