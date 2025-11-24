import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { SquareFootageRangeFilter } from './SquareFootageRangeFilter';

describe('SquareFootageRangeFilter', () => {
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
      render(<SquareFootageRangeFilter {...defaultProps} />);

      expect(screen.getByText('Surface')).toBeInTheDocument();
      expect(screen.getByText('(m²)')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<SquareFootageRangeFilter {...defaultProps} label="Custom Surface" />);

      expect(screen.getByText('Custom Surface')).toBeInTheDocument();
      expect(screen.getByText('(m²)')).toBeInTheDocument();
    });

    it('should render min and max inputs with default placeholders', () => {
      render(<SquareFootageRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('should display provided min square footage', () => {
      render(<SquareFootageRangeFilter {...defaultProps} minValue={50} />);

      const minInput = screen.getByPlaceholderText('Min');
      expect(minInput).toHaveValue(50);
    });

    it('should display provided max square footage', () => {
      render(<SquareFootageRangeFilter {...defaultProps} maxValue={200} />);

      const maxInput = screen.getByPlaceholderText('Max');
      expect(maxInput).toHaveValue(200);
    });

    it('should display both min and max square footage values', () => {
      render(<SquareFootageRangeFilter {...defaultProps} minValue={50} maxValue={200} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(50);
      expect(maxInput).toHaveValue(200);
    });
  });

  describe('Interaction', () => {
    it('should call onMinChange when min input changes', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '8');

      expect(mockOnMinChange).toHaveBeenCalledWith(8);
    });

    it('should call onMaxChange when max input changes', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '9');

      expect(mockOnMaxChange).toHaveBeenCalledWith(9);
    });

    it('should call onMinChange with undefined when min input is cleared', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} minValue={50} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.clear(minInput);

      expect(mockOnMinChange).toHaveBeenCalledWith(undefined);
    });

    it('should call onMaxChange with undefined when max input is cleared', async () => {
      const user = userEvent.setup();
      render(<SquareFootageRangeFilter {...defaultProps} maxValue={200} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.clear(maxInput);

      expect(mockOnMaxChange).toHaveBeenCalledWith(undefined);
    });
  });
});