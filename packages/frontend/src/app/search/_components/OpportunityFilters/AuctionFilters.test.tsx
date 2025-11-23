/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { AuctionFilters } from './AuctionFilters';
import type { AuctionFilters as IAuctionFilters } from '~/types/filters';

// Mock BaseFilters
jest.mock('./BaseFilters', () => ({
  BaseFilters: ({ currentType, filters, onFiltersChange, ExtraFilters }: any) => (
    <div data-testid="base-filters">
      <div>Current Type: {currentType}</div>
      <div>Base Filters Component</div>
      {ExtraFilters && (
        <div data-testid="extra-filters">
          {ExtraFilters}
        </div>
      )}
      <button onClick={() => onFiltersChange({ ...filters, test: 'reset' })}>
        Mock Reset
      </button>
    </div>
  ),
}));

// Mock Select components
jest.mock('~/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => (
    <div data-testid="select" onClick={() => onValueChange?.('test-value')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid="select-item" data-value={value} onClick={() => {/* handled by parent */}}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
}));

// Mock Input component
jest.mock('~/components/ui/input', () => ({
  Input: ({ type, placeholder, value, onChange }: any) => (
    <input
      data-testid={`input-${placeholder?.toLowerCase().replace(/\s+/g, '-') || 'input'}`}
      type={type}
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
    />
  ),
}));

