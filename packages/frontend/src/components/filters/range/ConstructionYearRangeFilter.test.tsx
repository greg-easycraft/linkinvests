import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { ConstructionYearRangeFilter } from './ConstructionYearRangeFilter';
import type { RangeFilterValue } from './GenericRangeFilter';

describe('ConstructionYearRangeFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default label', () => {
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      expect(screen.getByText('Année de construction')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<ConstructionYearRangeFilter {...defaultProps} label="Custom Construction Year" />);

      expect(screen.getByText('Custom Construction Year')).toBeInTheDocument();
    });

    it('should have no unit displayed', () => {
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      expect(screen.getByText('Année de construction')).toBeInTheDocument();
      expect(screen.queryByText('Année de construction ()')).not.toBeInTheDocument();
    });

    it('should render min and max inputs with default placeholders', () => {
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });
  });

  describe('Value Display and Interaction', () => {
    it('should display provided min construction year', () => {
      const value: RangeFilterValue = { min: 1990 };
      render(<ConstructionYearRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      expect(minInput).toHaveValue(1990);
    });

    it('should display provided max construction year', () => {
      const value: RangeFilterValue = { max: 2020 };
      render(<ConstructionYearRangeFilter {...defaultProps} value={value} />);

      const maxInput = screen.getByPlaceholderText('Max');
      expect(maxInput).toHaveValue(2020);
    });

    it('should display both min and max construction year values', () => {
      const value: RangeFilterValue = { min: 1980, max: 2010 };
      render(<ConstructionYearRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(1980);
      expect(maxInput).toHaveValue(2010);
    });
  });

  describe('User Interactions', () => {
    it('should call onChange with min construction year when min input changes', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '1995');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 1995 });
    });

    it('should call onChange with max construction year when max input changes', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '2015');

      expect(mockOnChange).toHaveBeenCalledWith({ max: 2015 });
    });

    it('should preserve existing value when updating only min construction year', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { max: 2010 };
      render(<ConstructionYearRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '1985');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 1985, max: 2010 });
    });

    it('should call onChange with undefined when both inputs are cleared', async () => {
      const user = userEvent.setup();
      const value: RangeFilterValue = { min: 1990, max: 2020 };
      render(<ConstructionYearRangeFilter {...defaultProps} value={value} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.clear(minInput);
      await user.clear(maxInput);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Construction Year Specific Scenarios', () => {
    it('should handle recent construction (2000s)', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '2000');
      await user.type(maxInput, '2023');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 2000, max: 2023 });
    });

    it('should handle post-war construction (1950-1980)', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '1950');
      await user.type(maxInput, '1980');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 1950, max: 1980 });
    });

    it('should handle pre-war properties', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '1939');

      expect(mockOnChange).toHaveBeenCalledWith({ max: 1939 });
    });

    it('should handle historic properties', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '1800');
      await user.type(maxInput, '1900');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 1800, max: 1900 });
    });

    it('should handle very old properties', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '1700');

      expect(mockOnChange).toHaveBeenCalledWith({ max: 1700 });
    });

    it('should handle brand new construction', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const currentYear = new Date().getFullYear();
      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, currentYear.toString());

      expect(mockOnChange).toHaveBeenCalledWith({ min: currentYear });
    });
  });

  describe('Component Integration', () => {
    it('should pass through all GenericRangeFilter props correctly', () => {
      const value: RangeFilterValue = { min: 1990, max: 2020 };
      render(<ConstructionYearRangeFilter value={value} onChange={mockOnChange} label="Test Year" />);

      expect(screen.getByText('Test Year')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Min')).toHaveValue(1990);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(2020);
    });

    it('should maintain proper component hierarchy', () => {
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const container = screen.getByText('Année de construction').nextElementSibling;
      expect(container).toHaveClass('grid', 'grid-cols-2', 'gap-2');
    });

    it('should have proper styling inheritance', () => {
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const label = screen.getByText('Année de construction');
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
    it('should handle very old dates', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '1200');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 1200 });
    });

    it('should handle future dates', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '2030');

      expect(mockOnChange).toHaveBeenCalledWith({ max: 2030 });
    });

    it('should handle year zero', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '0');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 0 });
    });

    it('should handle negative years (BC)', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '-100');

      expect(mockOnChange).toHaveBeenCalledWith({ min: -100 });
    });

    it('should handle decimal years (though not typical)', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '1995.5');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 1995.5 });
    });

    it('should handle invalid onChange prop', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<ConstructionYearRangeFilter onChange={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle null value prop', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<ConstructionYearRangeFilter onChange={mockOnChange} value={null as any} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.click(minInput);
      expect(minInput).toHaveFocus();

      await user.tab();
      expect(maxInput).toHaveFocus();
    });

    it('should have proper input roles for screen readers', () => {
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <ConstructionYearRangeFilter onChange={mockOnChange} value={{ min: 1990 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(1990);

      rerender(
        <ConstructionYearRangeFilter onChange={mockOnChange} value={{ min: 2000, max: 2020 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(2000);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(2020);
    });

    it('should clear values when value prop is set to undefined', () => {
      const { rerender } = render(
        <ConstructionYearRangeFilter onChange={mockOnChange} value={{ min: 1990, max: 2020 }} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(1990);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(2020);

      rerender(
        <ConstructionYearRangeFilter onChange={mockOnChange} value={undefined} />
      );

      expect(screen.getByPlaceholderText('Min')).toHaveValue(null);
      expect(screen.getByPlaceholderText('Max')).toHaveValue(null);
    });
  });

  describe('French Construction Periods', () => {
    it('should handle Haussmann period (1850-1870)', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '1850');
      await user.type(maxInput, '1870');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 1850, max: 1870 });
    });

    it('should handle Art Nouveau period (1890-1910)', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      await user.type(minInput, '1890');
      await user.type(maxInput, '1910');

      expect(mockOnChange).toHaveBeenLastCalledWith({ min: 1890, max: 1910 });
    });

    it('should handle modern construction standards (post-1974 thermal regulation)', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '1974');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 1974 });
    });

    it('should handle RT2012 compliant buildings', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '2012');

      expect(mockOnChange).toHaveBeenCalledWith({ min: 2012 });
    });
  });
});