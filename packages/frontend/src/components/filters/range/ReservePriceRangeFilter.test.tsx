import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { ReservePriceRangeFilter } from './ReservePriceRangeFilter';
import type { RangeFilterValue } from './GenericRangeFilter';

describe('ReservePriceRangeFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default label', () => {
      render(<ReservePriceRangeFilter {...defaultProps} />);

      expect(screen.getByText('Prix de réserve (€)')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<ReservePriceRangeFilter {...defaultProps} label="Custom Reserve Price" />);

      expect(screen.getByText('Custom Reserve Price (€)')).toBeInTheDocument();
    });

    it('should have Euro unit displayed', () => {
      render(<ReservePriceRangeFilter {...defaultProps} />);

      expect(screen.getByText('Prix de réserve (€)')).toBeInTheDocument();
    });

    it('should render min and max inputs with default placeholders', () => {
      render(<ReservePriceRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });
  });

  describe('Value Display and Interaction', () => {
    it('should display provided min reserve price', () => {
      const value: RangeFilterValue = { min: 50000 };
      render(<ReservePriceRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      expect(minInput).toHaveValue(50000);
    });

    it('should display provided max reserve price', () => {
      const value: RangeFilterValue = { max: 300000 };
      render(<ReservePriceRangeFilter {...defaultProps} value={value} />);

      const maxInput = screen.getByPlaceholderText('Max');
      expect(maxInput).toHaveValue(300000);
    });

    it('should display both min and max reserve prices', () => {
      const value: RangeFilterValue = { min: 80000, max: 400000 };
      render(<ReservePriceRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(80000);
      expect(maxInput).toHaveValue(400000);
    });
  });

  describe('User Interactions', () => {
    it('should call onChange with min reserve price when min input changes', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '75000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 75000 });
    });

    it('should call onChange with max reserve price when max input changes', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '350000');

      expect(mockOnChange).toHaveBeenCalledWith({ max: 350000 });
    });

    it('should preserve existing value when updating only min reserve price', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { max: 300000 };
      render(<ReservePriceRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '60000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 60000, max: 300000 });
    });

    it('should call onChange with undefined when both inputs are cleared', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { min: 80000, max: 400000 };
      render(<ReservePriceRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.clear(minInput);
      await user.clear(maxInput);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Reserve Price Specific Scenarios', () => {
    it('should handle typical auction reserve prices', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      // Typical judicial auction reserve range
      await user.type(minInput, '50000');
      await user.type(maxInput, '250000');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 50000, max: 250000 });
    });

    it('should handle low reserve price auctions', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '10000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 10000 });
    });

    it('should handle high-value property auctions', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '1000000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 1000000 });
    });

    it('should handle commercial property auction reserves', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '200000');
      await user.type(maxInput, '2000000');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 200000, max: 2000000 });
    });

    it('should handle zero reserve auctions', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '0');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 0 });
    });
  });

  describe('Component Integration', () => {
    it('should pass through all GenericRangeFilter props correctly', () => {
      const value: RangeFilterValue = { min: 100000, max: 500000 };
      render(<ReservePriceRangeFilter value={value} onChange={mockOnChange} label="Test Reserve" />);

      expect(screen.getByText('Test Reserve (€)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Min')).toHaveValue(100000);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(500000);
    });

    it('should maintain proper component hierarchy', () => {
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const container = screen.getByText('Prix de réserve (€)').nextElementSibling;
      expect(container).toHaveClass('grid', 'grid-cols-2', 'gap-2');
    });

    it('should have proper styling inheritance', () => {
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const label = screen.getByText('Prix de réserve (€)');
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
    it('should handle very large reserve prices', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '50000000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 50000000 });
    });

    it('should handle decimal reserve prices', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '75500.50');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 75500.50 });
    });

    it('should handle invalid onChange prop', () => {
      expect(() => {
        render(<ReservePriceRangeFilter onChange={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle null value prop', () => {
      expect(() => {
        render(<ReservePriceRangeFilter onChange={mockOnChange} value={null as any} />);
      }).not.toThrow();
    });
  });

  describe('French Auction System', () => {
    it('should handle typical notarial auction reserves', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '100000');
      await user.type(maxInput, '600000');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 100000, max: 600000 });
    });

    it('should handle judicial auction minimums', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '30000');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 30000 });
    });

    it('should handle voluntary auction reserves', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '150000');
      await user.type(maxInput, '800000');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 150000, max: 800000 });
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <ReservePriceRangeFilter onChange={mockOnChange} value={{ min: 100000 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(100000);

      rerender(
        <ReservePriceRangeFilter onChange={mockOnChange} value={{ min: 150000, max: 500000 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(150000);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(500000);
    });

    it('should clear values when value prop is set to undefined', () => {
      const { rerender } = render(
        <ReservePriceRangeFilter onChange={mockOnChange} value={{ min: 100000, max: 500000 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(100000);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(500000);

      rerender(
        <ReservePriceRangeFilter onChange={mockOnChange} value={undefined} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(null);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(null);
    });
  });
});