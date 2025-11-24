import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { LandAreaRangeFilter } from './LandAreaRangeFilter';

describe('LandAreaRangeFilter', () => {
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
      render(<LandAreaRangeFilter {...defaultProps} />);

      expect(screen.getByText('Surface terrain')).toBeInTheDocument();
      expect(screen.getByText('(m²)')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<LandAreaRangeFilter {...defaultProps} label="Custom Land Area" />);

      expect(screen.getByText('Custom Land Area')).toBeInTheDocument();
      expect(screen.getByText('(m²)')).toBeInTheDocument();
    });

    it('should render min and max inputs with default placeholders', () => {
      render(<LandAreaRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('should display provided min land area', () => {
      render(<LandAreaRangeFilter {...defaultProps} minValue={100} />);

      const minInput = screen.getByPlaceholderText('Min');
      expect(minInput).toHaveValue(100);
    });

    it('should display provided max land area', () => {
      render(<LandAreaRangeFilter {...defaultProps} maxValue={1000} />);

      const maxInput = screen.getByPlaceholderText('Max');
      expect(maxInput).toHaveValue(1000);
    });

    it('should display both min and max land area values', () => {
      render(<LandAreaRangeFilter {...defaultProps} minValue={100} maxValue={1000} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(100);
      expect(maxInput).toHaveValue(1000);
    });
  });

  describe('Interaction', () => {
    it('should call onMinChange when min input changes', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '5');

      expect(mockOnMinChange).toHaveBeenCalledWith(5);
    });

    it('should call onMaxChange when max input changes', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '9');

      expect(mockOnMaxChange).toHaveBeenCalledWith(9);
    });

    it('should call onMinChange with undefined when min input is cleared', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} minValue={500} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.clear(minInput);

      expect(mockOnMinChange).toHaveBeenCalledWith(undefined);
    });

    it('should call onMaxChange with undefined when max input is cleared', async () => {
      const user = userEvent.setup();
      render(<LandAreaRangeFilter {...defaultProps} maxValue={1000} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.clear(maxInput);

      expect(mockOnMaxChange).toHaveBeenCalledWith(undefined);
    });
  });
});