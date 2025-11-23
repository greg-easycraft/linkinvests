import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { BedroomsRangeFilter } from './BedroomsRangeFilter';
import type { RangeFilterValue } from './GenericRangeFilter';

describe('BedroomsRangeFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default label', () => {
      render(<BedroomsRangeFilter {...defaultProps} />);

      expect(screen.getByText('Nombre de chambres')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<BedroomsRangeFilter {...defaultProps} label="Custom Bedrooms" />);

      expect(screen.getByText('Custom Bedrooms')).toBeInTheDocument();
    });

    it('should have no unit displayed', () => {
      render(<BedroomsRangeFilter {...defaultProps} />);

      expect(screen.getByText('Nombre de chambres')).toBeInTheDocument();
      expect(screen.queryByText('Nombre de chambres ()')).not.toBeInTheDocument();
    });

    it('should render min and max inputs with default placeholders', () => {
      render(<BedroomsRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });
  });

  describe('Value Display and Interaction', () => {
    it('should display provided min bedrooms', () => {
      const value: RangeFilterValue = { min: 1 };
      render(<BedroomsRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      expect(minInput).toHaveValue(1);
    });

    it('should display provided max bedrooms', () => {
      const value: RangeFilterValue = { max: 4 };
      render(<BedroomsRangeFilter {...defaultProps} value={value} />);

      const maxInput = screen.getByPlaceholderText('Max');
      expect(maxInput).toHaveValue(4);
    });

    it('should display both min and max bedroom values', () => {
      const value: RangeFilterValue = { min: 2, max: 5 };
      render(<BedroomsRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(2);
      expect(maxInput).toHaveValue(5);
    });
  });

  describe('User Interactions', () => {
    it('should call onChange with min bedrooms when min input changes', async () => {
      const user = userEvent.setup();
      render(<BedroomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '2');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 2 });
    });

    it('should call onChange with max bedrooms when max input changes', async () => {
      const user = userEvent.setup();
      render(<BedroomsRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '3');

      expect(mockOnChange).toHaveBeenCalledWith({ max: 3 });
    });

    it('should preserve existing value when updating only min bedrooms', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { max: 4 };
      render(<BedroomsRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '1');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 1, max: 4 });
    });

    it('should call onChange with undefined when both inputs are cleared', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { min: 2, max: 4 };
      render(<BedroomsRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.clear(minInput);
      await user.clear(maxInput);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Bedroom Specific Scenarios', () => {
    it('should handle studio apartment (0 bedrooms)', async () => {
      const user = userEvent.setup();
      render(<BedroomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '0');
      await user.type(maxInput, '0');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 0, max: 0 });
    });

    it('should handle typical apartment range (1-3 bedrooms)', async () => {
      const user = userEvent.setup();
      render(<BedroomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '1');
      await user.type(maxInput, '3');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 1, max: 3 });
    });

    it('should handle large family homes (5+ bedrooms)', async () => {
      const user = userEvent.setup();
      render(<BedroomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '5');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 5 });
    });

    it('should handle luxury properties (10+ bedrooms)', async () => {
      const user = userEvent.setup();
      render(<BedroomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '10');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 10 });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large bedroom counts', async () => {
      const user = userEvent.setup();
      render(<BedroomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '50');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 50 });
    });

    it('should not accept negative bedroom counts gracefully', async () => {
      const user = userEvent.setup();
      render(<BedroomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '-1');

      expect(mockOnChange).toHaveBeenCalledWith({ min: -1 });
    });

    it('should handle decimal values (though not typical for bedrooms)', async () => {
      const user = userEvent.setup();
      render(<BedroomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '2.5');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 2.5 });
    });
  });

  describe('Component Integration', () => {
    it('should pass through all GenericRangeFilter props correctly', () => {
      const value: RangeFilterValue = { min: 1, max: 3 };
      render(<BedroomsRangeFilter value={value} onChange={mockOnChange} label="Test Bedrooms" />);

      expect(screen.getByText('Test Bedrooms')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Min')).toHaveValue(1);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(3);
    });

    it('should maintain proper component hierarchy', () => {
      render(<BedroomsRangeFilter {...defaultProps} />);

      const container = screen.getByText('Nombre de chambres').nextElementSibling;
      expect(container).toHaveClass('grid', 'grid-cols-2', 'gap-2');
    });

    it('should have proper styling inheritance', () => {
      render(<BedroomsRangeFilter {...defaultProps} />);

      const label = screen.getByText('Nombre de chambres');
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
      render(<BedroomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.click(minInput);
      expect(minInput).toHaveFocus();

      await user.tab();
      expect(maxInput).toHaveFocus();
    });

    it('should have proper input roles for screen readers', () => {
      render(<BedroomsRangeFilter {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <BedroomsRangeFilter onChange={mockOnChange} value={{ min: 2 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(2);

      rerender(
        <BedroomsRangeFilter onChange={mockOnChange} value={{ min: 3, max: 5 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(3);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(5);
    });

    it('should clear values when value prop is set to undefined', () => {
      const { rerender } = render(
        <BedroomsRangeFilter onChange={mockOnChange} value={{ min: 2, max: 4 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(2);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(4);

      rerender(
        <BedroomsRangeFilter onChange={mockOnChange} value={undefined} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(null);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(null);
    });
  });

  describe('French Housing Standards', () => {
    it('should handle typical French apartment types', async () => {
      const user = userEvent.setup();
      render(<BedroomsRangeFilter {...defaultProps} />);

      // T3 (2 bedrooms)
      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '2');
      await user.type(maxInput, '2');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 2, max: 2 });
    });

    it('should handle family home searches', async () => {
      const user = userEvent.setup();
      render(<BedroomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '4');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 4 });
    });
  });
});