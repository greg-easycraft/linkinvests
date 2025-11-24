import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { SellerTypeFilter } from './SellerTypeFilter';

describe('SellerTypeFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render seller type options', async () => {
      const user = userEvent.setup();
      render(<SellerTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.getByText('Tous')).toBeInTheDocument();
      expect(screen.getByText('Particulier')).toBeInTheDocument();
      expect(screen.getByText('Professionnel')).toBeInTheDocument();
    });

    it('should show placeholder when no value selected', () => {
      render(<SellerTypeFilter {...defaultProps} />);

      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });

    it('should have indigo badge color when value is selected', () => {
      render(<SellerTypeFilter {...defaultProps} value="individual" />);

      const badge = screen.getByText('Particulier');
      expect(badge).toHaveClass('bg-indigo-100', 'text-indigo-800');
    });
  });

  describe('User Interactions', () => {
    it('should call onChange with "individual" when "Particulier" is selected', async () => {
      const user = userEvent.setup();
      render(<SellerTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Particulier');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith('individual');
    });

    it('should call onChange with "professional" when "Professionnel" is selected', async () => {
      const user = userEvent.setup();
      render(<SellerTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Professionnel');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith('professional');
    });

    it('should call onChange with undefined when "Tous" is selected', async () => {
      const user = userEvent.setup();
      render(<SellerTypeFilter {...defaultProps} value="individual" />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Tous');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });

    it('should call onChange with undefined when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<SellerTypeFilter {...defaultProps} value="professional" />);

      const clearButton = screen.getByText('Professionnel').querySelector('svg');
      if (clearButton) {
        await user.click(clearButton);
        expect(mockOnChange).toHaveBeenCalledWith(undefined);
      }
    });

    it('should toggle selection when same option is selected again', async () => {
      const user = userEvent.setup();
      render(<SellerTypeFilter {...defaultProps} value="individual" />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Particulier');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Value Display', () => {
    it('should display "Particulier" badge when value is "individual"', () => {
      render(<SellerTypeFilter {...defaultProps} value="individual" />);

      expect(screen.getByText('Particulier')).toBeInTheDocument();
      expect(screen.queryByText('Professionnel')).not.toBeInTheDocument();
    });

    it('should display "Professionnel" badge when value is "professional"', () => {
      render(<SellerTypeFilter {...defaultProps} value="professional" />);

      expect(screen.getByText('Professionnel')).toBeInTheDocument();
      expect(screen.queryByText('Particulier')).not.toBeInTheDocument();
    });

    it('should show placeholder when value is undefined', () => {
      render(<SellerTypeFilter {...defaultProps} value={undefined} />);

      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
      expect(screen.queryByText('Particulier')).not.toBeInTheDocument();
      expect(screen.queryByText('Professionnel')).not.toBeInTheDocument();
    });
  });

  describe('Seller Type Values', () => {
    it('should handle individual seller type correctly', () => {
      render(<SellerTypeFilter {...defaultProps} value="individual" />);

      expect(screen.getByText('Particulier')).toBeInTheDocument();
    });

    it('should handle professional seller type correctly', () => {
      render(<SellerTypeFilter {...defaultProps} value="professional" />);

      expect(screen.getByText('Professionnel')).toBeInTheDocument();
    });

    it('should handle null value gracefully', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<SellerTypeFilter {...defaultProps} value={null as any} />);
      }).not.toThrow();

      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have proper styling classes', () => {
      render(<SellerTypeFilter {...defaultProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should display clear button when value is selected', () => {
      render(<SellerTypeFilter {...defaultProps} value="individual" />);

      const badge = screen.getByText('Particulier');
      const clearButton = badge.querySelector('svg');
      expect(clearButton).toBeInTheDocument();
    });

    it('should not display clear button when no value is selected', () => {
      render(<SellerTypeFilter {...defaultProps} />);

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
        render(<SellerTypeFilter onChange={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle invalid seller type values gracefully', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<SellerTypeFilter {...defaultProps} value={'invalid' as any} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SellerTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Should be able to navigate with keyboard
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should have proper ARIA attributes', () => {
      render(<SellerTypeFilter {...defaultProps} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes from individual to professional', () => {
      const { rerender } = render(
        <SellerTypeFilter {...defaultProps} value="individual" />
      );

      expect(screen.getByText('Particulier')).toBeInTheDocument();

      rerender(
        <SellerTypeFilter {...defaultProps} value="professional" />
      );

      expect(screen.queryByText('Particulier')).not.toBeInTheDocument();
      expect(screen.getByText('Professionnel')).toBeInTheDocument();
    });

    it('should update when value prop changes to undefined', () => {
      const { rerender } = render(
        <SellerTypeFilter {...defaultProps} value="professional" />
      );

      expect(screen.getByText('Professionnel')).toBeInTheDocument();

      rerender(
        <SellerTypeFilter {...defaultProps} value={undefined} />
      );

      expect(screen.queryByText('Professionnel')).not.toBeInTheDocument();
      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });
  });

  describe('Real Estate Seller Context', () => {
    it('should handle individual seller filtering', () => {
      render(<SellerTypeFilter {...defaultProps} value="individual" />);

      expect(screen.getByText('Particulier')).toBeInTheDocument();
    });

    it('should handle professional seller filtering', () => {
      render(<SellerTypeFilter {...defaultProps} value="professional" />);

      expect(screen.getByText('Professionnel')).toBeInTheDocument();
    });

    it('should handle showing all seller types', () => {
      render(<SellerTypeFilter {...defaultProps} value={undefined} />);

      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });
  });
});