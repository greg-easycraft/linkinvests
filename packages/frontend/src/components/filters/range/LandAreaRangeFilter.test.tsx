import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { LandAreaRangeFilter } from './LandAreaRangeFilter';
import type { RangeFilterValue } from './GenericRangeFilter';

describe('LandAreaRangeFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default label', () => {
      render(<LandAreaRangeFilter {...defaultProps} />);

      expect(screen.getByText('Surface terrain (m²)')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<LandAreaRangeFilter {...defaultProps} label="Custom Land Area" />);

      expect(screen.getByText('Custom Land Area (m²)')).toBeInTheDocument();
    });

    it('should have square meter unit displayed', () => {
      render(<LandAreaRangeFilter {...defaultProps} />);

      expect(screen.getByText('Surface terrain (m²)')).toBeInTheDocument();
    });

    it('should render min and max inputs with default placeholders', () => {
      render(<LandAreaRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });
  });

  describe('Value Display and Interaction', () => {
    it('should display provided min land area', () => {
      const value: RangeFilterValue = { min: 500 };
      render(<LandAreaRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      expect(minInput).toHaveValue(500);
    });

    it('should display provided max land area', () => {
      const value: RangeFilterValue = { max: 2000 };
      render(<LandAreaRangeFilter {...defaultProps} value={value} />);

      const maxInput = screen.getByPlaceholderText('Max');
      expect(maxInput).toHaveValue(2000);
    });

    it('should display both min and max land area values', () => {
      const value: RangeFilterValue = { min: 800, max: 3000 };
      render(<LandAreaRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(800);
      expect(maxInput).toHaveValue(3000);
    });
  });

  describe('User Interactions', () => {
    it('should call onChange with min land area when min input changes', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '1000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 1000 });
    });

    it('should call onChange with max land area when max input changes', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '5000');

      expect(mockOnChange).toHaveBeenCalledWith({ max: 5000 });
    });

    it('should preserve existing value when updating only min land area', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { max: 4000 };
      render(<LandAreaRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '600');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 600, max: 4000 });
    });

    it('should call onChange with undefined when both inputs are cleared', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { min: 800, max: 3000 };
      render(<LandAreaRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.clear(minInput);
      await user.clear(maxInput);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Land Area Specific Scenarios', () => {
    it('should handle small urban lots', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '200');
      await user.type(maxInput, '800');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 200, max: 800 });
    });

    it('should handle typical suburban land', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '1000');
      await user.type(maxInput, '3000');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 1000, max: 3000 });
    });

    it('should handle large rural properties', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '10000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 10000 });
    });

    it('should handle agricultural land', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '50000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 50000 });
    });

    it('should handle very small lots', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '50');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 50 });
    });

    it('should handle commercial land parcels', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '5000');
      await user.type(maxInput, '20000');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 5000, max: 20000 });
    });
  });

  describe('Component Integration', () => {
    it('should pass through all GenericRangeFilter props correctly', () => {
      const value: RangeFilterValue = { min: 1000, max: 5000 };
      render(<LandAreaRangeFilter value={value} onChange={mockOnChange} label="Test Land" />);

      expect(screen.getByText('Test Land (m²)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Min')).toHaveValue(1000);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(5000);
    });

    it('should maintain proper component hierarchy', () => {
      render(<LandAreaRangeFilter {...defaultProps} />);

      const container = screen.getByText('Surface terrain (m²)').nextElementSibling;
      expect(container).toHaveClass('grid', 'grid-cols-2', 'gap-2');
    });

    it('should have proper styling inheritance', () => {
      render(<LandAreaRangeFilter {...defaultProps} />);

      const label = screen.getByText('Surface terrain (m²)');
      expect(label).toHaveClass(
        'text-sm',
        'font-medium',
        'mb-2',
        'block',
        'font-heading'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large land areas', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '1000000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 1000000 });
    });

    it('should handle zero land area', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '0');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 0 });
    });

    it('should handle decimal land areas', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '1500.75');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 1500.75 });
    });

    it('should handle invalid onChange prop', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<LandAreaRangeFilter onChange={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle null value prop', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<LandAreaRangeFilter onChange={mockOnChange} value={null as any} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.click(minInput);
      expect(minInput).toHaveFocus();

      await user.tab();
      expect(maxInput).toHaveFocus();
    });

    it('should have proper input roles for screen readers', () => {
      render(<LandAreaRangeFilter {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <LandAreaRangeFilter onChange={mockOnChange} value={{ min: 1000 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(1000);

      rerender(
        <LandAreaRangeFilter onChange={mockOnChange} value={{ min: 1500, max: 4000 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(1500);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(4000);
    });

    it('should clear values when value prop is set to undefined', () => {
      const { rerender } = render(
        <LandAreaRangeFilter onChange={mockOnChange} value={{ min: 1000, max: 5000 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(1000);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(5000);

      rerender(
        <LandAreaRangeFilter onChange={mockOnChange} value={undefined} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(null);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(null);
    });
  });

  describe('French Property Types', () => {
    it('should handle typical house with garden', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '400');
      await user.type(maxInput, '1200');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 400, max: 1200 });
    });

    it('should handle villa properties', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '2000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 2000 });
    });

    it('should handle building lots', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '800');
      await user.type(maxInput, '2500');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 800, max: 2500 });
    });
  });
});