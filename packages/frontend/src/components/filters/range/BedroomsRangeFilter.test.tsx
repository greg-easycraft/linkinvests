import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { BedroomsRangeFilter } from './BedroomsRangeFilter';

describe('BedroomsRangeFilter', () => {
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
      render(<BedroomsRangeFilter {...defaultProps} />);

      expect(screen.getByText('Nombre de chambres')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<BedroomsRangeFilter {...defaultProps} label="Custom Bedrooms" />);

      expect(screen.getByText('Custom Bedrooms')).toBeInTheDocument();
    });

    it('should render min and max inputs with default placeholders', () => {
      render(<BedroomsRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('should display provided min bedrooms', () => {
      render(<BedroomsRangeFilter {...defaultProps} minValue={1} />);

      const minInput = screen.getByPlaceholderText('Min');
      expect(minInput).toHaveValue(1);
    });

    it('should display provided max bedrooms', () => {
      render(<BedroomsRangeFilter {...defaultProps} maxValue={4} />);

      const maxInput = screen.getByPlaceholderText('Max');
      expect(maxInput).toHaveValue(4);
    });

    it('should display both min and max bedroom values', () => {
      render(<BedroomsRangeFilter {...defaultProps} minValue={2} maxValue={5} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(2);
      expect(maxInput).toHaveValue(5);
    });
  });

  describe('Interaction', () => {
    it('should call onMinChange when min input changes', async () => {
      const user = userEvent.setup();
      render(<BedroomsRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '2');

      expect(mockOnMinChange).toHaveBeenCalledWith(2);
    });

    it('should call onMaxChange when max input changes', async () => {
      const user = userEvent.setup();
      render(<BedroomsRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '3');

      expect(mockOnMaxChange).toHaveBeenCalledWith(3);
    });

    it('should call onMinChange with undefined when min input is cleared', async () => {
      const user = userEvent.setup();
      render(<BedroomsRangeFilter {...defaultProps} minValue={2} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.clear(minInput);

      expect(mockOnMinChange).toHaveBeenCalledWith(undefined);
    });

    it('should call onMaxChange with undefined when max input is cleared', async () => {
      const user = userEvent.setup();
      render(<BedroomsRangeFilter {...defaultProps} maxValue={4} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.clear(maxInput);

      expect(mockOnMaxChange).toHaveBeenCalledWith(undefined);
    });
  });
});