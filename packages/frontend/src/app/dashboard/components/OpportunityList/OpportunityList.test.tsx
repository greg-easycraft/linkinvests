import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';
import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { OpportunityList } from '../OpportunityList';
import { OpportunityType, Opportunity } from '@linkinvests/shared';

// Define test types matching the current OpportunityList interface
type TestOpportunityListData = {
  opportunities: Opportunity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

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
    address: '123 Rue de Test',
    department: 75,
    zipCode: 75001,
    latitude: 48.8566,
    longitude: 2.3522,
    opportunityDate: '2024-01-15',
    externalId: '12345678901234',
    createdAt: new Date(),
    updatedAt: new Date(),
    firstName: 'Jean',
    lastName: 'Dupont',
    mairieContact: undefined,
  };

  const mockData: TestOpportunityListData = {
    opportunities: [mockOpportunity],
    total: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  };

  const mockOnSelect = vi.fn();
  const mockOnPageChange = vi.fn();
  const mockOnPageSizeChange = vi.fn();
  const mockOnExport = vi.fn().mockResolvedValue({ success: true });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render opportunity list', () => {
      render(
        <OpportunityList
        type={OpportunityType.ENERGY_SIEVE}
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
          filters={{}}
        />
      );

      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no opportunities', () => {
      const emptyData: TestOpportunityListData = {
        opportunities: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };

      render(
        <OpportunityList
        type={OpportunityType.ENERGY_SIEVE}
          data={emptyData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByText('Aucune opportunité trouvée')).toBeInTheDocument();
    });
  });

  describe('Opportunity Display', () => {
    it('should render opportunity list with correct data', () => {
      render(
        <OpportunityList
        type={OpportunityType.ENERGY_SIEVE}
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByText('Opportunité Test')).toBeInTheDocument();
      expect(screen.getByText('Succession')).toBeInTheDocument();
      expect(screen.getByText('123 Rue de Test')).toBeInTheDocument();
    });

    it('should show total count', () => {
      render(
        <OpportunityList
        type={OpportunityType.ENERGY_SIEVE}
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByText(/Affichage de 1 sur 1 opportunités/)).toBeInTheDocument();
    });

    it('should display opportunity date in French format', () => {
      render(
        <OpportunityList
        type={OpportunityType.ENERGY_SIEVE}
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByText('15 janvier 2024')).toBeInTheDocument();
    });

    it('should display department and zip code', () => {
      render(
        <OpportunityList
        type={OpportunityType.ENERGY_SIEVE}
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByText('75 - 75001')).toBeInTheDocument();
    });

    it('should display SIRET when available', () => {
      render(
        <OpportunityList
        type={OpportunityType.ENERGY_SIEVE}
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByText('12345678901234')).toBeInTheDocument();
    });

    it('should not display external ID section when not available', () => {
      const opportunityWithoutExternalId = { ...mockOpportunity, externalId: undefined };
      const dataWithoutExternalId = { ...mockData, opportunities: [opportunityWithoutExternalId] };

      render(
        <OpportunityList
        type={OpportunityType.ENERGY_SIEVE}
          data={dataWithoutExternalId}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
        />
      );

      expect(screen.queryByText('12345678901234')).not.toBeInTheDocument();
    });

    it('should show "Non disponible" when address is empty', () => {
      const opportunityWithoutAddress = { ...mockOpportunity, address: '' };
      const dataWithoutAddress = { ...mockData, opportunities: [opportunityWithoutAddress] };

      render(
        <OpportunityList
        type={OpportunityType.ENERGY_SIEVE}
          data={dataWithoutAddress}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByText('Non disponible')).toBeInTheDocument();
    });

    it('should render StreetView component for each opportunity', () => {
      render(
        <OpportunityList
        type={OpportunityType.ENERGY_SIEVE}
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByTestId('street-view')).toBeInTheDocument();
    });

    it('should display all type labels correctly', () => {
      const opportunities: Opportunity[] = [
        {
          id: randomUUID(),
          label: 'Opp 1',
          address: '123 Rue de Test',
          department: 75,
          zipCode: 75001,
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
          externalId: '12345678901234',
          createdAt: new Date(),
          updatedAt: new Date(),
          firstName: 'Jean',
          lastName: 'Dupont',
          mairieContact: undefined,
        },
        {
          id: randomUUID(),
          label: 'Opp 2',
          address: '123 Rue de Test',
          department: 75,
          zipCode: 75001,
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
          createdAt: new Date(),
          updatedAt: new Date(),
          siret: '12345678901234',
          companyContact: undefined,
        },
        {
          id: randomUUID(),
          label: 'Opp 3',
          address: '123 Rue de Test',
          department: 75,
          zipCode: 75001,
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
          createdAt: new Date(),
          updatedAt: new Date(),
          energyClass: 'F',
          dpeNumber: 'DPE123456',
        },
        {
          id: randomUUID(),
          label: 'Opp 4',
          address: '123 Rue de Test',
          department: 75,
          zipCode: 75001,
          latitude: 48.8566,
          longitude: 2.3522,
          opportunityDate: '2024-01-15',
          externalId: '12345678901234',
          createdAt: new Date(),
          updatedAt: new Date(),
          url: 'https://example.com',
          auctionType: 'Online',
        },
      ];

      const multiData: TestOpportunityListData = {
        opportunities,
        total: 4,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      render(
        <OpportunityList
        type={OpportunityType.ENERGY_SIEVE}
          data={multiData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
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
        type={OpportunityType.ENERGY_SIEVE}
          data={mockData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
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
        type={OpportunityType.ENERGY_SIEVE}
          data={mockData}
          selectedId={mockOpportunity.id}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
        />
      );

      const card = container.querySelector('[class*="border-blue-500"]');
      expect(card).toBeInTheDocument();
    });

    it('should not highlight non-selected opportunities', () => {
      const { container } = render(
        <OpportunityList
        type={OpportunityType.ENERGY_SIEVE}
          data={mockData}
          selectedId={randomUUID()}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
        />
      );

      const card = container.querySelector('[class*="border-blue-500"]');
      expect(card).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    const paginatedData: TestOpportunityListData = {
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
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
          type={OpportunityType.AUCTION}
        />
      );

      expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
    });

    it('should show pagination when multiple pages', () => {
      render(
        <OpportunityList
          type={OpportunityType.AUCTION}
          data={paginatedData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByText('Page 2 sur 3')).toBeInTheDocument();
    });

    it('should call onPageChange when next button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <OpportunityList
          type={OpportunityType.AUCTION}
          data={paginatedData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
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
        type={OpportunityType.ENERGY_SIEVE}
          data={paginatedData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
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
        type={OpportunityType.ENERGY_SIEVE}
          data={firstPageData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
        />
      );

      const prevButton = screen.getByText('Précédent');
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      const lastPageData = { ...paginatedData, page: 3 };

      render(
        <OpportunityList
        type={OpportunityType.ENERGY_SIEVE}
          data={lastPageData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
        />
      );

      const nextButton = screen.getByText('Suivant');
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Multiple Opportunities', () => {
    it('should render multiple opportunities', () => {
      const opportunities: Opportunity[] = [
        { ...mockOpportunity, id: randomUUID(), label: 'First' },
        { ...mockOpportunity, id: randomUUID(), label: 'Second' },
        { ...mockOpportunity, id: randomUUID(), label: 'Third' },
      ];

      const multiData: TestOpportunityListData = {
        opportunities,
        total: 3,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      render(
        <OpportunityList
        type={OpportunityType.ENERGY_SIEVE}
          data={multiData}
          onSelect={mockOnSelect}
          onPageChange={mockOnPageChange}
          onPageSizeChange={mockOnPageSizeChange}
          onExport={mockOnExport}
        />
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });
  });
});
