import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { ListingFilters } from './ListingFilters';
import type { ListingFilters as IListingFilters, EnergyClass } from '~/types/filters';

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

describe('ListingFilters Component', () => {
  const mockOnFiltersChange = jest.fn();

  const emptyFilters: IListingFilters = {};
  const defaultProps = {
    filters: emptyFilters,
    onFiltersChange: mockOnFiltersChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render BaseFilters with correct props', () => {
      render(<ListingFilters {...defaultProps} />);

      expect(screen.getByTestId('base-filters')).toBeInTheDocument();
      expect(screen.getByText('Current Type: real_estate_listing')).toBeInTheDocument();
      expect(screen.getByTestId('extra-filters')).toBeInTheDocument();
    });

    it('should render all listing-specific filter sections', () => {
      render(<ListingFilters {...defaultProps} />);

      expect(screen.getByText('Type de transaction')).toBeInTheDocument();
      expect(screen.getByText('Type de bien')).toBeInTheDocument();
      expect(screen.getByText('Prix (€)')).toBeInTheDocument();
      expect(screen.getByText('Surface (m²)')).toBeInTheDocument();
      expect(screen.getByText('Surface terrain (m²)')).toBeInTheDocument();
      expect(screen.getByText('Nombre de pièces')).toBeInTheDocument();
      expect(screen.getByText('Nombre de chambres')).toBeInTheDocument();
      expect(screen.getByText('Année de construction')).toBeInTheDocument();
      expect(screen.getByText('Diagnostic énergétique (DPE)')).toBeInTheDocument();
      expect(screen.getByText('Équipements')).toBeInTheDocument();
    });

    it('should render transaction and property type selects', () => {
      render(<ListingFilters {...defaultProps} />);

      const selects = screen.getAllByTestId('select');
      expect(selects).toHaveLength(2); // Transaction type and property type

      expect(screen.getAllByText('Sélectionner un type...')).toHaveLength(2);
    });

    it('should render all range input sections', () => {
      render(<ListingFilters {...defaultProps} />);

      // Price range
      expect(screen.getByTestId('input-prix-min')).toBeInTheDocument();
      expect(screen.getByTestId('input-prix-max')).toBeInTheDocument();

      // Multiple min/max pairs for different ranges
      expect(screen.getAllByTestId('input-min')).toHaveLength(5); // Surface, land, rooms, bedrooms, construction year
      expect(screen.getAllByTestId('input-max')).toHaveLength(5);
    });

    it('should render energy class checkboxes', () => {
      render(<ListingFilters {...defaultProps} />);

      // Energy classes A-G
      expect(screen.getByLabelText('A (Très économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('B (Économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('C (Conventionnel)')).toBeInTheDocument();
      expect(screen.getByLabelText('D (Peu économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('E (Peu économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('F (Énergivore)')).toBeInTheDocument();
      expect(screen.getByLabelText('G (Très énergivore)')).toBeInTheDocument();
    });

    it('should render features checkboxes', () => {
      render(<ListingFilters {...defaultProps} />);

      expect(screen.getByLabelText('Balcon')).toBeInTheDocument();
      expect(screen.getByLabelText('Terrasse')).toBeInTheDocument();
      expect(screen.getByLabelText('Jardin')).toBeInTheDocument();
      expect(screen.getByLabelText('Garage')).toBeInTheDocument();
      expect(screen.getByLabelText('Parking')).toBeInTheDocument();
      expect(screen.getByLabelText('Ascenseur')).toBeInTheDocument();
    });
  });

  describe('Transaction Type Filter Interactions', () => {
    it('should handle transaction type selection', async () => {
      const user = userEvent.setup();
      render(<ListingFilters {...defaultProps} />);

      // Click the first select (transaction type)
      const transactionTypeSelect = screen.getAllByTestId('select')[0];
      await user.click(transactionTypeSelect!);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        transactionTypes: ['test-value'],
      });
    });

    it('should display transaction type options', () => {
      render(<ListingFilters {...defaultProps} />);

      expect(screen.getByText('Vente')).toBeInTheDocument();
      expect(screen.getByText('VEFA')).toBeInTheDocument();
      expect(screen.getByText('Enchères')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Location-vente')).toBeInTheDocument();
    });

    it('should add multiple transaction types', async () => {
      const user = userEvent.setup();
      const filters: IListingFilters = {
        transactionTypes: ['VENTE'],
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      const transactionTypeSelect = screen.getAllByTestId('select')[0];
      await user.click(transactionTypeSelect!);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        transactionTypes: ['VENTE', 'test-value'],
      });
    });

    it('should display selected transaction type badges', () => {
      const filters: IListingFilters = {
        transactionTypes: ['VENTE', 'LOCATION'],
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      expect(screen.getByText('Vente')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();

      // Should have remove buttons
      const removeButtons = screen.getAllByText('×');
      expect(removeButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle transaction type badge removal', async () => {
      const user = userEvent.setup();
      const filters: IListingFilters = {
        transactionTypes: ['VENTE', 'LOCATION'],
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      // Find and click the first remove button
      const removeButtons = screen.getAllByText('×');
      await user.click(removeButtons[0]!);

      expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('should clear transactionTypes when array becomes empty', async () => {
      const user = userEvent.setup();
      const filters: IListingFilters = {
        transactionTypes: ['test-value'], // Only one item
      };

      // Mock the component to simulate removing the last item
      jest.mocked(require('~/components/ui/select').Select).mockImplementation(({ onValueChange }: any) => (
        <div data-testid="select" onClick={() => onValueChange?.('test-value')}>
          Mock Select
        </div>
      ));

      render(<ListingFilters {...defaultProps} filters={filters} />);

      const transactionTypeSelect = screen.getAllByTestId('select')[0];
      await user.click(transactionTypeSelect!);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        transactionTypes: undefined,
      });
    });
  });

  describe('Property Type Filter Interactions', () => {
    it('should handle property type selection', async () => {
      const user = userEvent.setup();
      render(<ListingFilters {...defaultProps} />);

      // Click the second select (property type)
      const propertyTypeSelect = screen.getAllByTestId('select')[1];
      await user.click(propertyTypeSelect!);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        propertyTypes: ['test-value'],
      });
    });

    it('should display property type options', () => {
      render(<ListingFilters {...defaultProps} />);

      expect(screen.getByText('Appartement')).toBeInTheDocument();
      expect(screen.getByText('Maison')).toBeInTheDocument();
      expect(screen.getByText('Terrain')).toBeInTheDocument();
      expect(screen.getByText('Local commercial')).toBeInTheDocument();
      expect(screen.getByText('Immeuble')).toBeInTheDocument();
      expect(screen.getByText('Garage/Parking')).toBeInTheDocument();
      expect(screen.getByText('Cave')).toBeInTheDocument();
      expect(screen.getByText('Box')).toBeInTheDocument();
    });

    it('should display selected property type badges', () => {
      const filters: IListingFilters = {
        propertyTypes: ['APP', 'MAI'],
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      expect(screen.getByText('Appartement')).toBeInTheDocument();
      expect(screen.getByText('Maison')).toBeInTheDocument();
    });
  });

  describe('Price Range Filter Interactions', () => {
    it('should handle price range min value change', async () => {
      const user = userEvent.setup();
      render(<ListingFilters {...defaultProps} />);

      const minInput = screen.getByTestId('input-prix-min');
      await user.type(minInput, '200000');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        priceRange: { min: 200000 },
      });
    });

    it('should handle price range max value change', async () => {
      const user = userEvent.setup();
      render(<ListingFilters {...defaultProps} />);

      const maxInput = screen.getByTestId('input-prix-max');
      await user.type(maxInput, '800000');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        priceRange: { max: 800000 },
      });
    });

    it('should display existing price range values', () => {
      const filters: IListingFilters = {
        priceRange: { min: 200000, max: 800000 },
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      const minInput = screen.getByTestId('input-prix-min');
      const maxInput = screen.getByTestId('input-prix-max');

      expect(minInput).toHaveValue('200000');
      expect(maxInput).toHaveValue('800000');
    });

    it('should clear price range when both values are empty', async () => {
      const user = userEvent.setup();
      const filters: IListingFilters = {
        priceRange: { min: 200000, max: 800000 },
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      const minInput = screen.getByTestId('input-prix-min');
      await user.clear(minInput);

      // This should set min to undefined
      expect(mockOnFiltersChange).toHaveBeenCalled();
    });
  });

  describe('Range Filters - Square Footage, Land Area, Rooms, Bedrooms, Construction Year', () => {
    it('should handle square footage range changes', async () => {
      const user = userEvent.setup();
      render(<ListingFilters {...defaultProps} />);

      const minInputs = screen.getAllByTestId('input-min');
      const squareFootageMinInput = minInputs[0]!; // First min should be square footage
      await user.type(squareFootageMinInput, '80');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        squareFootageRange: { min: 80 },
      });
    });

    it('should handle land area range changes', async () => {
      const user = userEvent.setup();
      render(<ListingFilters {...defaultProps} />);

      const minInputs = screen.getAllByTestId('input-min');
      const landAreaMinInput = minInputs[1]!; // Second min should be land area
      await user.type(landAreaMinInput, '500');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        landAreaRange: { min: 500 },
      });
    });

    it('should handle rooms range changes', async () => {
      const user = userEvent.setup();
      render(<ListingFilters {...defaultProps} />);

      const minInputs = screen.getAllByTestId('input-min');
      const roomsMinInput = minInputs[2]!; // Third min should be rooms
      await user.type(roomsMinInput, '4');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        roomsRange: { min: 4 },
      });
    });

    it('should handle bedrooms range changes', async () => {
      const user = userEvent.setup();
      render(<ListingFilters {...defaultProps} />);

      const minInputs = screen.getAllByTestId('input-min');
      const bedroomsMinInput = minInputs[3]!; // Fourth min should be bedrooms
      await user.type(bedroomsMinInput, '3');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        bedroomsRange: { min: 3 },
      });
    });

    it('should handle construction year range changes', async () => {
      const user = userEvent.setup();
      render(<ListingFilters {...defaultProps} />);

      const minInputs = screen.getAllByTestId('input-min');
      const constructionYearMinInput = minInputs[4]!; // Fifth min should be construction year
      await user.type(constructionYearMinInput, '2010');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        constructionYearRange: { min: 2010 },
      });
    });

    it('should display all range values when set', () => {
      const filters: IListingFilters = {
        squareFootageRange: { min: 80, max: 150 },
        landAreaRange: { min: 500, max: 1000 },
        roomsRange: { min: 3, max: 6 },
        bedroomsRange: { min: 2, max: 4 },
        constructionYearRange: { min: 2010, max: 2020 },
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      const minInputs = screen.getAllByTestId('input-min');
      const maxInputs = screen.getAllByTestId('input-max');

      expect(minInputs[0]).toHaveValue('80'); // Square footage min
      expect(maxInputs[0]).toHaveValue('150'); // Square footage max
      expect(minInputs[1]).toHaveValue('500'); // Land area min
      expect(maxInputs[1]).toHaveValue('1000'); // Land area max
      expect(minInputs[2]).toHaveValue('3'); // Rooms min
      expect(maxInputs[2]).toHaveValue('6'); // Rooms max
      expect(minInputs[3]).toHaveValue('2'); // Bedrooms min
      expect(maxInputs[3]).toHaveValue('4'); // Bedrooms max
      expect(minInputs[4]).toHaveValue('2010'); // Construction year min
      expect(maxInputs[4]).toHaveValue('2020'); // Construction year max
    });
  });

  describe('Energy Classes (DPE) Filter', () => {
    it('should handle energy class selection', async () => {
      const user = userEvent.setup();
      render(<ListingFilters {...defaultProps} />);

      const energyClassA = screen.getByRole('checkbox', { name: 'A (Très économe)' });
      await user.click(energyClassA);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        energyClasses: ['A'],
      });
    });

    it('should handle multiple energy class selections', async () => {
      const user = userEvent.setup();
      const filters: IListingFilters = {
        energyClasses: ['A'],
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      const energyClassB = screen.getByRole('checkbox', { name: 'B (Économe)' });
      await user.click(energyClassB);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        energyClasses: ['A', 'B'],
      });
    });

    it('should handle energy class deselection', async () => {
      const user = userEvent.setup();
      const filters: IListingFilters = {
        energyClasses: ['A', 'B'] as EnergyClass[],
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      const energyClassA = screen.getByRole('checkbox', { name: 'A (Très économe)' });
      await user.click(energyClassA);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        energyClasses: ['B'],
      });
    });

    it('should display selected energy classes as checked', () => {
      const filters: IListingFilters = {
        energyClasses: ['A', 'C', 'E'] as EnergyClass[],
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      expect(screen.getByRole('checkbox', { name: 'A (Très économe)' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'B (Économe)' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'C (Conventionnel)' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'D (Peu économe)' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'E (Peu économe)' })).toBeChecked();
    });

    it('should clear energy classes when array becomes empty', async () => {
      const user = userEvent.setup();
      const filters: IListingFilters = {
        energyClasses: ['A'] as EnergyClass[],
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      const energyClassA = screen.getByRole('checkbox', { name: 'A (Très économe)' });
      await user.click(energyClassA);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        energyClasses: undefined,
      });
    });

    it('should have proper color styling for energy classes', () => {
      render(<ListingFilters {...defaultProps} />);

      const energyClassA = screen.getByText('A (Très économe)');
      const energyClassF = screen.getByText('F (Énergivore)');
      const energyClassG = screen.getByText('G (Très énergivore)');

      expect(energyClassA).toHaveClass('text-green-600');
      expect(energyClassF).toHaveClass('text-red-500');
      expect(energyClassG).toHaveClass('text-red-700');
    });
  });

  describe('Features Filter', () => {
    it('should handle feature selection', async () => {
      const user = userEvent.setup();
      render(<ListingFilters {...defaultProps} />);

      const balconyCheckbox = screen.getByRole('checkbox', { name: 'Balcon' });
      await user.click(balconyCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        features: { balcony: true },
      });
    });

    it('should handle multiple feature selections', async () => {
      const user = userEvent.setup();
      const filters: IListingFilters = {
        features: { balcony: true },
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      const gardenCheckbox = screen.getByRole('checkbox', { name: 'Jardin' });
      await user.click(gardenCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        features: { balcony: true, garden: true },
      });
    });

    it('should handle feature deselection', async () => {
      const user = userEvent.setup();
      const filters: IListingFilters = {
        features: { balcony: true, garden: true },
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      const balconyCheckbox = screen.getByRole('checkbox', { name: 'Balcon' });
      await user.click(balconyCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        features: { garden: true },
      });
    });

    it('should display selected features as checked', () => {
      const filters: IListingFilters = {
        features: {
          balcony: true,
          garage: true,
          elevator: true,
        },
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      expect(screen.getByRole('checkbox', { name: 'Balcon' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Terrasse' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Jardin' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Garage' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Parking' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Ascenseur' })).toBeChecked();
    });

    it('should clear features when object becomes empty', async () => {
      const user = userEvent.setup();
      const filters: IListingFilters = {
        features: { balcony: true },
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      const balconyCheckbox = screen.getByRole('checkbox', { name: 'Balcon' });
      await user.click(balconyCheckbox);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        features: undefined,
      });
    });
  });

  describe('Complex Filter Scenarios', () => {
    it('should handle all filters simultaneously', () => {
      const filters: IListingFilters = {
        transactionTypes: ['VENTE', 'LOCATION'],
        propertyTypes: ['APP', 'MAI'],
        priceRange: { min: 200000, max: 800000 },
        squareFootageRange: { min: 80, max: 150 },
        landAreaRange: { min: 500, max: 1000 },
        roomsRange: { min: 3, max: 6 },
        bedroomsRange: { min: 2, max: 4 },
        constructionYearRange: { min: 2010, max: 2020 },
        energyClasses: ['A', 'B', 'C'] as EnergyClass[],
        features: {
          balcony: true,
          garden: true,
          garage: true,
        },
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      // Verify transaction type badges
      expect(screen.getByText('Vente')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();

      // Verify property type badges
      expect(screen.getByText('Appartement')).toBeInTheDocument();
      expect(screen.getByText('Maison')).toBeInTheDocument();

      // Verify range values
      expect(screen.getByDisplayValue('200000')).toBeInTheDocument(); // price min
      expect(screen.getByDisplayValue('800000')).toBeInTheDocument(); // price max

      // Verify checkboxes
      expect(screen.getByRole('checkbox', { name: 'A (Très économe)' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Balcon' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Jardin' })).toBeChecked();
    });

    it('should preserve other filters when changing one filter', async () => {
      const user = userEvent.setup();
      const filters: IListingFilters = {
        transactionTypes: ['VENTE'],
        priceRange: { min: 200000, max: 800000 },
        features: { balcony: true },
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      // Change rooms range, should preserve other filters
      const minInputs = screen.getAllByTestId('input-min');
      await user.type(minInputs[2]!, '4'); // Rooms min

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        transactionTypes: ['VENTE'],
        priceRange: { min: 200000, max: 800000 },
        features: { balcony: true },
        roomsRange: { min: 4 },
      });
    });

    it('should handle state changes during re-renders', () => {
      const filters: IListingFilters = {
        transactionTypes: ['VENTE'],
        energyClasses: ['A'] as EnergyClass[],
      };

      const { rerender } = render(<ListingFilters {...defaultProps} filters={filters} />);

      // Update filters and re-render
      const updatedFilters = {
        ...filters,
        features: { balcony: true },
      };

      rerender(<ListingFilters {...defaultProps} filters={updatedFilters} />);

      // All filters should be visible
      expect(screen.getByText('Vente')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'A (Très économe)' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Balcon' })).toBeChecked();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid number input gracefully', async () => {
      const user = userEvent.setup();
      render(<ListingFilters {...defaultProps} />);

      const priceMinInput = screen.getByTestId('input-prix-min');
      await user.type(priceMinInput, 'invalid');

      // Should handle parseFloat of invalid input (returns NaN)
      expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('should handle null/undefined filter values', () => {
      const filters: IListingFilters = {
        transactionTypes: undefined,
        propertyTypes: undefined,
        priceRange: undefined,
        energyClasses: undefined,
        features: undefined,
      };

      expect(() => {
        render(<ListingFilters {...defaultProps} filters={filters} />);
      }).not.toThrow();

      // Should render without selected badges or checked boxes
      expect(screen.queryByText('Vente')).not.toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'A (Très économe)' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Balcon' })).not.toBeChecked();
    });

    it('should handle empty arrays and objects gracefully', () => {
      const filters: IListingFilters = {
        transactionTypes: [],
        propertyTypes: [],
        energyClasses: [],
        features: {},
      };

      expect(() => {
        render(<ListingFilters {...defaultProps} filters={filters} />);
      }).not.toThrow();

      expect(screen.queryByText('Vente')).not.toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Balcon' })).not.toBeChecked();
    });

    it('should handle range with only min or max value', () => {
      const filters: IListingFilters = {
        priceRange: { min: 200000 },
        squareFootageRange: { max: 150 },
      };

      expect(() => {
        render(<ListingFilters {...defaultProps} filters={filters} />);
      }).not.toThrow();

      expect(screen.getByDisplayValue('200000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('150')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all sections', () => {
      render(<ListingFilters {...defaultProps} />);

      expect(screen.getByText('Type de transaction')).toBeInTheDocument();
      expect(screen.getByText('Type de bien')).toBeInTheDocument();
      expect(screen.getByText('Prix (€)')).toBeInTheDocument();
      expect(screen.getByText('Surface (m²)')).toBeInTheDocument();
      expect(screen.getByText('Surface terrain (m²)')).toBeInTheDocument();
      expect(screen.getByText('Nombre de pièces')).toBeInTheDocument();
      expect(screen.getByText('Nombre de chambres')).toBeInTheDocument();
      expect(screen.getByText('Année de construction')).toBeInTheDocument();
      expect(screen.getByText('Diagnostic énergétique (DPE)')).toBeInTheDocument();
      expect(screen.getByText('Équipements')).toBeInTheDocument();
    });

    it('should have proper input placeholders', () => {
      render(<ListingFilters {...defaultProps} />);

      expect(screen.getByPlaceholderText('Prix min')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Prix max')).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText('Min')).toHaveLength(5);
      expect(screen.getAllByPlaceholderText('Max')).toHaveLength(5);
    });

    it('should have proper checkbox labels and associations', () => {
      render(<ListingFilters {...defaultProps} />);

      // Energy classes
      const energyClassA = screen.getByRole('checkbox', { name: 'A (Très économe)' });
      expect(energyClassA).toHaveAttribute('id', 'dpe-A');

      // Features
      const balconyCheckbox = screen.getByRole('checkbox', { name: 'Balcon' });
      expect(balconyCheckbox).toHaveAttribute('id', 'feature-balcony');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ListingFilters {...defaultProps} />);

      // Should be able to tab through form elements
      await user.tab();
      const firstInput = screen.getByTestId('input-prix-min');
      expect(firstInput).toHaveFocus();
    });

    it('should have proper button accessibility for badge removal', () => {
      const filters: IListingFilters = {
        transactionTypes: ['VENTE'],
      };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      const removeButton = screen.getByText('×');
      expect(removeButton.closest('button')).toBeInTheDocument();
    });
  });

  describe('Integration with BaseFilters', () => {
    it('should pass correct currentType to BaseFilters', () => {
      render(<ListingFilters {...defaultProps} />);

      expect(screen.getByText('Current Type: real_estate_listing')).toBeInTheDocument();
    });

    it('should pass filters and onFiltersChange to BaseFilters', async () => {
      const user = userEvent.setup();
      const filters: IListingFilters = { transactionTypes: ['VENTE'] };

      render(<ListingFilters {...defaultProps} filters={filters} />);

      // Simulate BaseFilters calling onFiltersChange
      const resetButton = screen.getByText('Mock Reset');
      await user.click(resetButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        transactionTypes: ['VENTE'],
        test: 'reset',
      });
    });

    it('should render extra filters in BaseFilters', () => {
      render(<ListingFilters {...defaultProps} />);

      const extraFilters = screen.getByTestId('extra-filters');
      expect(extraFilters).toBeInTheDocument();

      // Verify listing-specific content is in extra filters
      expect(extraFilters).toHaveTextContent('Type de transaction');
      expect(extraFilters).toHaveTextContent('Diagnostic énergétique (DPE)');
      expect(extraFilters).toHaveTextContent('Équipements');
    });
  });
});