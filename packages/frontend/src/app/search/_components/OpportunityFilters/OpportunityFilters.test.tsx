/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { BaseFilters } from './BaseFilters';
import { OpportunityType } from '@linkinvests/shared';
import type { OpportunityFilters as IOpportunityFilters, DatePeriodOption } from '~/types/filters';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock custom components
jest.mock('~/components/ui/departments-input', () => ({
  DepartmentsInput: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="departments-input"
      placeholder={placeholder}
      value={Array.isArray(value) ? value.join(',') : value || ''}
      onChange={(e) => {
        const values = e.target.value.split(',').filter(Boolean);
        onChange(values);
      }}
    />
  ),
}));

jest.mock('~/components/ui/zip-code-input', () => ({
  ZipCodeInput: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="zip-code-input"
      placeholder={placeholder}
      value={Array.isArray(value) ? value.join(',') : value || ''}
      onChange={(e) => {
        const values = e.target.value.split(',').filter(Boolean);
        onChange(values);
      }}
    />
  ),
}));

jest.mock('../ViewToggle', () => ({
  ViewToggle: ({ value, onValueChange }: any) => (
    <div data-testid="view-toggle">
      <button onClick={() => onValueChange('list')} data-active={value === 'list'}>
        List
      </button>
      <button onClick={() => onValueChange('map')} data-active={value === 'map'}>
        Map
      </button>
    </div>
  ),
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

const mockSearchParams = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  toString: jest.fn(() => ''),
} as any;

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('BaseFilters', () => {
  const mockOnFiltersChange = jest.fn();

  const emptyFilters: IOpportunityFilters = {};
  const defaultProps = {
    filters: emptyFilters,
    onFiltersChange: mockOnFiltersChange,
    currentType: OpportunityType.AUCTION,
  };

  const customDatePeriodOptions: DatePeriodOption[] = [
    { value: 'last_month', label: 'Cette semaine', months: 1 },
    { value: 'last_3_months', label: 'Ce mois', months: 3 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockUseSearchParams.mockReturnValue(mockSearchParams);
    mockUsePathname.mockReturnValue('/search/auctions');
    // Reset mock return values
    mockSearchParams.get.mockReturnValue(null);
  });

  describe('Basic Rendering', () => {
    it('should render all filter sections', () => {
      render(<BaseFilters {...defaultProps} />);

      expect(screen.getByText("Type d'opportunité")).toBeInTheDocument();
      expect(screen.getByText('Départements')).toBeInTheDocument();
      expect(screen.getByText('Codes postaux')).toBeInTheDocument();
      expect(screen.getByText('Opportunités depuis')).toBeInTheDocument();
    });

    it('should render reset button', () => {
      render(<BaseFilters {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Réinitialiser' })).toBeInTheDocument();
    });

    it('should render view toggle', () => {
      render(<BaseFilters {...defaultProps} />);

      expect(screen.getByTestId('view-toggle')).toBeInTheDocument();
      expect(screen.getByText('List')).toBeInTheDocument();
      expect(screen.getByText('Map')).toBeInTheDocument();
    });

    it('should render custom extra filters when provided', () => {
      const ExtraFilters = <div data-testid="extra-filters">Custom Filters</div>;

      render(<BaseFilters {...defaultProps} ExtraFilters={ExtraFilters} />);

      expect(screen.getByTestId('extra-filters')).toBeInTheDocument();
      expect(screen.getByText('Custom Filters')).toBeInTheDocument();
    });

    it('should render with custom date period options', () => {
      render(
        <BaseFilters
          {...defaultProps}
          datePeriodOptions={customDatePeriodOptions}
        />
      );

      expect(screen.getByText('Opportunités depuis')).toBeInTheDocument();
    });

    it('should have proper card structure', () => {
      const { container } = render(<BaseFilters {...defaultProps} />);

      expect(container.querySelector('.bg-\\[var\\(--secundary\\)\\]')).toBeInTheDocument();
      expect(container.querySelector('.text-\\[var\\(--primary\\)\\]')).toBeInTheDocument();
    });
  });

  describe('View Toggle Functionality', () => {
    it('should default to list view when no view parameter', () => {
      render(<BaseFilters {...defaultProps} />);

      const listButton = screen.getByText('List');
      const mapButton = screen.getByText('Map');

      expect(listButton).toHaveAttribute('data-active', 'true');
      expect(mapButton).toHaveAttribute('data-active', 'false');
    });

    it('should show map view when view parameter is map', () => {
      mockSearchParams.get.mockImplementation((key: string) => key === 'view' ? 'map' : null);

      render(<BaseFilters {...defaultProps} />);

      const listButton = screen.getByText('List');
      const mapButton = screen.getByText('Map');

      expect(listButton).toHaveAttribute('data-active', 'false');
      expect(mapButton).toHaveAttribute('data-active', 'true');
    });

    it('should handle view change to map', async () => {
      const user = userEvent.setup();
      render(<BaseFilters {...defaultProps} />);

      const mapButton = screen.getByText('Map');
      await user.click(mapButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/search/auctions?view=map');
    });

    it('should handle view change to list', async () => {
      const user = userEvent.setup();
      mockSearchParams.get.mockImplementation((key: string) => key === 'view' ? 'map' : null);

      render(<BaseFilters {...defaultProps} />);

      const listButton = screen.getByText('List');
      await user.click(listButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/search/auctions?view=list');
    });

    it('should preserve existing search params when changing view', async () => {
      const user = userEvent.setup();
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'pageSize') return '20';
        if (key === 'page') return '2';
        return null;
      });

      render(<BaseFilters {...defaultProps} />);

      const mapButton = screen.getByText('Map');
      await user.click(mapButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/search/auctions?pageSize=20&page=2&view=map');
    });
  });

  describe('Type Filter Interactions', () => {
    it('should handle opportunity type change', async () => {
      const user = userEvent.setup();
      render(<BaseFilters {...defaultProps} />);

      const typeSelect = screen.getByRole('combobox');
      await user.click(typeSelect);

      const successionOption = screen.getByRole('option', { name: 'Successions' });
      await user.click(successionOption);

      expect(mockRouter.push).toHaveBeenCalledWith('/search/successions');
    });

    it('should preserve pageSize when changing type', async () => {
      const user = userEvent.setup();
      mockSearchParams.get.mockImplementation((key: string) => key === 'pageSize' ? '50' : null);

      render(<BaseFilters {...defaultProps} />);

      const typeSelect = screen.getByRole('combobox');
      await user.click(typeSelect);

      const liquidationOption = screen.getByRole('option', { name: 'Liquidations' });
      await user.click(liquidationOption);

      expect(mockRouter.push).toHaveBeenCalledWith('/search/liquidations?pageSize=50');
    });

    it('should display current type as selected', () => {
      render(<BaseFilters {...defaultProps} currentType={OpportunityType.SUCCESSION} />);

      // The select should show the current type
      expect(screen.getByDisplayValue('succession')).toBeInTheDocument();
    });
  });

  describe('Department Filter Interactions', () => {
    it('should handle department changes', async () => {
      const user = userEvent.setup();
      render(<BaseFilters {...defaultProps} />);

      const departmentInput = screen.getByTestId('departments-input');
      await user.type(departmentInput, '75,92');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        departments: ['75', '92'],
      });
    });

    it('should display selected departments', () => {
      const filters: IOpportunityFilters = { departments: ['75', '92'] };
      render(<BaseFilters {...defaultProps} filters={filters} />);

      const departmentInput = screen.getByTestId('departments-input');
      expect(departmentInput).toHaveValue('75,92');
    });

    it('should handle empty departments', () => {
      const filters: IOpportunityFilters = { departments: [] };
      render(<BaseFilters {...defaultProps} filters={filters} />);

      const departmentInput = screen.getByTestId('departments-input');
      expect(departmentInput).toHaveValue('');
    });
  });

  describe('Zip Code Filter Interactions', () => {
    it('should handle zip code changes', async () => {
      const user = userEvent.setup();
      render(<BaseFilters {...defaultProps} />);

      const zipInput = screen.getByTestId('zip-code-input');
      await user.type(zipInput, '75001,92100');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        zipCodes: ['75001', '92100'],
      });
    });

    it('should display selected zip codes', () => {
      const filters: IOpportunityFilters = { zipCodes: ['75001', '92100'] };
      render(<BaseFilters {...defaultProps} filters={filters} />);

      const zipInput = screen.getByTestId('zip-code-input');
      expect(zipInput).toHaveValue('75001,92100');
    });

    it('should handle empty zip codes', () => {
      const filters: IOpportunityFilters = { zipCodes: [] };
      render(<BaseFilters {...defaultProps} filters={filters} />);

      const zipInput = screen.getByTestId('zip-code-input');
      expect(zipInput).toHaveValue('');
    });
  });

  describe('Date Period Filter Interactions', () => {
    it('should handle date period changes', async () => {
      const user = userEvent.setup();
      render(<BaseFilters {...defaultProps} />);

      const periodSelect = screen.getByRole('combobox', { name: /opportunités depuis/i });
      await user.click(periodSelect);

      const lastWeekOption = screen.getByRole('option', { name: 'Cette semaine' });
      await user.click(lastWeekOption);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        datePeriod: 'last_month',
      });
    });

    it('should display selected date period', () => {
      const filters: IOpportunityFilters = { datePeriod: 'last_month' };
      render(<BaseFilters {...defaultProps} filters={filters} />);

      expect(screen.getByDisplayValue('last_month')).toBeInTheDocument();
    });

    it('should show placeholder when no period selected', () => {
      render(<BaseFilters {...defaultProps} />);

      expect(screen.getByText('Toutes les opportunités')).toBeInTheDocument();
    });

    it('should render custom date period options', async () => {
      const user = userEvent.setup();
      render(
        <BaseFilters
          {...defaultProps}
          datePeriodOptions={customDatePeriodOptions}
        />
      );

      const periodSelect = screen.getByRole('combobox', { name: /opportunités depuis/i });
      await user.click(periodSelect);

      expect(screen.getByRole('option', { name: 'Cette semaine' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Ce mois' })).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('should handle reset button click', async () => {
      const user = userEvent.setup();
      render(<BaseFilters {...defaultProps} />);

      const resetButton = screen.getByRole('button', { name: 'Réinitialiser' });
      await user.click(resetButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/search/auctions');
    });

    it('should use current pathname for reset', async () => {
      const user = userEvent.setup();
      mockUsePathname.mockReturnValue('/search/listings');

      render(<BaseFilters {...defaultProps} />);

      const resetButton = screen.getByRole('button', { name: 'Réinitialiser' });
      await user.click(resetButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/search/listings');
    });

    it('should have outline variant for reset button', () => {
      render(<BaseFilters {...defaultProps} />);

      const resetButton = screen.getByRole('button', { name: 'Réinitialiser' });
      expect(resetButton.closest('button')).toHaveClass('border-input');
    });
  });

  describe('Complex Filter Scenarios', () => {
    it('should handle all filters being set at once', () => {
      const filters: IOpportunityFilters = {
        departments: ['75', '92'],
        zipCodes: ['75001', '92100'],
        datePeriod: 'last_3_months',
      };

      render(<BaseFilters {...defaultProps} filters={filters} />);

      // Verify all filters are displayed
      expect(screen.getByTestId('departments-input')).toHaveValue('75,92');
      expect(screen.getByTestId('zip-code-input')).toHaveValue('75001,92100');
      expect(screen.getByDisplayValue('last_3_months')).toBeInTheDocument();
    });

    it('should handle filter interactions independently', async () => {
      const user = userEvent.setup();
      const filters: IOpportunityFilters = {
        departments: ['75'],
        zipCodes: ['75001'],
      };

      render(<BaseFilters {...defaultProps} filters={filters} />);

      // Change department filter
      const departmentInput = screen.getByTestId('departments-input');
      await user.clear(departmentInput);
      await user.type(departmentInput, '92');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        departments: ['92'],
        zipCodes: ['75001'], // Should preserve other filters
      });
    });

    it('should maintain filter state during re-renders', () => {
      const filters: IOpportunityFilters = {
        departments: ['75'],
        zipCodes: ['75001'],
        datePeriod: 'last_month',
      };

      const { rerender } = render(<BaseFilters {...defaultProps} filters={filters} />);

      // Re-render with same props
      rerender(<BaseFilters {...defaultProps} filters={filters} />);

      // All filters should still be displayed
      expect(screen.getByTestId('departments-input')).toHaveValue('75');
      expect(screen.getByTestId('zip-code-input')).toHaveValue('75001');
      expect(screen.getByDisplayValue('last_month')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle router navigation errors gracefully', async () => {
      const user = userEvent.setup();
      mockRouter.push.mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      render(<BaseFilters {...defaultProps} />);

      const resetButton = screen.getByRole('button', { name: 'Réinitialiser' });

      // Should not crash
      expect(async () => {
        await user.click(resetButton);
      }).not.toThrow();
    });

    it('should handle invalid search params', () => {
      mockSearchParams.get.mockImplementation((key: string) => key === 'view' ? 'invalid' : null);

      expect(() => {
        render(<BaseFilters {...defaultProps} />);
      }).not.toThrow();

      // Should default to list view
      const listButton = screen.getByText('List');
      expect(listButton).toHaveAttribute('data-active', 'true');
    });

    it('should handle undefined filters gracefully', () => {
      expect(() => {
        render(<BaseFilters {...defaultProps} filters={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle null onFiltersChange gracefully', () => {
      expect(() => {
        render(<BaseFilters {...defaultProps} onFiltersChange={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      render(<BaseFilters {...defaultProps} />);

      expect(screen.getByLabelText("Type d'opportunité")).toBeInTheDocument();
      expect(screen.getByLabelText('Départements')).toBeInTheDocument();
      expect(screen.getByLabelText('Codes postaux')).toBeInTheDocument();
      expect(screen.getByLabelText('Opportunités depuis')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<BaseFilters {...defaultProps} />);

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByText('List')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Map')).toHaveFocus();

      // Continue tabbing through form elements
      await user.tab();
      expect(screen.getByRole('combobox')).toHaveFocus();
    });

    it('should have proper button types', () => {
      render(<BaseFilters {...defaultProps} />);

      const resetButton = screen.getByRole('button', { name: 'Réinitialiser' });
      expect(resetButton).toHaveAttribute('type', 'button');
    });
  });
});
