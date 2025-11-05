import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { OpportunityFilters } from './OpportunityFilters';
import { OpportunityType } from '@linkinvests/shared';
import type { OpportunityFilters as IOpportunityFilters } from '~/types/filters';

describe('OpportunityFilters', () => {
  const mockOnFiltersChange = vi.fn();
  const mockOnApply = vi.fn();
  const mockOnReset = vi.fn();

  const emptyFilters: IOpportunityFilters = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render filter title', () => {
      render(
        <OpportunityFilters
          filters={emptyFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Filtres')).toBeInTheDocument();
    });

    it('should render all filter sections', () => {
      render(
        <OpportunityFilters
          filters={emptyFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Département')).toBeInTheDocument();
      expect(screen.getByText('Code postal')).toBeInTheDocument();
      expect(screen.getByText('Date après le')).toBeInTheDocument();
      expect(screen.getByText('Date avant le')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <OpportunityFilters
          filters={emptyFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Appliquer')).toBeInTheDocument();
      expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
    });

    it('should render all opportunity type buttons', () => {
      render(
        <OpportunityFilters
          filters={emptyFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Succession')).toBeInTheDocument();
      expect(screen.getByText('Liquidation')).toBeInTheDocument();
      expect(screen.getByText('Passoire énergétique')).toBeInTheDocument();
      expect(screen.getByText('Annonce immobilière')).toBeInTheDocument();
      expect(screen.getByText('Vente aux enchères')).toBeInTheDocument();
      expect(screen.getByText('Divorce')).toBeInTheDocument();
    });
  });

  describe('Type Filter', () => {
    it('should call onFiltersChange when type button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <OpportunityFilters
          filters={emptyFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const successionButton = screen.getByText('Succession');
      await user.click(successionButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        types: [OpportunityType.SUCCESSION],
      });
    });

    it('should add multiple types when clicking multiple buttons', async () => {
      const user = userEvent.setup();
      const filters: IOpportunityFilters = { types: [OpportunityType.SUCCESSION] };

      render(
        <OpportunityFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const liquidationButton = screen.getByText('Liquidation');
      await user.click(liquidationButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        types: [OpportunityType.SUCCESSION, OpportunityType.LIQUIDATION],
      });
    });

    it('should remove type when clicking selected button', async () => {
      const user = userEvent.setup();
      const filters: IOpportunityFilters = {
        types: [OpportunityType.SUCCESSION, OpportunityType.LIQUIDATION],
      };

      render(
        <OpportunityFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const successionButton = screen.getByText('Succession');
      await user.click(successionButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        types: [OpportunityType.LIQUIDATION],
      });
    });

    it('should show selected types with default variant', () => {
      const filters: IOpportunityFilters = { types: [OpportunityType.SUCCESSION] };

      render(
        <OpportunityFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const successionButton = screen.getByText('Succession');
      // The selected button should have bg-[var(--primary)] class from default variant
      expect(successionButton.className).toContain('bg-');
    });
  });

  describe('Department Filter', () => {
    it('should call onFiltersChange when department input changes', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <OpportunityFilters
          filters={emptyFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText('Numéro de département');
      await user.clear(input);
      await user.type(input, '7');

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should display current department value', () => {
      const filters: IOpportunityFilters = { department: 75 };

      render(
        <OpportunityFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText('Numéro de département') as HTMLInputElement;
      expect(input.value).toBe('75');
    });

    it('should clear department when input is emptied', async () => {
      const user = userEvent.setup();
      const filters: IOpportunityFilters = { department: 75 };

      render(
        <OpportunityFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText('Numéro de département');
      await user.clear(input);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        department: undefined,
      });
    });
  });

  describe('Zip Code Filter', () => {
    it('should call onFiltersChange when zip code input changes', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <OpportunityFilters
          filters={emptyFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText('Code postal');
      await user.clear(input);
      await user.type(input, '7');

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should display current zip code value', () => {
      const filters: IOpportunityFilters = { zipCode: 75001 };

      render(
        <OpportunityFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const input = screen.getByPlaceholderText('Code postal') as HTMLInputElement;
      expect(input.value).toBe('75001');
    });
  });

  describe('Date Range Filter', () => {
    it('should display date inputs', () => {
      const { container } = render(
        <OpportunityFilters
          filters={emptyFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const inputs = container.querySelectorAll('input[type="date"]');
      expect(inputs).toHaveLength(2);
    });

    it('should display current date range values', () => {
      const filters: IOpportunityFilters = {
        dateRange: {
          from: new Date('2024-01-01'),
          to: new Date('2024-12-31'),
        },
      };

      const { container } = render(
        <OpportunityFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const inputs = container.querySelectorAll('input[type="date"]') as NodeListOf<HTMLInputElement>;
      expect(inputs[0]?.value).toBe('2024-01-01');
      expect(inputs[1]?.value).toBe('2024-12-31');
    });
  });

  describe('Action Buttons', () => {
    it('should call onApply when Apply button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <OpportunityFilters
          filters={emptyFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const applyButton = screen.getByText('Appliquer');
      await user.click(applyButton);

      expect(mockOnApply).toHaveBeenCalledTimes(1);
    });

    it('should call onReset when Reset button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <OpportunityFilters
          filters={emptyFilters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const resetButton = screen.getByText('Réinitialiser');
      await user.click(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Complex Filter Scenarios', () => {
    it('should handle all filters being set at once', () => {
      const filters: IOpportunityFilters = {
        types: [OpportunityType.SUCCESSION, OpportunityType.LIQUIDATION],
        department: 75,
        zipCode: 75001,
        dateRange: {
          from: new Date('2024-01-01'),
          to: new Date('2024-12-31'),
        },
      };

      render(
        <OpportunityFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      // Check that all values are displayed correctly
      expect(screen.getByPlaceholderText('Numéro de département')).toHaveValue(75);
      expect(screen.getByPlaceholderText('Code postal')).toHaveValue(75001);
    });

    it('should preserve existing filters when adding new ones', async () => {
      const user = userEvent.setup({ delay: null });
      const filters: IOpportunityFilters = {
        types: [OpportunityType.SUCCESSION],
        department: 75,
      };

      render(
        <OpportunityFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          onApply={mockOnApply}
          onReset={mockOnReset}
        />
      );

      const zipCodeInput = screen.getByPlaceholderText('Code postal');
      await user.type(zipCodeInput, '1');

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalled();
        const lastCall = mockOnFiltersChange.mock.calls[mockOnFiltersChange.mock.calls.length - 1]?.[0];
        expect(lastCall.types).toEqual([OpportunityType.SUCCESSION]);
        expect(lastCall.department).toBe(75);
      }, { timeout: 3000 });
    });
  });
});
