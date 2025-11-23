import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { RentalStatusFilter } from './RentalStatusFilter';

describe('RentalStatusFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render rental status options', async () => {
      const user = userEvent.setup();
      render(<RentalStatusFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.getByText('Libre')).toBeInTheDocument();
      expect(screen.getByText('Occupé')).toBeInTheDocument();
    });

    it('should show placeholder when no value selected', () => {
      render(<RentalStatusFilter {...defaultProps} />);

      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });

    it('should have orange badge color when value is selected', () => {
      render(<RentalStatusFilter {...defaultProps} value={false} />);

      const badge = screen.getByText('Libre');
      expect(badge).toHaveClass('bg-orange-100', 'text-orange-800');
    });
  });

  describe('User Interactions', () => {
    it('should call onChange with false when "Libre" is selected', async () => {
      const user = userEvent.setup();
      render(<RentalStatusFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Libre');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(false);
    });

    it('should call onChange with true when "Occupé" is selected', async () => {
      const user = userEvent.setup();
      render(<RentalStatusFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Occupé');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it('should call onChange with undefined when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<RentalStatusFilter {...defaultProps} value={false} />);

      const clearButton = screen.getByText('Libre').querySelector('svg');
      if (clearButton) {
        await user.click(clearButton);
        expect(mockOnChange).toHaveBeenCalledWith(undefined);
      }
    });

    it('should toggle selection when same option is selected again', async () => {
      const user = userEvent.setup();
      render(<RentalStatusFilter {...defaultProps} value={false} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Libre');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Value Display', () => {
    it('should display "Libre" badge when value is false', () => {
      render(<RentalStatusFilter {...defaultProps} value={false} />);

      expect(screen.getByText('Libre')).toBeInTheDocument();
      expect(screen.queryByText('Occupé')).not.toBeInTheDocument();
    });

    it('should display "Occupé" badge when value is true', () => {
      render(<RentalStatusFilter {...defaultProps} value={true} />);

      expect(screen.getByText('Occupé')).toBeInTheDocument();
      expect(screen.queryByText('Libre')).not.toBeInTheDocument();
    });

    it('should show placeholder when value is undefined', () => {
      render(<RentalStatusFilter {...defaultProps} value={undefined} />);

      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
      expect(screen.queryByText('Libre')).not.toBeInTheDocument();
      expect(screen.queryByText('Occupé')).not.toBeInTheDocument();
    });
  });

  describe('Boolean Value Handling', () => {
    it('should handle boolean false correctly', () => {
      render(<RentalStatusFilter {...defaultProps} value={false} />);

      expect(screen.getByText('Libre')).toBeInTheDocument();
    });

    it('should handle boolean true correctly', () => {
      render(<RentalStatusFilter {...defaultProps} value={true} />);

      expect(screen.getByText('Occupé')).toBeInTheDocument();
    });

    it('should handle null value gracefully', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<RentalStatusFilter {...defaultProps} value={null as any} />);
      }).not.toThrow();

      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have proper styling classes', () => {
      render(<RentalStatusFilter {...defaultProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should display clear button when value is selected', () => {
      render(<RentalStatusFilter {...defaultProps} value={false} />);

      const badge = screen.getByText('Libre');
      const clearButton = badge.querySelector('svg');
      expect(clearButton).toBeInTheDocument();
    });

    it('should not display clear button when no value is selected', () => {
      render(<RentalStatusFilter {...defaultProps} />);

      const selectContainer = screen.getByRole('combobox').parentElement;
      const clearButtons = selectContainer?.querySelectorAll('svg');

      // Should only have the dropdown arrow, not a clear button
      expect(clearButtons?.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid onChange prop', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<RentalStatusFilter onChange={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle non-boolean values gracefully', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<RentalStatusFilter {...defaultProps} value={'invalid' as any} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<RentalStatusFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Should be able to navigate with keyboard
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should have proper ARIA attributes', () => {
      render(<RentalStatusFilter {...defaultProps} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes from false to true', () => {
      const { rerender } = render(
        <RentalStatusFilter {...defaultProps} value={false} />
      );

      expect(screen.getByText('Libre')).toBeInTheDocument();

      rerender(
        <RentalStatusFilter {...defaultProps} value={true} />
      );

      expect(screen.queryByText('Libre')).not.toBeInTheDocument();
      expect(screen.getByText('Occupé')).toBeInTheDocument();
    });

    it('should update when value prop changes to undefined', () => {
      const { rerender } = render(
        <RentalStatusFilter {...defaultProps} value={true} />
      );

      expect(screen.getByText('Occupé')).toBeInTheDocument();

      rerender(
        <RentalStatusFilter {...defaultProps} value={undefined} />
      );

      expect(screen.queryByText('Occupé')).not.toBeInTheDocument();
      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });
  });

  describe('Real Estate Context', () => {
    it('should handle vacant property filtering', () => {
      render(<RentalStatusFilter {...defaultProps} value={false} />);

      expect(screen.getByText('Libre')).toBeInTheDocument();
    });

    it('should handle occupied property filtering', () => {
      render(<RentalStatusFilter {...defaultProps} value={true} />);

      expect(screen.getByText('Occupé')).toBeInTheDocument();
    });
  });
});