import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { AuctionTypeFilter } from './AuctionTypeFilter';

describe('AuctionTypeFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render auction type options', async () => {
      const user = userEvent.setup();
      render(<AuctionTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.getByText('Judiciaire')).toBeInTheDocument();
      expect(screen.getByText('Volontaire')).toBeInTheDocument();
      expect(screen.getByText('Notariale')).toBeInTheDocument();
      expect(screen.getByText('Domaniale')).toBeInTheDocument();
    });

    it('should have blue badge color', () => {
      const value = ['judicial'];
      render(<AuctionTypeFilter {...defaultProps} value={value} />);

      const badge = screen.getByText('Judiciaire');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when option is selected', async () => {
      const user = userEvent.setup();
      render(<AuctionTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Judiciaire');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(['judicial']);
    });

    it('should handle multiple selections', async () => {
      const user = userEvent.setup();
      const value = ['judicial'];
      render(<AuctionTypeFilter {...defaultProps} value={value} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Notariale');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(['judicial', 'notarial']);
    });

    it('should call onChange with undefined when last item is deselected', async () => {
      const user = userEvent.setup();
      const value = ['judicial'];
      render(<AuctionTypeFilter {...defaultProps} value={value} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Judiciaire');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Value Display', () => {
    it('should display selected auction types', () => {
      const value = ['judicial', 'voluntary'];
      render(<AuctionTypeFilter {...defaultProps} value={value} />);

      expect(screen.getByText('Judiciaire')).toBeInTheDocument();
      expect(screen.getByText('Volontaire')).toBeInTheDocument();
    });

    it('should handle empty selection', () => {
      render(<AuctionTypeFilter {...defaultProps} />);

      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid value prop', () => {
      expect(() => {
        render(<AuctionTypeFilter {...defaultProps} value={null as any} />);
      }).not.toThrow();
    });

    it('should handle missing onChange prop', () => {
      expect(() => {
        render(<AuctionTypeFilter onChange={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <AuctionTypeFilter {...defaultProps} value={['judicial']} />
      );

      expect(screen.getByText('Judiciaire')).toBeInTheDocument();

      rerender(
        <AuctionTypeFilter {...defaultProps} value={['voluntary']} />
      );

      expect(screen.queryByText('Judiciaire')).not.toBeInTheDocument();
      expect(screen.getByText('Volontaire')).toBeInTheDocument();
    });
  });
});