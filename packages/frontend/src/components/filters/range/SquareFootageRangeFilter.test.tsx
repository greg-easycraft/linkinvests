import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { SquareFootageRangeFilter } from './SquareFootageRangeFilter';
import type { RangeFilterValue } from './GenericRangeFilter';

describe('SquareFootageRangeFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default label', () => {
      render(<SquareFootageRangeFilter {...defaultProps} />);

      expect(screen.getByText('Surface (m²)')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<SquareFootageRangeFilter {...defaultProps} label="Custom Surface" />);

      expect(screen.getByText('Custom Surface (m²)')).toBeInTheDocument();
    });

    it('should have square meter unit displayed', () => {
      render(<SquareFootageRangeFilter {...defaultProps} />);

      expect(screen.getByText('Surface (m²)')).toBeInTheDocument();
    });

    it('should render min and max inputs with default placeholders', () => {
      render(<SquareFootageRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });

    it('should have number input types', () => {
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
      inputs.forEach(input => {
        expect(input).toHaveAttribute('type', 'number');
      });
    });
  });

  describe('Value Display and Interaction', () => {
    it('should display provided min surface', () => {
      const value: RangeFilterValue = { min: 30 };
      render(<SquareFootageRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      expect(minInput).toHaveValue(30);
    });

    it('should display provided max surface', () => {
      const value: RangeFilterValue = { max: 120 };
      render(<SquareFootageRangeFilter {...defaultProps} value={value} />);

      const maxInput = screen.getByPlaceholderText('Max');
      expect(maxInput).toHaveValue(120);
    });

    it('should display both min and max surface values', () => {
      const value: RangeFilterValue = { min: 30, max: 120 };
      render(<SquareFootageRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(30);
      expect(maxInput).toHaveValue(120);
    });

    it('should handle empty inputs', () => {
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(null);
      expect(maxInput).toHaveValue(null);
    });
  });

  describe('User Interactions', () => {
    it('should call onChange with min surface when min input changes', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '50');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 50 });
    });

    it('should call onChange with max surface when max input changes', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '100');

      expect(mockOnChange).toHaveBeenCalledWith({ max: 100 });
    });

    it('should preserve existing value when updating only min surface', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { max: 100 };
      render(<SquareFootageRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '40');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 40, max: 100 });
    });

    it('should preserve existing value when updating only max surface', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { min: 40 };
      render(<SquareFootageRangeFilter {...defaultProps} value={value} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '100');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 40, max: 100 });
    });

    it('should call onChange with undefined when both inputs are cleared', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { min: 40, max: 100 };
      render(<SquareFootageRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.clear(minInput);
      await user.clear(maxInput);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Surface Area Specific Scenarios', () => {
    it('should handle typical studio apartment surface', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '15');
      await user.type(maxInput, '25');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 15, max: 25 });
    });

    it('should handle typical apartment surface range', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '60');
      await user.type(maxInput, '120');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 60, max: 120 });
    });

    it('should handle large house surface areas', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '200');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 200 });
    });

    it('should handle very small surfaces', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '9');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 9 });
    });

    it('should handle decimal surface values', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '45.5');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 45.5 });
    });

    it('should handle commercial property surfaces', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '500');
      await user.type(maxInput, '2000');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 500, max: 2000 });
    });
  });

  describe('Component Props Integration', () => {
    it('should pass through all GenericRangeFilter props correctly', () => {
      const value: RangeFilterValue = { min: 50, max: 150 };
      render(<SquareFootageRangeFilter value={value} onChange={mockOnChange} label="Test Surface" />);

      expect(screen.getByText('Test Surface (m²)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Min')).toHaveValue(50);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(150);
    });

    it('should maintain proper component hierarchy', () => {
      render(<SquareFootageRangeFilter {...defaultProps} />);

      // Should have the grid layout from GenericRangeFilter
      const container = screen.getByText('Surface (m²)').nextElementSibling;
      expect(container).toHaveClass('grid', 'grid-cols-2', 'gap-2');
    });

    it('should have proper styling inheritance', () => {
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const label = screen.getByText('Surface (m²)');
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
    it('should have accessible labels for surface inputs', () => {
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toBeInTheDocument();
      expect(maxInput).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.click(minInput);
      expect(minInput).toHaveFocus();

      await user.tab();
      expect(maxInput).toHaveFocus();
    });

    it('should have proper input roles for screen readers', () => {
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large surface areas', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '10000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 10000 });
    });

    it('should handle zero surface area', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '0');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 0 });
    });

    it('should not accept negative surface areas gracefully', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '-10');

      expect(mockOnChange).toHaveBeenCalledWith({ min: -10 });
    });

    it('should handle invalid onChange prop', () => {
      expect(() => {
        render(<SquareFootageRangeFilter onChange={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle null value prop', () => {
      expect(() => {
        render(<SquareFootageRangeFilter onChange={mockOnChange} value={null as any} />);
      }).not.toThrow();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <SquareFootageRangeFilter onChange={mockOnChange} value={{ min: 50 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(50);

      rerender(
        <SquareFootageRangeFilter onChange={mockOnChange} value={{ min: 80, max: 140 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(80);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(140);
    });

    it('should update when label changes', () => {
      const { rerender } = render(
        <SquareFootageRangeFilter onChange={mockOnChange} label="Original Surface" />
      );

      expect(screen.getByText('Original Surface (m²)')).toBeInTheDocument();

      rerender(
        <SquareFootageRangeFilter onChange={mockOnChange} label="Updated Surface" />
      );

      expect(screen.queryByText('Original Surface (m²)')).not.toBeInTheDocument();
      expect(screen.getByText('Updated Surface (m²)')).toBeInTheDocument();
    });

    it('should clear values when value prop is set to undefined', () => {
      const { rerender } = render(
        <SquareFootageRangeFilter onChange={mockOnChange} value={{ min: 50, max: 150 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(50);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(150);

      rerender(
        <SquareFootageRangeFilter onChange={mockOnChange} value={undefined} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(null);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(null);
    });
  });

  describe('Property Type Specific Scenarios', () => {
    it('should handle parking space surfaces', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '12');
      await user.type(maxInput, '30');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 12, max: 30 });
    });

    it('should handle office space surfaces', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '100');
      await user.type(maxInput, '500');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 100, max: 500 });
    });

    it('should handle warehouse surfaces', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '1000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 1000 });
    });

    it('should handle loft and atypical spaces', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '80');
      await user.type(maxInput, '300');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 80, max: 300 });
    });
  });

  describe('French Real Estate Standards', () => {
    it('should handle Loi Carrez surface measurements', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '8'); // Minimum Loi Carrez requirement

      expect(mockOnChange).toHaveBeenCalledWith({ min: 8 });
    });

    it('should handle typical French apartment categories', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      // T2 apartment typical range
      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '30');
      await user.type(maxInput, '50');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 30, max: 50 });
    });

    it('should handle large family homes', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '150');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 150 });
    });
  });
});