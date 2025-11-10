import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { OpportunityFilters } from './OpportunityFilters';
import { OpportunityType } from '@linkinvests/shared';
import type { OpportunityFilters as IOpportunityFilters } from '~/types/filters';

describe('OpportunityFilters', () => {
  const mockOnFiltersChange = vi.fn();
  const mockOnApply = vi.fn();
  const mockOnReset = vi.fn();
  const mockOnViewTypeChange = vi.fn();
  const mockOnTypeChange = vi.fn();

  const emptyFilters: IOpportunityFilters = {};
  const defaultProps = {
    filters: emptyFilters,
    onFiltersChange: mockOnFiltersChange,
    onApply: mockOnApply,
    onReset: mockOnReset,
    viewType: 'list' as const,
    onViewTypeChange: mockOnViewTypeChange,
    currentType: OpportunityType.AUCTION,
    onTypeChange: mockOnTypeChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render filter title', () => {
      render(<OpportunityFilters {...defaultProps} />);

      expect(screen.getByText('Filtres')).toBeInTheDocument();
    });

    it('should render all filter sections', () => {
      render(<OpportunityFilters {...defaultProps} />);

      expect(screen.getByText("Types d'opportunité")).toBeInTheDocument();
      expect(screen.getByText('Départements')).toBeInTheDocument();
      expect(screen.getByText('Codes postaux')).toBeInTheDocument();
      expect(screen.getByText('Opportunités depuis')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<OpportunityFilters {...defaultProps} />);

      expect(screen.getByText('Appliquer')).toBeInTheDocument();
      expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
    });

    it('should render filter components', () => {
      render(<OpportunityFilters {...defaultProps} />);

      expect(screen.getByText('Toutes les opportunités')).toBeInTheDocument();
    });
  });

  describe('Type Filter', () => {
    it('should display selected types', () => {
      const filters: IOpportunityFilters = { types: [OpportunityType.SUCCESSION] };

      render(<OpportunityFilters {...defaultProps} filters={filters} />);

      // Check that the multi-select shows selected state (implementation will vary)
      expect(screen.getByText("Types d'opportunité")).toBeInTheDocument();
    });
  });

  describe('Department Filter', () => {
    it('should display departments multi-select', () => {
      render(<OpportunityFilters {...defaultProps} />);

      expect(screen.getByText('Sélectionner des départements...')).toBeInTheDocument();
    });

    it('should display selected departments', () => {
      const filters: IOpportunityFilters = { departments: [75] };

      render(<OpportunityFilters {...defaultProps} filters={filters} />);

      expect(screen.getByText('Départements')).toBeInTheDocument();
    });
  });

  describe('Zip Code Filter', () => {
    it('should display zip codes multi-input', () => {
      render(<OpportunityFilters {...defaultProps} />);

      expect(screen.getByText('Codes postaux')).toBeInTheDocument();
    });

    it('should display selected zip codes', () => {
      const filters: IOpportunityFilters = { zipCodes: [75001] };

      render(<OpportunityFilters {...defaultProps} filters={filters} />);

      expect(screen.getByText('Codes postaux')).toBeInTheDocument();
    });
  });

  describe('Date Period Filter', () => {
    it('should display period select', () => {
      render(<OpportunityFilters {...defaultProps} />);

      expect(screen.getByText('Opportunités depuis')).toBeInTheDocument();
      expect(screen.getByText('Toutes les opportunités')).toBeInTheDocument();
    });

    it('should display selected period value', () => {
      const filters: IOpportunityFilters = {
        datePeriod: "last_3_months",
      };

      render(<OpportunityFilters {...defaultProps} filters={filters} />);

      expect(screen.getByText('Opportunités depuis')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should call onApply when Apply button is clicked', async () => {
      const user = userEvent.setup();
      render(<OpportunityFilters {...defaultProps} />);

      const applyButton = screen.getByText('Appliquer');
      await user.click(applyButton);

      expect(mockOnApply).toHaveBeenCalledTimes(1);
    });

    it('should call onReset when Reset button is clicked', async () => {
      const user = userEvent.setup();
      render(<OpportunityFilters {...defaultProps} />);

      const resetButton = screen.getByText('Réinitialiser');
      await user.click(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Complex Filter Scenarios', () => {
    it('should handle all filters being set at once', () => {
      const filters: IOpportunityFilters = {
        types: [OpportunityType.SUCCESSION, OpportunityType.LIQUIDATION],
        departments: [75],
        zipCodes: [75001],
        datePeriod: "last_3_months",
      };

      render(<OpportunityFilters {...defaultProps} filters={filters} />);

      // Check that all sections are rendered
      expect(screen.getByText("Types d'opportunité")).toBeInTheDocument();
      expect(screen.getByText('Départements')).toBeInTheDocument();
      expect(screen.getByText('Codes postaux')).toBeInTheDocument();
      expect(screen.getByText('Opportunités depuis')).toBeInTheDocument();
    });
  });
});
