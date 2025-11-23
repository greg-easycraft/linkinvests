import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { RoomsRangeFilter } from './RoomsRangeFilter';
import type { RangeFilterValue } from './GenericRangeFilter';

describe('RoomsRangeFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default label', () => {
      render(<RoomsRangeFilter {...defaultProps} />);

      expect(screen.getByText('Nombre de pièces')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<RoomsRangeFilter {...defaultProps} label="Custom Rooms" />);

      expect(screen.getByText('Custom Rooms')).toBeInTheDocument();
    });

    it('should have no unit displayed', () => {
      render(<RoomsRangeFilter {...defaultProps} />);

      expect(screen.getByText('Nombre de pièces')).toBeInTheDocument();
      expect(screen.queryByText('Nombre de pièces ()')).not.toBeInTheDocument();
    });

    it('should render min and max inputs with default placeholders', () => {
      render(<RoomsRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });
  });

  describe('Value Display and Interaction', () => {
    it('should display provided min rooms', () => {
      const value: RangeFilterValue = { min: 2 };
      render(<RoomsRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      expect(minInput).toHaveValue(2);
    });

    it('should display provided max rooms', () => {
      const value: RangeFilterValue = { max: 6 };
      render(<RoomsRangeFilter {...defaultProps} value={value} />);

      const maxInput = screen.getByPlaceholderText('Max');
      expect(maxInput).toHaveValue(6);
    });

    it('should display both min and max room values', () => {
      const value: RangeFilterValue = { min: 3, max: 8 };
      render(<RoomsRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(3);
      expect(maxInput).toHaveValue(8);
    });
  });

  describe('User Interactions', () => {
    it('should call onChange with min rooms when min input changes', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '3');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 3 });
    });

    it('should call onChange with max rooms when max input changes', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '5');

      expect(mockOnChange).toHaveBeenCalledWith({ max: 5 });
    });

    it('should preserve existing value when updating only min rooms', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { max: 6 };
      render(<RoomsRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '2');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 2, max: 6 });
    });

    it('should call onChange with undefined when both inputs are cleared', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { min: 3, max: 6 };
      render(<RoomsRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.clear(minInput);
      await user.clear(maxInput);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Rooms Specific Scenarios', () => {
    it('should handle studio apartment (1 room)', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '1');
      await user.type(maxInput, '1');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 1, max: 1 });
    });

    it('should handle typical apartment range (2-5 rooms)', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '2');
      await user.type(maxInput, '5');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 2, max: 5 });
    });

    it('should handle large family homes (8+ rooms)', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '8');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 8 });
    });

    it('should handle luxury properties (15+ rooms)', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '15');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 15 });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large room counts', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '100');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 100 });
    });

    it('should handle zero rooms', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '0');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 0 });
    });

    it('should handle decimal values (though not typical for rooms)', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '3.5');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 3.5 });
    });
  });

  describe('Component Integration', () => {
    it('should pass through all GenericRangeFilter props correctly', () => {
      const value: RangeFilterValue = { min: 2, max: 5 };
      render(<RoomsRangeFilter value={value} onChange={mockOnChange} label="Test Rooms" />);

      expect(screen.getByText('Test Rooms')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Min')).toHaveValue(2);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(5);
    });

    it('should maintain proper component hierarchy', () => {
      render(<RoomsRangeFilter {...defaultProps} />);

      const container = screen.getByText('Nombre de pièces').nextElementSibling;
      expect(container).toHaveClass('grid', 'grid-cols-2', 'gap-2');
    });

    it('should have proper styling inheritance', () => {
      render(<RoomsRangeFilter {...defaultProps} />);

      const label = screen.getByText('Nombre de pièces');
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
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.click(minInput);
      expect(minInput).toHaveFocus();

      await user.tab();
      expect(maxInput).toHaveFocus();
    });

    it('should have proper input roles for screen readers', () => {
      render(<RoomsRangeFilter {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <RoomsRangeFilter onChange={mockOnChange} value={{ min: 3 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(3);

      rerender(
        <RoomsRangeFilter onChange={mockOnChange} value={{ min: 4, max: 7 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(4);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(7);
    });

    it('should clear values when value prop is set to undefined', () => {
      const { rerender } = render(
        <RoomsRangeFilter onChange={mockOnChange} value={{ min: 3, max: 6 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(3);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(6);

      rerender(
        <RoomsRangeFilter onChange={mockOnChange} value={undefined} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(null);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(null);
    });
  });

  describe('French Housing Standards', () => {
    it('should handle typical French apartment classifications', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} />);

      // T2 (2 rooms: living room + 1 bedroom)
      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '2');
      await user.type(maxInput, '2');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 2, max: 2 });
    });

    it('should handle family apartment searches (T4-T5)', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '4');
      await user.type(maxInput, '5');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 4, max: 5 });
    });

    it('should handle large family homes (6+ rooms)', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '6');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 6 });
    });
  });
});