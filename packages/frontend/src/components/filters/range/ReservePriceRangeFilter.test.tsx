import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { ReservePriceRangeFilter } from './ReservePriceRangeFilter';

describe('ReservePriceRangeFilter', () => {
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
      render(<ReservePriceRangeFilter {...defaultProps} />);

      expect(screen.getByText('Prix de réserve')).toBeInTheDocument();
      expect(screen.getByText('(€)')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<ReservePriceRangeFilter {...defaultProps} label="Custom Reserve Price" />);

      expect(screen.getByText('Custom Reserve Price')).toBeInTheDocument();
      expect(screen.getByText('(€)')).toBeInTheDocument();
    });

    it('should render min and max inputs with default placeholders', () => {
      render(<ReservePriceRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('should display provided min reserve price', () => {
      render(<ReservePriceRangeFilter {...defaultProps} minValue={50000} />);

      const minInput = screen.getByPlaceholderText('Min');
      expect(minInput).toHaveValue(50000);
    });

    it('should display provided max reserve price', () => {
      render(<ReservePriceRangeFilter {...defaultProps} maxValue={300000} />);

      const maxInput = screen.getByPlaceholderText('Max');
      expect(maxInput).toHaveValue(300000);
    });

    it('should display both min and max reserve price values', () => {
      render(<ReservePriceRangeFilter {...defaultProps} minValue={50000} maxValue={300000} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(50000);
      expect(maxInput).toHaveValue(300000);
    });
  });

  describe('Interaction', () => {
    it('should call onMinChange when min input changes', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '7');

      expect(mockOnMinChange).toHaveBeenCalledWith(7);
    });

    it('should call onMaxChange when max input changes', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '4');

      expect(mockOnMaxChange).toHaveBeenCalledWith(4);
    });

    it('should call onMinChange with undefined when min input is cleared', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} minValue={50000} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.clear(minInput);

      expect(mockOnMinChange).toHaveBeenCalledWith(undefined);
    });

    it('should call onMaxChange with undefined when max input is cleared', async () => {
      const user = userEvent.setup();
      render(<ReservePriceRangeFilter {...defaultProps} maxValue={300000} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.clear(maxInput);

      expect(mockOnMaxChange).toHaveBeenCalledWith(undefined);
    });
  });
});