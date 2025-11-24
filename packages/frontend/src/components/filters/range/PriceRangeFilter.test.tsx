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

      expect(screen.getByText('Prix')).toBeInTheDocument();
      expect(screen.getByText('(€)')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<PriceRangeFilter {...defaultProps} label="Custom Price" />);

      expect(screen.getByText('Custom Price')).toBeInTheDocument();
      expect(screen.getByText('(€)')).toBeInTheDocument();
    });

    it('should render min and max inputs with default placeholders', () => {
      render(<PriceRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Prix min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Prix max')).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('should display provided min price', () => {
      render(<PriceRangeFilter {...defaultProps} minValue={100000} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      expect(minInput).toHaveValue(100000);
    });

    it('should display provided max price', () => {
      render(<PriceRangeFilter {...defaultProps} maxValue={500000} />);

      const maxInput = screen.getByPlaceholderText('Prix max');
      expect(maxInput).toHaveValue(500000);
    });

    it('should display both min and max price values', () => {
      render(<PriceRangeFilter {...defaultProps} minValue={100000} maxValue={500000} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      const maxInput = screen.getByPlaceholderText('Prix max');

      expect(minInput).toHaveValue(100000);
      expect(maxInput).toHaveValue(500000);
    });
  });

  describe('Interaction', () => {
    it('should call onMinChange when min input changes', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      await user.type(minInput, '1');

      expect(mockOnMinChange).toHaveBeenCalledWith(1);
    });

    it('should call onMaxChange when max input changes', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Prix max');
      await user.type(maxInput, '5');

      expect(mockOnMaxChange).toHaveBeenCalledWith(5);
    });

    it('should call onMinChange with undefined when min input is cleared', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} minValue={100000} />);

      const minInput = screen.getByPlaceholderText('Prix min');
      await user.clear(minInput);

      expect(mockOnMinChange).toHaveBeenCalledWith(undefined);
    });

    it('should call onMaxChange with undefined when max input is cleared', async () => {
      const user = userEvent.setup();
      render(<PriceRangeFilter {...defaultProps} maxValue={500000} />);

      const maxInput = screen.getByPlaceholderText('Prix max');
      await user.clear(maxInput);

      expect(mockOnMaxChange).toHaveBeenCalledWith(undefined);
    });
  });
});