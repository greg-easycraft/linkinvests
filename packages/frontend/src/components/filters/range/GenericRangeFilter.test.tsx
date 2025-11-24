import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { GenericRangeFilter } from './GenericRangeFilter';

describe('GenericRangeFilter', () => {
  const mockOnMinChange = jest.fn();
  const mockOnMaxChange = jest.fn();
  const defaultProps = {
    label: 'Test Range',
    onMinChange: mockOnMinChange,
    onMaxChange: mockOnMaxChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with label', () => {
      render(<GenericRangeFilter {...defaultProps} />);

      expect(screen.getByText('Test Range')).toBeInTheDocument();
    });

    it('should render with unit in label', () => {
      render(<GenericRangeFilter {...defaultProps} unit="€" />);

      expect(screen.getByText('Test Range')).toBeInTheDocument();
      expect(screen.getByText('(€)')).toBeInTheDocument();
    });

    it('should render min and max inputs with default placeholders', () => {
      render(<GenericRangeFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('should display provided min value', () => {
      render(<GenericRangeFilter {...defaultProps} minValue={100} />);

      const minInput = screen.getByPlaceholderText('Min');
      expect(minInput).toHaveValue(100);
    });

    it('should display provided max value', () => {
      render(<GenericRangeFilter {...defaultProps} maxValue={500} />);

      const maxInput = screen.getByPlaceholderText('Max');
      expect(maxInput).toHaveValue(500);
    });

    it('should display both min and max values', () => {
      render(<GenericRangeFilter {...defaultProps} minValue={100} maxValue={500} />);

      const minInput = screen.getByPlaceholderText('Min');
      const maxInput = screen.getByPlaceholderText('Max');

      expect(minInput).toHaveValue(100);
      expect(maxInput).toHaveValue(500);
    });
  });

  describe('Interaction', () => {
    it('should call onMinChange when min input changes', async () => {
      const user = userEvent.setup();
      render(<GenericRangeFilter {...defaultProps} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.type(minInput, '1');

      expect(mockOnMinChange).toHaveBeenCalledWith(1);
    });

    it('should call onMaxChange when max input changes', async () => {
      const user = userEvent.setup();
      render(<GenericRangeFilter {...defaultProps} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.type(maxInput, '5');

      expect(mockOnMaxChange).toHaveBeenCalledWith(5);
    });

    it('should call onMinChange with undefined when min input is cleared', async () => {
      const user = userEvent.setup();
      render(<GenericRangeFilter {...defaultProps} minValue={100} />);

      const minInput = screen.getByPlaceholderText('Min');
      await user.clear(minInput);

      expect(mockOnMinChange).toHaveBeenCalledWith(undefined);
    });

    it('should call onMaxChange with undefined when max input is cleared', async () => {
      const user = userEvent.setup();
      render(<GenericRangeFilter {...defaultProps} maxValue={500} />);

      const maxInput = screen.getByPlaceholderText('Max');
      await user.clear(maxInput);

      expect(mockOnMaxChange).toHaveBeenCalledWith(undefined);
    });
  });
});