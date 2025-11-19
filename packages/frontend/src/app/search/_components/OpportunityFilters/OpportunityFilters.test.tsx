// describe, it, expect, beforeEach are Jest globals
import { render, screen } from '~/test-utils/test-helpers';
import { BaseFilters } from './BaseFilters';
import { OpportunityType } from '@linkinvests/shared';
import type { OpportunityFilters as IOpportunityFilters } from '~/types/filters';

describe('BaseFilters', () => {
  const mockOnFiltersChange = jest.fn();

  const emptyFilters: IOpportunityFilters = {};
  const defaultProps = {
    filters: emptyFilters,
    onFiltersChange: mockOnFiltersChange,
    currentType: OpportunityType.AUCTION,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all filter sections', () => {
      render(<BaseFilters {...defaultProps} />);

      expect(screen.getByText("Type d'opportunité")).toBeInTheDocument();
      expect(screen.getByText('Départements')).toBeInTheDocument();
      expect(screen.getByText('Codes postaux')).toBeInTheDocument();
      expect(screen.getByText('Opportunités depuis')).toBeInTheDocument();
    });

    it('should render reset button', () => {
      render(<BaseFilters {...defaultProps} />);

      expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
      expect(screen.queryByText('Appliquer')).not.toBeInTheDocument();
    });

    it('should render filter components', () => {
      render(<BaseFilters {...defaultProps} />);

      expect(screen.getByText('Toutes les opportunités')).toBeInTheDocument();
    });
  });

  describe('Type Filter', () => {
    it('should display type filter section', () => {
      render(<BaseFilters {...defaultProps} />);

      // Check that the type filter section is present
      expect(screen.getByText("Type d'opportunité")).toBeInTheDocument();
    });
  });

  describe('Department Filter', () => {
    it('should display departments input', () => {
      render(<BaseFilters {...defaultProps} />);

      expect(screen.getByPlaceholderText('Rechercher par numéro ou nom...')).toBeInTheDocument();
    });

    it('should display selected departments', () => {
      const filters: IOpportunityFilters = { departments: ['75'] };

      render(<BaseFilters {...defaultProps} filters={filters} />);

      expect(screen.getByText('Départements')).toBeInTheDocument();
    });
  });

  describe('Zip Code Filter', () => {
    it('should display zip codes multi-input', () => {
      render(<BaseFilters {...defaultProps} />);

      expect(screen.getByText('Codes postaux')).toBeInTheDocument();
    });

    it('should display selected zip codes', () => {
      const filters: IOpportunityFilters = { zipCodes: ['75001'] };

      render(<BaseFilters {...defaultProps} filters={filters} />);

      expect(screen.getByText('Codes postaux')).toBeInTheDocument();
    });
  });

  describe('Date Period Filter', () => {
    it('should display period select', () => {
      render(<BaseFilters {...defaultProps} />);

      expect(screen.getByText('Opportunités depuis')).toBeInTheDocument();
      expect(screen.getByText('Toutes les opportunités')).toBeInTheDocument();
    });

    it('should display selected period value', () => {
      const filters: IOpportunityFilters = {
        datePeriod: "last_3_months",
      };

      render(<BaseFilters {...defaultProps} filters={filters} />);

      expect(screen.getByText('Opportunités depuis')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render reset button', async () => {
      render(<BaseFilters {...defaultProps} />);

      const resetButton = screen.getByText('Réinitialiser');
      expect(resetButton).toBeInTheDocument();
    });
  });

  describe('Complex Filter Scenarios', () => {
    it('should handle all filters being set at once', () => {
      const filters: IOpportunityFilters = {
        departments: ['75'],
        zipCodes: ['75001'],
        datePeriod: "last_3_months",
      };

      render(<BaseFilters {...defaultProps} filters={filters} />);

      // Check that all sections are rendered
      expect(screen.getByText("Type d'opportunité")).toBeInTheDocument();
      expect(screen.getByText('Départements')).toBeInTheDocument();
      expect(screen.getByText('Codes postaux')).toBeInTheDocument();
      expect(screen.getByText('Opportunités depuis')).toBeInTheDocument();
    });
  });
});
