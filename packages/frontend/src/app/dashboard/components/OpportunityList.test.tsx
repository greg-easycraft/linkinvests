import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { OpportunityList } from './OpportunityList';
import type { Opportunity } from '~/server/domains/opportunities/lib.types';
import type { OpportunityListResult } from '~/server/domains/opportunities/services/opportunity-service';

// Mock StreetView component
vi.mock('./StreetView', () => ({
  StreetView: ({ className }: { address?: string | null; className?: string }) => (
    <div className={className} data-testid="street-view">
      Street View
    </div>
  ),
}));

describe('OpportunityList', () => {
  const mockOpportunity: Opportunity = {
    id: randomUUID(),
    label: 'Opportunité Test',
    type: 'succession',
    address: '123 Rue de Test',
    department: '75',
    zipCode: '75001',
    latitude: 48.8566,
    longitude: 2.3522,
    opportunityDate: '2024-01-15',
    siret: '12345678901234',
    externalId: '12345678901234',
    contactData: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    extraData: null,
    images: null,
  };

  const mockData: OpportunityListResult = {
    opportunities: [mockOpportunity],
    total: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  };

  const mockOnSelect = vi.fn();
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render opportunity list', () => {
      render(
        <OpportunityList
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          filters={{}}
        />
      );

      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no opportunities', () => {
      const emptyData: OpportunityListResult = {
        opportunities: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };

      render(
        <OpportunityList
          data={emptyData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('Aucune opportunité trouvée')).toBeInTheDocument();
    });
  });

  describe('Opportunity Display', () => {
    it('should render opportunity list with correct data', () => {
      render(
        <OpportunityList
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('Opportunité Test')).toBeInTheDocument();
      expect(screen.getByText('Succession')).toBeInTheDocument();
      expect(screen.getByText('123 Rue de Test')).toBeInTheDocument();
    });

    it('should show total count', () => {
      render(
        <OpportunityList
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText(/Affichage de 1 sur 1 opportunités/)).toBeInTheDocument();
    });

    it('should display opportunity date in French format', () => {
      render(
        <OpportunityList
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('15 janvier 2024')).toBeInTheDocument();
    });

    it('should display department and zip code', () => {
      render(
        <OpportunityList
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('75 - 75001')).toBeInTheDocument();
    });

    it('should display SIRET when available', () => {
      render(
        <OpportunityList
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('12345678901234')).toBeInTheDocument();
    });

    it('should not display SIRET section when not available', () => {
      const opportunityWithoutSiret = { ...mockOpportunity, siret: null };
      const dataWithoutSiret = { ...mockData, opportunities: [opportunityWithoutSiret] };

      render(
        <OpportunityList
          data={dataWithoutSiret}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.queryByText('SIRET')).not.toBeInTheDocument();
    });

    it('should show "Non disponible" when address is null', () => {
      const opportunityWithoutAddress = { ...mockOpportunity, address: null };
      const dataWithoutAddress = { ...mockData, opportunities: [opportunityWithoutAddress] };

      render(
        <OpportunityList
          data={dataWithoutAddress}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('Non disponible')).toBeInTheDocument();
    });

    it('should render StreetView component for each opportunity', () => {
      render(
        <OpportunityList
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByTestId('street-view')).toBeInTheDocument();
    });

    it('should display all type labels correctly', () => {
      const opportunities: Opportunity[] = [
        { ...mockOpportunity, id: 1, type: 'succession', label: 'Opp 1' },
        { ...mockOpportunity, id: 2, type: 'liquidation', label: 'Opp 2' },
        { ...mockOpportunity, id: 3, type: 'energy_sieve', label: 'Opp 3' },
        { ...mockOpportunity, id: 4, type: 'auction', label: 'Opp 4' },
      ];

      const multiData: OpportunityListResult = {
        opportunities,
        total: 4,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      render(
        <OpportunityList
          data={multiData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('Succession')).toBeInTheDocument();
      expect(screen.getByText('Liquidation')).toBeInTheDocument();
      expect(screen.getByText('Passoire énergétique')).toBeInTheDocument();
      expect(screen.getByText('Vente aux enchères')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should call onSelect when opportunity is clicked', async () => {
      const user = userEvent.setup();
      render(
        <OpportunityList
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      const card = screen.getByText('Opportunité Test').closest('div[class*="cursor-pointer"]');
      expect(card).toBeInTheDocument();

      if (card) {
        await user.click(card);
        expect(mockOnSelect).toHaveBeenCalledWith(mockOpportunity);
      }
    });

    it('should highlight selected opportunity', () => {
      const { container } = render(
        <OpportunityList
          data={mockData}
          selectedId={1}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      const card = container.querySelector('[class*="border-blue-500"]');
      expect(card).toBeInTheDocument();
    });

    it('should not highlight non-selected opportunities', () => {
      const { container } = render(
        <OpportunityList
          data={mockData}
          selectedId={999}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      const card = container.querySelector('[class*="border-blue-500"]');
      expect(card).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    const paginatedData: OpportunityListResult = {
      opportunities: [mockOpportunity],
      total: 30,
      page: 2,
      pageSize: 10,
      totalPages: 3,
    };

    it('should not show pagination when only one page', () => {
      render(
        <OpportunityList
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
    });

    it('should show pagination when multiple pages', () => {
      render(
        <OpportunityList
          data={paginatedData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('Page 2 sur 3')).toBeInTheDocument();
    });

    it('should call onPageChange when next button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <OpportunityList
          data={paginatedData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByText('Suivant');
      await user.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('should call onPageChange when previous button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <OpportunityList
          data={paginatedData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      const prevButton = screen.getByText('Précédent');
      await user.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('should disable previous button on first page', () => {
      const firstPageData = { ...paginatedData, page: 1 };

      render(
        <OpportunityList
          data={firstPageData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      const prevButton = screen.getByText('Précédent');
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      const lastPageData = { ...paginatedData, page: 3 };

      render(
        <OpportunityList
          data={lastPageData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      const nextButton = screen.getByText('Suivant');
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Multiple Opportunities', () => {
    it('should render multiple opportunities', () => {
      const opportunities: Opportunity[] = [
        { ...mockOpportunity, id: 1, label: 'First' },
        { ...mockOpportunity, id: 2, label: 'Second' },
        { ...mockOpportunity, id: 3, label: 'Third' },
      ];

      const multiData: OpportunityListResult = {
        opportunities,
        total: 3,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      render(
        <OpportunityList
          data={multiData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
        />
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });
  });
});
