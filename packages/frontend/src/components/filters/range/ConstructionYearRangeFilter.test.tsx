import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { ConstructionYearRangeFilter } from './ConstructionYearRangeFilter';

describe('ConstructionYearRangeFilter', () => {
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
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      expect(screen.getByText('Année de construction')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<ConstructionYearRangeFilter {...defaultProps} label="Custom Year" />);

      expect(screen.getByText('Custom Year')).toBeInTheDocument();
    });

    it('should render min and max inputs with default placeholders', () => {
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('should display provided min construction year', () => {
      render(<ConstructionYearRangeFilter {...defaultProps} minValue={1990} />);

      const minInput = screen.getByPlaceholderText('Min');
      expect(minInput).toHaveValue(1990);
    });

    it('should display provided max construction year', () => {
      render(<ConstructionYearRangeFilter {...defaultProps} maxValue={2020} />);

      const maxInput = screen.getByPlaceholderText('Max');
      expect(maxInput).toHaveValue(2020);
    });

    it('should display both min and max construction year values', () => {
      render(<ConstructionYearRangeFilter {...defaultProps} minValue={1990} maxValue={2020} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(1990);
      expect(maxInput).toHaveValue(2020);
    });
  });

  describe('Interaction', () => {
    it('should call onMinChange when min input changes', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '5');

      expect(mockOnMinChange).toHaveBeenCalledWith(5);
    });

    it('should call onMaxChange when max input changes', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '9');

      expect(mockOnMaxChange).toHaveBeenCalledWith(9);
    });

    it('should call onMinChange with undefined when min input is cleared', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} minValue={1990} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.clear(minInput);

      expect(mockOnMinChange).toHaveBeenCalledWith(undefined);
    });

    it('should call onMaxChange with undefined when max input is cleared', async () => {
      const user = userEvent.setup();
      render(<ConstructionYearRangeFilter {...defaultProps} maxValue={2020} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.clear(maxInput);

      expect(mockOnMaxChange).toHaveBeenCalledWith(undefined);
    });
  });
});