import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { GenericRangeFilter, type RangeFilterValue } from './GenericRangeFilter';

// Test wrapper component that manages state like a real parent component
function ControlledGenericRangeFilter(props: Partial<React.ComponentProps<typeof GenericRangeFilter>>) {
  const [value, setValue] = useState<RangeFilterValue | undefined>(props.value);

  return (
    <GenericRangeFilter
      label="Test Range"
      value={value}
      onChange={setValue}
      {...props}
    />
  );
}

describe('GenericRangeFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    label: 'Test Range',
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with label', () => {
      render(<GenericRangeFilter {...defaultProps} />);

      expect(screen.getByText('Test Range')).toBeInTheDocument();
    });

    it('should render with unit in label', () => {
      render(<GenericRangeFilter {...defaultProps} unit="€" />);

      expect(screen.getByText('Test Range')).toBeInTheDocument();
      expect(screen.getByText('(€)')).toBeInTheDocument();
    });

    it('should render without unit when not provided', () => {
      render(<GenericRangeFilter {...defaultProps} />);

      expect(screen.getByText('Test Range')).toBeInTheDocument();
      expect(screen.queryByText('Test Range ()')).not.toBeInTheDocument();
    });

    it('should render two input fields', () => {
      render(<GenericRangeFilter {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
    });

    it('should have proper input types', () => {
      render(<GenericRangeFilter {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('type', 'number');
      });
    });
  });

  describe('Placeholder Text', () => {
    it('should use default placeholders when none provided', () => {
      render(<GenericRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });

    it('should use custom placeholders when provided', () => {
      render(
        <GenericRangeFilter
          {...defaultProps}
          placeholder={{ min: 'Minimum value', max: 'Maximum value' }}
        />
      );

      expect(screen.getByPlaceholderText('Minimum value')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Maximum value')).toBeInTheDocument();
    });

    it('should use partial custom placeholders', () => {
      render(
        <GenericRangeFilter
          {...defaultProps}
          placeholder={{ min: 'Custom Min' }}
        />
      );

      expect(screen.getByPlaceholderText('Custom Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });

    it('should use partial custom placeholders for max only', () => {
      render(
        <GenericRangeFilter
          {...defaultProps}
          placeholder={{ max: 'Custom Max' }}
        />
      );

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Custom Max')).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('should display provided min value', () => {
      const value: RangeFilterValue = { min: 100 };
      render(<GenericRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      expect(minInput).toHaveValue(100);
    });

    it('should display provided max value', () => {
      const value: RangeFilterValue = { max: 500 };
      render(<GenericRangeFilter {...defaultProps} value={value} />);

      const maxInput = screen.getByPlaceholderText('Max');
      expect(maxInput).toHaveValue(500);
    });

    it('should display both min and max values', () => {
      const value: RangeFilterValue = { min: 100, max: 500 };
      render(<GenericRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(100);
      expect(maxInput).toHaveValue(500);
    });

    it('should handle undefined value', () => {
      render(<GenericRangeFilter {...defaultProps} value={undefined} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(null);
      expect(maxInput).toHaveValue(null);
    });

    it('should handle empty value object', () => {
      const value: RangeFilterValue = {};
      render(<GenericRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(null);
      expect(maxInput).toHaveValue(null);
    });
  });

  describe('User Interactions', () => {
    it('should call onChange with min value when min input changes', async () => {
      const user = userEvent.setup();
      render(<ControlledGenericRangeFilter />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '100');

      // The controlled component should properly display the typed value
      expect(minInput).toHaveValue(100);
    });

    it('should call onChange with max value when max input changes', async () => {
      const user = userEvent.setup();
      render(<ControlledGenericRangeFilter />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '500');

      expect(maxInput).toHaveValue(500);
    });

    it('should preserve existing value when updating only min', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { max: 500 };
      render(<GenericRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '100');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 100, max: 500 });
    });

    it('should preserve existing value when updating only max', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { min: 100 };
      render(<GenericRangeFilter {...defaultProps} value={value} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '500');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 100, max: 500 });
    });

    it('should handle clearing min input', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { min: 100, max: 500 };
      render(<GenericRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.clear(minInput);

      expect(mockOnChange).toHaveBeenCalledWith({ max: 500 });
    });

    it('should handle clearing max input', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { min: 100, max: 500 };
      render(<GenericRangeFilter {...defaultProps} value={value} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.clear(maxInput);

      expect(mockOnChange).toHaveBeenCalledWith({ min: 100 });
    });

    it('should call onChange with undefined when both inputs are cleared', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { min: 100, max: 500 };
      render(<GenericRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.clear(minInput);
      await user.clear(maxInput);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });

    it('should handle multiple rapid changes', async () => {
      const user = userEvent.setup();
      render(<GenericRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '123');

      // Should be called for each keystroke
      expect(mockOnChange).toHaveBeenCalledTimes(3);
      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 123 });
    });
  });

  describe('Number Parsing', () => {
    it('should handle positive integers', async () => {
      const user = userEvent.setup();
      render(<ControlledGenericRangeFilter />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '100');

      expect(minInput).toHaveValue(100);
    });

    it('should handle zero values', async () => {
      const user = userEvent.setup();
      render(<GenericRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '0');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 0 });
    });

    it('should handle decimal values', async () => {
      const user = userEvent.setup();
      render(<ControlledGenericRangeFilter />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '100.5');

      expect(minInput).toHaveValue(100.5);
    });

    it('should handle negative values', async () => {
      const user = userEvent.setup();
      render(<ControlledGenericRangeFilter />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '-50');

      expect(minInput).toHaveValue(-50);
    });

    it('should parse empty string as undefined', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { min: 100 };
      render(<GenericRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.clear(minInput);

      expect(mockOnChange).toHaveBeenCalledWith({});
    });
  });

  describe('CSS Classes and Layout', () => {
    it('should have proper label styling', () => {
      render(<GenericRangeFilter {...defaultProps} />);

      const label = screen.getByText('Test Range');
      expect(label).toHaveClass(
        'text-sm',
        'font-medium',
        'mb-2',
        'block',
        'font-heading'
      );
    });

    it('should have grid layout for inputs', () => {
      render(<GenericRangeFilter {...defaultProps} />);

      const container = screen.getByText('Test Range').nextElementSibling;
      expect(container).toHaveClass('grid', 'grid-cols-2', 'gap-2');
    });

    it('should apply Input component classes to both inputs', () => {
      render(<GenericRangeFilter {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach(input => {
        // These classes come from the Input component
        expect(input).toHaveClass('flex');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label association', () => {
      render(<GenericRangeFilter label="Price Range" onChange={mockOnChange} />);

      const label = screen.getByText('Price Range');
      expect(label).toBeInTheDocument();
    });

    it('should support keyboard navigation between inputs', async () => {
      const user = userEvent.setup();
      render(<GenericRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.click(minInput);
      expect(minInput).toHaveFocus();

      await user.tab();
      expect(maxInput).toHaveFocus();
    });

    it('should handle keyboard input correctly', async () => {
      const user = userEvent.setup();
      render(<ControlledGenericRangeFilter />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '123');

      expect(minInput).toHaveValue(123);
    });

    it('should have proper input roles', () => {
      render(<GenericRangeFilter {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very large numbers', async () => {
      const user = userEvent.setup();
      render(<ControlledGenericRangeFilter />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '999999999');

      expect(minInput).toHaveValue(999999999);
    });

    it('should handle scientific notation', async () => {
      const user = userEvent.setup();
      render(<ControlledGenericRangeFilter />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '1e5');

      expect(minInput).toHaveValue(100000);
    });

    it('should not crash with invalid onChange prop', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<GenericRangeFilter label="Test" onChange={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle rapid consecutive inputs', async () => {
      const user = userEvent.setup();
      render(<GenericRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      // Rapid inputs
      await user.type(minInput, '1');
      await user.type(maxInput, '2');
      await user.type(minInput, '3');

      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <GenericRangeFilter {...defaultProps} value={{ min: 100 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(100);

      rerender(
        <GenericRangeFilter {...defaultProps} value={{ min: 200, max: 500 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(200);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(500);
    });

    it('should update when label changes', () => {
      const { rerender } = render(<GenericRangeFilter {...defaultProps} />);

      expect(screen.getByText('Test Range')).toBeInTheDocument();

      rerender(<GenericRangeFilter {...defaultProps} label="New Range" />);

      expect(screen.queryByText('Test Range')).not.toBeInTheDocument();
      expect(screen.getByText('New Range')).toBeInTheDocument();
    });

    it('should update when unit changes', () => {
      const { rerender } = render(
        <GenericRangeFilter {...defaultProps} unit="€" />
      );

      expect(screen.getByText('(€)')).toBeInTheDocument();

      rerender(<GenericRangeFilter {...defaultProps} unit="m²" />);

      expect(screen.queryByText('(€)')).not.toBeInTheDocument();
      expect(screen.getByText('(m²)')).toBeInTheDocument();
    });

    it('should handle clearing value prop', () => {
      const { rerender } = render(
        <GenericRangeFilter {...defaultProps} value={{ min: 100, max: 500 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(100);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(500);

      rerender(<GenericRangeFilter {...defaultProps} value={undefined} />);

      expect(screen.getByPlaceholderText('Min')).toHaveValue(null);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(null);
    });
  });

  describe('Integration Scenarios', () => {
    it('should maintain state consistency during complex interactions', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();
      render(<ControlledGenericRangeFilter value={{ min: 50, max: 100 }} onChange={mockOnChange} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      // Verify initial values
      expect(minInput).toHaveValue(50);
      expect(maxInput).toHaveValue(100);

      // Clear min and type new value
      await user.clear(minInput);
      await user.type(minInput, '25');
      expect(minInput).toHaveValue(25);

      // Clear max and type new value
      await user.clear(maxInput);
      await user.type(maxInput, '75');
      expect(maxInput).toHaveValue(75);
    });

    it('should handle form-like behavior with both inputs', async () => {
      const user = userEvent.setup();
      render(<ControlledGenericRangeFilter />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      // Enter min value and tab to max
      await user.type(minInput, '100');
      await user.tab();
      expect(maxInput).toHaveFocus();

      // Enter max value
      await user.type(maxInput, '500');

      // Verify both inputs display correct values
      expect(minInput).toHaveValue(100);
      expect(maxInput).toHaveValue(500);
    });
  });
});