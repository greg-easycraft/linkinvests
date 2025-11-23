import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { PriceRangeFilter } from './PriceRangeFilter';

describe('PriceRangeFilter', () => {
  const mockOnMinChange = jest.fn();
  const mockOnMaxChange = jest.fn();
  const defaultProps = {
    onMinChange: mockOnMinChange,
    onMaxChange: mockOnMaxChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default label', () => {
      render(<PriceRangeFilter {...defaultProps} />);

      expect(screen.getByText('Prix (€)')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<PriceRangeFilter {...defaultProps} label="Custom Price" />);

      expect(screen.getByText('Custom Price (€)')).toBeInTheDocument();
    });

    it('should have Euro unit displayed', () => {
      render(<PriceRangeFilter {...defaultProps} />);

      expect(screen.getByText('Prix (€)')).toBeInTheDocument();
    });

    it('should render min and max inputs with proper placeholders', () => {
      render(<PriceRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Prix min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Prix max')).toBeInTheDocument();
    });

    it('should have number input types', () => {
      render(<PriceRangeFilter {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
      inputs.forEach(input => {
        expect(input).toHaveAttribute('type', 'number');
      });
    });
  });

  describe('Value Display and Interaction', () => {
    it('should display provided min price', () => {
      const value: RangeFilterValue = { min: 100000 };
      render(<PriceRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      expect(minInput).toHaveValue(100000);
    });

    it('should display provided max price', () => {
      const value: RangeFilterValue = { max: 500000 };
      render(<PriceRangeFilter {...defaultProps} value={value} />);

      const maxInput = screen.getByPlaceholderText('Prix max');
      expect(maxInput).toHaveValue(500000);
    });

    it('should display both min and max prices', () => {
      const value: RangeFilterValue = { min: 100000, max: 500000 };
      render(<PriceRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      const maxInput = screen.getByPlaceholderText('Prix max');

      expect(minInput).toHaveValue(100000);
      expect(maxInput).toHaveValue(500000);
    });

    it('should handle empty inputs', () => {
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      const maxInput = screen.getByPlaceholderText('Prix max');

      expect(minInput).toHaveValue(null);
      expect(maxInput).toHaveValue(null);
    });
  });

  describe('User Interactions', () => {
    it('should call onChange with min price when min input changes', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      await user.type(minInput, '100000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 100000 });
    });

    it('should call onChange with max price when max input changes', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Prix max');
      await user.type(maxInput, '500000');

      expect(mockOnChange).toHaveBeenCalledWith({ max: 500000 });
    });

    it('should preserve existing value when updating only min price', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { max: 500000 };
      render(<PriceRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      await user.type(minInput, '100000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 100000, max: 500000 });
    });

    it('should preserve existing value when updating only max price', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { min: 100000 };
      render(<PriceRangeFilter {...defaultProps} value={value} />);

      const maxInput = screen.getByPlaceholderText('Prix max');
      await user.type(maxInput, '500000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 100000, max: 500000 });
    });

    it('should call onChange with undefined when both inputs are cleared', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { min: 100000, max: 500000 };
      render(<PriceRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      const maxInput = screen.getByPlaceholderText('Prix max');

      await user.clear(minInput);
      await user.clear(maxInput);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Price Specific Scenarios', () => {
    it('should handle typical real estate price ranges', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      const maxInput = screen.getByPlaceholderText('Prix max');

      // Typical apartment price range
      await user.type(minInput, '200000');
      await user.type(maxInput, '800000');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 200000, max: 800000 });
    });

    it('should handle high-value property prices', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      await user.type(minInput, '1000000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 1000000 });
    });

    it('should handle low-value property prices', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      await user.type(minInput, '50000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 50000 });
    });

    it('should handle decimal prices', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      await user.type(minInput, '199999.99');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 199999.99 });
    });

    it('should handle zero price', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      await user.type(minInput, '0');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 0 });
    });
  });

  describe('Component Props Integration', () => {
    it('should pass through all GenericRangeFilter props correctly', () => {
      const value: RangeFilterValue = { min: 100000, max: 500000 };
      render(<PriceRangeFilter value={value} onChange={mockOnChange} label="Test Price" />);

      expect(screen.getByText('Test Price (€)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Prix min')).toHaveValue(100000);
      expect(screen.getByPlaceholderText('Prix max')).toHaveValue(500000);
    });

    it('should maintain proper component hierarchy', () => {
      render(<PriceRangeFilter {...defaultProps} />);

      // Should have the grid layout from GenericRangeFilter
      const container = screen.getByText('Prix (€)').nextElementSibling;
      expect(container).toHaveClass('grid', 'grid-cols-2', 'gap-2');
    });

    it('should have proper styling inheritance', () => {
      render(<PriceRangeFilter {...defaultProps} />);

      const label = screen.getByText('Prix (€)');
      expect(label).toHaveClass(
        'text-sm',
        'font-medium',
        'mb-2',
        'block',
        'font-heading'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for price inputs', () => {
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      const maxInput = screen.getByPlaceholderText('Prix max');

      expect(minInput).toBeInTheDocument();
      expect(maxInput).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      const maxInput = screen.getByPlaceholderText('Prix max');

      await user.click(minInput);
      expect(minInput).toHaveFocus();

      await user.tab();
      expect(maxInput).toHaveFocus();
    });

    it('should have proper input roles for screen readers', () => {
      render(<PriceRangeFilter {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large prices', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      await user.type(minInput, '99999999999');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 99999999999 });
    });

    it('should not accept negative prices gracefully', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      await user.type(minInput, '-100');

      expect(mockOnChange).toHaveBeenCalledWith({ min: -100 });
    });

    it('should handle invalid onChange prop', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<PriceRangeFilter onChange={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle null value prop', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<PriceRangeFilter onChange={mockOnChange} value={null as any} />);
      }).not.toThrow();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <PriceRangeFilter onChange={mockOnChange} value={{ min: 100000 }} />
      );

      expect(screen.getByPlaceholderText('Prix min')).toHaveValue(100000);

      rerender(
        <PriceRangeFilter onChange={mockOnChange} value={{ min: 200000, max: 600000 }} />
      );

      expect(screen.getByPlaceholderText('Prix min')).toHaveValue(200000);
      expect(screen.getByPlaceholderText('Prix max')).toHaveValue(600000);
    });

    it('should update when label changes', () => {
      const { rerender } = render(
        <PriceRangeFilter onChange={mockOnChange} label="Original Price" />
      );

      expect(screen.getByText('Original Price (€)')).toBeInTheDocument();

      rerender(
        <PriceRangeFilter onChange={mockOnChange} label="Updated Price" />
      );

      expect(screen.queryByText('Original Price (€)')).not.toBeInTheDocument();
      expect(screen.getByText('Updated Price (€)')).toBeInTheDocument();
    });

    it('should clear values when value prop is set to undefined', () => {
      const { rerender } = render(
        <PriceRangeFilter onChange={mockOnChange} value={{ min: 100000, max: 500000 }} />
      );

      expect(screen.getByPlaceholderText('Prix min')).toHaveValue(100000);
      expect(screen.getByPlaceholderText('Prix max')).toHaveValue(500000);

      rerender(
        <PriceRangeFilter onChange={mockOnChange} value={undefined} />
      );

      expect(screen.getByPlaceholderText('Prix min')).toHaveValue(null);
      expect(screen.getByPlaceholderText('Prix max')).toHaveValue(null);
    });
  });

  describe('Real Estate Price Scenarios', () => {
    it('should handle typical Parisian apartment prices', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      const maxInput = screen.getByPlaceholderText('Prix max');

      // Typical range for Paris
      await user.type(minInput, '400000');
      await user.type(maxInput, '1200000');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 400000, max: 1200000 });
    });

    it('should handle luxury property prices', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      await user.type(minInput, '2000000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 2000000 });
    });

    it('should handle budget property searches', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Prix max');
      await user.type(maxInput, '150000');

      expect(mockOnChange).toHaveBeenCalledWith({ max: 150000 });
    });

    it('should handle investment property ranges', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      const maxInput = screen.getByPlaceholderText('Prix max');

      await user.type(minInput, '80000');
      await user.type(maxInput, '250000');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 80000, max: 250000 });
    });
  });
});