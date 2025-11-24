import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { RoomsRangeFilter } from './RoomsRangeFilter';

describe('RoomsRangeFilter', () => {
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
      render(<RoomsRangeFilter {...defaultProps} />);

      expect(screen.getByText('Nombre de pièces')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<RoomsRangeFilter {...defaultProps} label="Custom Rooms" />);

      expect(screen.getByText('Custom Rooms')).toBeInTheDocument();
    });

    it('should render min and max inputs with default placeholders', () => {
      render(<RoomsRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('should display provided min rooms', () => {
      render(<RoomsRangeFilter {...defaultProps} minValue={2} />);

      const minInput = screen.getByPlaceholderText('Min');
      expect(minInput).toHaveValue(2);
    });

    it('should display provided max rooms', () => {
      render(<RoomsRangeFilter {...defaultProps} maxValue={5} />);

      const maxInput = screen.getByPlaceholderText('Max');
      expect(maxInput).toHaveValue(5);
    });

    it('should display both min and max room values', () => {
      render(<RoomsRangeFilter {...defaultProps} minValue={2} maxValue={5} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(2);
      expect(maxInput).toHaveValue(5);
    });
  });

  describe('Interaction', () => {
    it('should call onMinChange when min input changes', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '3');

      expect(mockOnMinChange).toHaveBeenCalledWith(3);
    });

    it('should call onMaxChange when max input changes', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '6');

      expect(mockOnMaxChange).toHaveBeenCalledWith(6);
    });

    it('should call onMinChange with undefined when min input is cleared', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} minValue={2} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.clear(minInput);

      expect(mockOnMinChange).toHaveBeenCalledWith(undefined);
    });

    it('should call onMaxChange with undefined when max input is cleared', async () => {
      const user = userEvent.setup();
      render(<RoomsRangeFilter {...defaultProps} maxValue={5} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.clear(maxInput);

      expect(mockOnMaxChange).toHaveBeenCalledWith(undefined);
    });
  });
});