describe('AuctionFilters Component', () => {
  const mockOnFiltersChange = jest.fn();

  const emptyFilters: IAuctionFilters = {};
  const defaultProps = {
    filters: emptyFilters,
    onFiltersChange: mockOnFiltersChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render BaseFilters with correct props', () => {
      render(<AuctionFilters {...defaultProps} />);

      expect(screen.getByTestId('base-filters')).toBeInTheDocument();
      expect(screen.getByText('Current Type: auction')).toBeInTheDocument();
      expect(screen.getByTestId('extra-filters')).toBeInTheDocument();
    });

    it('should render all auction-specific filter sections', () => {
      render(<AuctionFilters {...defaultProps} />);

      expect(screen.getByText("Type d'enchère")).toBeInTheDocument();
      expect(screen.getByText('Statut locatif')).toBeInTheDocument();
      expect(screen.getByText('Type de bien')).toBeInTheDocument();
      expect(screen.getByText('Prix (€)')).toBeInTheDocument();
      expect(screen.getByText('Prix de réserve (€)')).toBeInTheDocument();
      expect(screen.getByText('Surface (m²)')).toBeInTheDocument();
      expect(screen.getByText('Nombre de pièces')).toBeInTheDocument();
    });

    it('should render select components for auction types, rental status, and property types', () => {
      render(<AuctionFilters {...defaultProps} />);

      const selects = screen.getAllByTestId('select');
      expect(selects).toHaveLength(3); // Auction type, rental status, and property type

      expect(screen.getByText('Sélectionner un type...')).toBeInTheDocument();
      expect(screen.getByText('Tous les statuts...')).toBeInTheDocument();
    });

    it('should render range input fields', () => {
      render(<AuctionFilters {...defaultProps} />);

      // Price range
      expect(screen.getByTestId('input-prix-min')).toBeInTheDocument();
      expect(screen.getByTestId('input-prix-max')).toBeInTheDocument();

      // Reserve price range
      expect(screen.getByTestId('input-min')).toBeInTheDocument();
      expect(screen.getByTestId('input-max')).toBeInTheDocument();

      // Square footage range
      expect(screen.getAllByTestId('input-min')).toHaveLength(3); // Reserve, square footage, rooms
      expect(screen.getAllByTestId('input-max')).toHaveLength(3);
    });
  });

  describe('Auction Type Filter Interactions', () => {
    it('should handle auction type selection', async () => {
      const user = userEvent.setup();
      render(<AuctionFilters {...defaultProps} />);

      // Click the first select (auction type)
      const auctionTypeSelect = screen.getAllByTestId('select')[0];
      await user.click(auctionTypeSelect!);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        auctionTypes: ['test-value'],
      });
    });

    it('should add multiple auction types', async () => {
      const user = userEvent.setup();
      const filters: IAuctionFilters = {
        auctionTypes: ['judicial'],
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      const auctionTypeSelect = screen.getAllByTestId('select')[0];
      await user.click(auctionTypeSelect!);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        auctionTypes: ['judicial', 'test-value'],
      });
    });

    it('should remove auction type when already selected', async () => {
      const user = userEvent.setup();
      const filters: IAuctionFilters = {
        auctionTypes: ['test-value', 'judicial'],
      };

      // Mock the onValueChange to simulate removing existing value
      const selectModule = await import('~/components/ui/select');
      jest.mocked(selectModule.Select).mockImplementation(({ onValueChange }: any) => (
        <div data-testid="select" onClick={() => onValueChange?.('test-value')}>
          Mock Select
        </div>
      ));

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      const auctionTypeSelect = screen.getAllByTestId('select')[0];
      await user.click(auctionTypeSelect!);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        auctionTypes: ['judicial'],
      });
    });

    it('should display selected auction type badges', () => {
      const filters: IAuctionFilters = {
        auctionTypes: ['judicial', 'voluntary'],
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      expect(screen.getByText('Vente judiciaire')).toBeInTheDocument();
      expect(screen.getByText('Vente volontaire')).toBeInTheDocument();

      // Should have remove buttons
      const removeButtons = screen.getAllByText('×');
      expect(removeButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle auction type badge removal', async () => {
      const user = userEvent.setup();
      const filters: IAuctionFilters = {
        auctionTypes: ['judicial', 'voluntary'],
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      // Find and click the first remove button
      const removeButtons = screen.getAllByText('×');
      await user.click(removeButtons[0]!);

      expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('should clear auctionTypes when array becomes empty', async () => {
      const user = userEvent.setup();
      const filters: IAuctionFilters = {
        auctionTypes: ['test-value'], // Only one item
      };

      // Mock the component to simulate removing the last item
      const selectModule = await import('~/components/ui/select');
      jest.mocked(selectModule.Select).mockImplementation(({ onValueChange }: any) => (
        <div data-testid="select" onClick={() => onValueChange?.('test-value')}>
          Mock Select
        </div>
      ));

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      const auctionTypeSelect = screen.getAllByTestId('select')[0];
      await user.click(auctionTypeSelect!);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        auctionTypes: undefined,
      });
    });
  });

  describe('Rental Status Filter Interactions', () => {
    it('should handle rental status selection for occupied', async () => {
      const user = userEvent.setup();
      render(<AuctionFilters {...defaultProps} />);

      // Click the second select (rental status)
      const rentalStatusSelect = screen.getAllByTestId('select')[1];

      // Mock the select to return 'true' for occupied
      const selectModule = await import('~/components/ui/select');
      jest.mocked(selectModule.Select).mockImplementation(({ onValueChange }: any) => (
        <div data-testid="select" onClick={() => onValueChange?.('true')}>
          Mock Select
        </div>
      ));

      await user.click(rentalStatusSelect!);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        isSoldRented: true,
      });
    });

    it('should handle rental status selection for available', async () => {
      const user = userEvent.setup();
      render(<AuctionFilters {...defaultProps} />);

      const rentalStatusSelect = screen.getAllByTestId('select')[1];

      // Mock the select to return 'false' for available
      const selectModule = await import('~/components/ui/select');
      jest.mocked(selectModule.Select).mockImplementation(({ onValueChange }: any) => (
        <div data-testid="select" onClick={() => onValueChange?.('false')}>
          Mock Select
        </div>
      ));

      await user.click(rentalStatusSelect!);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        isSoldRented: false,
      });
    });

    it('should display rental status badge when selected', () => {
      const filters: IAuctionFilters = {
        isSoldRented: true,
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      expect(screen.getByText('Occupé')).toBeInTheDocument();
      expect(screen.getByText('×')).toBeInTheDocument(); // Remove button
    });

    it('should display available badge when false is selected', () => {
      const filters: IAuctionFilters = {
        isSoldRented: false,
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      expect(screen.getByText('Libre')).toBeInTheDocument();
    });

    it('should handle rental status badge removal', async () => {
      const user = userEvent.setup();
      const filters: IAuctionFilters = {
        isSoldRented: true,
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      // Find and click the remove button in the rental status badge
      const badge = screen.getByText('Occupé').closest('span');
      const removeButton = badge?.querySelector('button');
      await user.click(removeButton!);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        isSoldRented: undefined,
      });
    });

    it('should show rental status options', () => {
      render(<AuctionFilters {...defaultProps} />);

      expect(screen.getByText('Libre')).toBeInTheDocument();
      expect(screen.getByText('Occupé')).toBeInTheDocument();
    });

    it('should preserve other filters when changing rental status', async () => {
      const user = userEvent.setup();
      const filters: IAuctionFilters = {
        auctionTypes: ['judicial'],
        priceRange: { min: 100000, max: 500000 },
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      const rentalStatusSelect = screen.getAllByTestId('select')[1];

      // Mock the select to return 'true' for occupied
      const selectModule = await import('~/components/ui/select');
      jest.mocked(selectModule.Select).mockImplementation(({ onValueChange }: any) => (
        <div data-testid="select" onClick={() => onValueChange?.('true')}>
          Mock Select
        </div>
      ));

      await user.click(rentalStatusSelect!);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        auctionTypes: ['judicial'],
        priceRange: { min: 100000, max: 500000 },
        isSoldRented: true,
      });
    });
  });

  describe('Property Type Filter Interactions', () => {
    it('should handle property type selection', async () => {
      const user = userEvent.setup();
      render(<AuctionFilters {...defaultProps} />);

      // Click the third select (property type)
      const propertyTypeSelect = screen.getAllByTestId('select')[2];
      await user.click(propertyTypeSelect!);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        propertyTypes: ['test-value'],
      });
    });

    it('should display property type options', () => {
      render(<AuctionFilters {...defaultProps} />);

      expect(screen.getByText('Maison')).toBeInTheDocument();
      expect(screen.getByText('Appartement')).toBeInTheDocument();
      expect(screen.getByText('Terrain')).toBeInTheDocument();
      expect(screen.getByText('Local commercial')).toBeInTheDocument();
      expect(screen.getByText('Industriel')).toBeInTheDocument();
      expect(screen.getByText('Garage/Parking')).toBeInTheDocument();
    });

    it('should display selected property type badges', () => {
      const filters: IAuctionFilters = {
        propertyTypes: ['house', 'apartment'],
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      expect(screen.getByText('Maison')).toBeInTheDocument();
      expect(screen.getByText('Appartement')).toBeInTheDocument();
    });
  });

  describe('Price Range Filter Interactions', () => {
    it('should handle price range min value change', async () => {
      const user = userEvent.setup();
      render(<AuctionFilters {...defaultProps} />);

      const minInput = screen.getByTestId('input-prix-min');
      await user.type(minInput, '100000');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        priceRange: { min: 100000 },
      });
    });

    it('should handle price range max value change', async () => {
      const user = userEvent.setup();
      render(<AuctionFilters {...defaultProps} />);

      const maxInput = screen.getByTestId('input-prix-max');
      await user.type(maxInput, '500000');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        priceRange: { max: 500000 },
      });
    });

    it('should handle complete price range', async () => {
      const user = userEvent.setup();
      const filters: IAuctionFilters = {
        priceRange: { min: 100000 },
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      const maxInput = screen.getByTestId('input-prix-max');
      await user.type(maxInput, '500000');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        priceRange: { min: 100000, max: 500000 },
      });
    });

    it('should clear price range when both values are empty', async () => {
      const user = userEvent.setup();
      const filters: IAuctionFilters = {
        priceRange: { min: 100000, max: 500000 },
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      const minInput = screen.getByTestId('input-prix-min');
      await user.clear(minInput);

      // This should trigger a change where min becomes undefined
      expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('should display existing price range values', () => {
      const filters: IAuctionFilters = {
        priceRange: { min: 100000, max: 500000 },
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      const minInput = screen.getByTestId('input-prix-min');
      const maxInput = screen.getByTestId('input-prix-max');

      expect(minInput).toHaveValue('100000');
      expect(maxInput).toHaveValue('500000');
    });

    it('should handle empty string input gracefully', async () => {
      const user = userEvent.setup();
      const filters: IAuctionFilters = {
        priceRange: { min: 100000 },
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      const minInput = screen.getByTestId('input-prix-min');
      await user.clear(minInput);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        priceRange: { min: undefined },
      });
    });
  });

  describe('Reserve Price Range Filter', () => {
    it('should handle reserve price range changes', async () => {
      const user = userEvent.setup();
      render(<AuctionFilters {...defaultProps} />);

      const reserveMinInputs = screen.getAllByTestId('input-min');
      const reserveMinInput = reserveMinInputs[0]!; // First one should be reserve price min
      await user.type(reserveMinInput, '50000');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        reservePriceRange: { min: 50000 },
      });
    });

    it('should display existing reserve price range values', () => {
      const filters: IAuctionFilters = {
        reservePriceRange: { min: 50000, max: 200000 },
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      const minInputs = screen.getAllByTestId('input-min');
      const maxInputs = screen.getAllByTestId('input-max');

      // Reserve price should be first min/max pair
      expect(minInputs[0]).toHaveValue('50000');
      expect(maxInputs[0]).toHaveValue('200000');
    });
  });

  describe('Square Footage Range Filter', () => {
    it('should handle square footage range changes', async () => {
      const user = userEvent.setup();
      render(<AuctionFilters {...defaultProps} />);

      const minInputs = screen.getAllByTestId('input-min');
      const squareFootageMinInput = minInputs[1]!; // Second one should be square footage
      await user.type(squareFootageMinInput, '100');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        squareFootageRange: { min: 100 },
      });
    });

    it('should display existing square footage values', () => {
      const filters: IAuctionFilters = {
        squareFootageRange: { min: 100, max: 300 },
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      const minInputs = screen.getAllByTestId('input-min');
      const maxInputs = screen.getAllByTestId('input-max');

      // Square footage should be second min/max pair
      expect(minInputs[1]).toHaveValue('100');
      expect(maxInputs[1]).toHaveValue('300');
    });
  });

  describe('Rooms Range Filter', () => {
    it('should handle rooms range changes', async () => {
      const user = userEvent.setup();
      render(<AuctionFilters {...defaultProps} />);

      const minInputs = screen.getAllByTestId('input-min');
      const roomsMinInput = minInputs[2]!; // Third one should be rooms
      await user.type(roomsMinInput, '3');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        roomsRange: { min: 3 },
      });
    });

    it('should display existing rooms range values', () => {
      const filters: IAuctionFilters = {
        roomsRange: { min: 2, max: 5 },
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      const minInputs = screen.getAllByTestId('input-min');
      const maxInputs = screen.getAllByTestId('input-max');

      // Rooms should be third min/max pair
      expect(minInputs[2]).toHaveValue('2');
      expect(maxInputs[2]).toHaveValue('5');
    });
  });

  describe('Complex Filter Scenarios', () => {
    it('should handle multiple filters simultaneously', () => {
      const filters: IAuctionFilters = {
        auctionTypes: ['judicial', 'voluntary'],
        isSoldRented: true,
        propertyTypes: ['house', 'apartment'],
        priceRange: { min: 100000, max: 500000 },
        reservePriceRange: { min: 50000, max: 200000 },
        squareFootageRange: { min: 100, max: 300 },
        roomsRange: { min: 2, max: 5 },
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      // Verify auction type badges
      expect(screen.getByText('Vente judiciaire')).toBeInTheDocument();
      expect(screen.getByText('Vente volontaire')).toBeInTheDocument();

      // Verify rental status badge
      expect(screen.getByText('Occupé')).toBeInTheDocument();

      // Verify property type badges
      expect(screen.getByText('Maison')).toBeInTheDocument();
      expect(screen.getByText('Appartement')).toBeInTheDocument();

      // Verify range values
      expect(screen.getByDisplayValue('100000')).toBeInTheDocument(); // price min
      expect(screen.getByDisplayValue('500000')).toBeInTheDocument(); // price max
    });

    it('should preserve other filters when changing one filter', async () => {
      const user = userEvent.setup();
      const filters: IAuctionFilters = {
        auctionTypes: ['judicial'],
        priceRange: { min: 100000, max: 500000 },
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      // Change reserve price, should preserve other filters
      const minInputs = screen.getAllByTestId('input-min');
      await user.type(minInputs[0]!, '50000');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        auctionTypes: ['judicial'],
        priceRange: { min: 100000, max: 500000 },
        reservePriceRange: { min: 50000 },
      });
    });

    it('should handle filters state changes during re-renders', () => {
      const filters: IAuctionFilters = {
        auctionTypes: ['judicial'],
        priceRange: { min: 100000 },
      };

      const { rerender } = render(<AuctionFilters {...defaultProps} filters={filters} />);

      // Update filters and re-render
      const updatedFilters = {
        ...filters,
        propertyTypes: ['house'],
      };

      rerender(<AuctionFilters {...defaultProps} filters={updatedFilters} />);

      // Both auction types and property types should be visible
      expect(screen.getByText('Vente judiciaire')).toBeInTheDocument();
      expect(screen.getByText('Maison')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid number input gracefully', async () => {
      const user = userEvent.setup();
      render(<AuctionFilters {...defaultProps} />);

      const priceMinInput = screen.getByTestId('input-prix-min');
      await user.type(priceMinInput, 'invalid');

      // Should handle parseFloat of invalid input (returns NaN)
      expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('should handle null/undefined filter values', () => {
      const filters: IAuctionFilters = {
        auctionTypes: undefined,
        propertyTypes: undefined,
        priceRange: undefined,
      };

      expect(() => {
        render(<AuctionFilters {...defaultProps} filters={filters} />);
      }).not.toThrow();

      // Should render without selected badges
      expect(screen.queryByText('Vente judiciaire')).not.toBeInTheDocument();
      expect(screen.queryByText('Maison')).not.toBeInTheDocument();
    });

    it('should handle empty arrays gracefully', () => {
      const filters: IAuctionFilters = {
        auctionTypes: [],
        propertyTypes: [],
      };

      expect(() => {
        render(<AuctionFilters {...defaultProps} filters={filters} />);
      }).not.toThrow();

      expect(screen.queryByText('Vente judiciaire')).not.toBeInTheDocument();
    });

    it('should handle range with only min or max value', () => {
      const filters: IAuctionFilters = {
        priceRange: { min: 100000 },
        reservePriceRange: { max: 200000 },
      };

      expect(() => {
        render(<AuctionFilters {...defaultProps} filters={filters} />);
      }).not.toThrow();

      expect(screen.getByDisplayValue('100000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('200000')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all input fields', () => {
      render(<AuctionFilters {...defaultProps} />);

      expect(screen.getByText("Type d'enchère")).toBeInTheDocument();
      expect(screen.getByText('Statut locatif')).toBeInTheDocument();
      expect(screen.getByText('Type de bien')).toBeInTheDocument();
      expect(screen.getByText('Prix (€)')).toBeInTheDocument();
      expect(screen.getByText('Prix de réserve (€)')).toBeInTheDocument();
      expect(screen.getByText('Surface (m²)')).toBeInTheDocument();
      expect(screen.getByText('Nombre de pièces')).toBeInTheDocument();
    });

    it('should have proper input placeholders', () => {
      render(<AuctionFilters {...defaultProps} />);

      expect(screen.getByPlaceholderText('Prix min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Prix max')).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText('Min')).toHaveLength(3);
      expect(screen.getAllByPlaceholderText('Max')).toHaveLength(3);
    });

    it('should support keyboard navigation through form elements', async () => {
      const user = userEvent.setup();
      render(<AuctionFilters {...defaultProps} />);

      // Should be able to tab through inputs
      await user.tab();
      const firstInput = screen.getByTestId('input-prix-min');
      expect(firstInput).toHaveFocus();
    });

    it('should have proper button accessibility for badge removal', () => {
      const filters: IAuctionFilters = {
        auctionTypes: ['judicial'],
      };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      const removeButton = screen.getByText('×');
      expect(removeButton.closest('button')).toBeInTheDocument();
    });
  });

  describe('Integration with BaseFilters', () => {
    it('should pass correct currentType to BaseFilters', () => {
      render(<AuctionFilters {...defaultProps} />);

      expect(screen.getByText('Current Type: auction')).toBeInTheDocument();
    });

    it('should pass filters and onFiltersChange to BaseFilters', async () => {
      const user = userEvent.setup();
      const filters: IAuctionFilters = { auctionTypes: ['judicial'] };

      render(<AuctionFilters {...defaultProps} filters={filters} />);

      // Simulate BaseFilters calling onFiltersChange
      const resetButton = screen.getByText('Mock Reset');
      await user.click(resetButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        auctionTypes: ['judicial'],
        test: 'reset',
      });
    });

    it('should render extra filters in BaseFilters', () => {
      render(<AuctionFilters {...defaultProps} />);

      const extraFilters = screen.getByTestId('extra-filters');
      expect(extraFilters).toBeInTheDocument();

      // Verify auction-specific content is in extra filters
      expect(extraFilters).toHaveTextContent("Type d'enchère");
      expect(extraFilters).toHaveTextContent('Type de bien');
    });
  });
});