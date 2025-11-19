import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { EnergyDiagnosticFilters } from './EnergyDiagnosticFilters';
import type { EnergyDiagnosticFilters as IEnergyDiagnosticFilters, EnergyClass } from '~/types/filters';

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

describe('EnergyDiagnosticFilters Component', () => {
  const mockOnFiltersChange = jest.fn();

  const emptyFilters: IEnergyDiagnosticFilters = {};
  const defaultProps = {
    filters: emptyFilters,
    onFiltersChange: mockOnFiltersChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render BaseFilters with correct props', () => {
      render(<EnergyDiagnosticFilters {...defaultProps} />);

      expect(screen.getByTestId('base-filters')).toBeInTheDocument();
      expect(screen.getByText('Current Type: energy_sieve')).toBeInTheDocument();
      expect(screen.getByTestId('extra-filters')).toBeInTheDocument();
    });

    it('should render energy class filter section', () => {
      render(<EnergyDiagnosticFilters {...defaultProps} />);

      expect(screen.getByText('Classes énergétiques')).toBeInTheDocument();
    });

    it('should render only E, F, and G energy class checkboxes', () => {
      render(<EnergyDiagnosticFilters {...defaultProps} />);

      // Should have E, F, G energy classes (poor efficiency ratings)
      expect(screen.getByLabelText('E (Peu économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('F (Énergivore)')).toBeInTheDocument();
      expect(screen.getByLabelText('G (Très énergivore)')).toBeInTheDocument();

      // Should NOT have A, B, C, D energy classes (good efficiency ratings)
      expect(screen.queryByLabelText('A (Très économe)')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('B (Économe)')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('C (Conventionnel)')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('D (Peu économe)')).not.toBeInTheDocument();
    });

    it('should have proper checkbox structure', () => {
      render(<EnergyDiagnosticFilters {...defaultProps} />);

      const energyClassE = screen.getByRole('checkbox', { name: 'E (Peu économe)' });
      const energyClassF = screen.getByRole('checkbox', { name: 'F (Énergivore)' });
      const energyClassG = screen.getByRole('checkbox', { name: 'G (Très énergivore)' });

      expect(energyClassE).toHaveAttribute('type', 'checkbox');
      expect(energyClassF).toHaveAttribute('type', 'checkbox');
      expect(energyClassG).toHaveAttribute('type', 'checkbox');
    });

    it('should have proper color styling for energy classes', () => {
      render(<EnergyDiagnosticFilters {...defaultProps} />);

      const energyClassE = screen.getByText('E (Peu économe)');
      const energyClassF = screen.getByText('F (Énergivore)');
      const energyClassG = screen.getByText('G (Très énergivore)');

      expect(energyClassE).toHaveClass('text-orange-600');
      expect(energyClassF).toHaveClass('text-red-500');
      expect(energyClassG).toHaveClass('text-red-700');
    });
  });

  describe('Energy Class Filter Interactions', () => {
    it('should handle energy class selection', async () => {
      const user = userEvent.setup();
      render(<EnergyDiagnosticFilters {...defaultProps} />);

      const energyClassE = screen.getByRole('checkbox', { name: 'E (Peu économe)' });
      await user.click(energyClassE);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        energyClasses: ['E'],
      });
    });

    it('should handle multiple energy class selections', async () => {
      const user = userEvent.setup();
      const filters: IEnergyDiagnosticFilters = {
        energyClasses: ['E'] as EnergyClass[],
      };

      render(<EnergyDiagnosticFilters {...defaultProps} filters={filters} />);

      const energyClassF = screen.getByRole('checkbox', { name: 'F (Énergivore)' });
      await user.click(energyClassF);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        energyClasses: ['E', 'F'],
      });
    });

    it('should handle energy class deselection', async () => {
      const user = userEvent.setup();
      const filters: IEnergyDiagnosticFilters = {
        energyClasses: ['E', 'F'] as EnergyClass[],
      };

      render(<EnergyDiagnosticFilters {...defaultProps} filters={filters} />);

      const energyClassE = screen.getByRole('checkbox', { name: 'E (Peu économe)' });
      await user.click(energyClassE);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        energyClasses: ['F'],
      });
    });

    it('should display selected energy classes as checked', () => {
      const filters: IEnergyDiagnosticFilters = {
        energyClasses: ['E', 'G'] as EnergyClass[],
      };

      render(<EnergyDiagnosticFilters {...defaultProps} filters={filters} />);

      expect(screen.getByRole('checkbox', { name: 'E (Peu économe)' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'F (Énergivore)' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'G (Très énergivore)' })).toBeChecked();
    });

    it('should clear energy classes when array becomes empty', async () => {
      const user = userEvent.setup();
      const filters: IEnergyDiagnosticFilters = {
        energyClasses: ['E'] as EnergyClass[],
      };

      render(<EnergyDiagnosticFilters {...defaultProps} filters={filters} />);

      const energyClassE = screen.getByRole('checkbox', { name: 'E (Peu économe)' });
      await user.click(energyClassE);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        energyClasses: undefined,
      });
    });

    it('should handle all energy classes selected simultaneously', async () => {
      const user = userEvent.setup();
      render(<EnergyDiagnosticFilters {...defaultProps} />);

      // Select E
      const energyClassE = screen.getByRole('checkbox', { name: 'E (Peu économe)' });
      await user.click(energyClassE);

      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        ...emptyFilters,
        energyClasses: ['E'],
      });

      // Select F (simulate having E already selected)
      const filtersWithE: IEnergyDiagnosticFilters = {
        energyClasses: ['E'] as EnergyClass[],
      };

      render(<EnergyDiagnosticFilters {...defaultProps} filters={filtersWithE} />);

      const energyClassF = screen.getByRole('checkbox', { name: 'F (Énergivore)' });
      await user.click(energyClassF);

      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        ...filtersWithE,
        energyClasses: ['E', 'F'],
      });

      // Select G (simulate having E and F already selected)
      const filtersWithEF: IEnergyDiagnosticFilters = {
        energyClasses: ['E', 'F'] as EnergyClass[],
      };

      render(<EnergyDiagnosticFilters {...defaultProps} filters={filtersWithEF} />);

      const energyClassG = screen.getByRole('checkbox', { name: 'G (Très énergivore)' });
      await user.click(energyClassG);

      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        ...filtersWithEF,
        energyClasses: ['E', 'F', 'G'],
      });
    });

    it('should handle deselecting from multiple selected classes', async () => {
      const user = userEvent.setup();
      const filters: IEnergyDiagnosticFilters = {
        energyClasses: ['E', 'F', 'G'] as EnergyClass[],
      };

      render(<EnergyDiagnosticFilters {...defaultProps} filters={filters} />);

      // Deselect F (middle item)
      const energyClassF = screen.getByRole('checkbox', { name: 'F (Énergivore)' });
      await user.click(energyClassF);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        energyClasses: ['E', 'G'],
      });
    });
  });

  describe('Complex Filter Scenarios', () => {
    it('should preserve state during re-renders', () => {
      const filters: IEnergyDiagnosticFilters = {
        energyClasses: ['E', 'G'] as EnergyClass[],
      };

      const { rerender } = render(<EnergyDiagnosticFilters {...defaultProps} filters={filters} />);

      // Re-render with same props
      rerender(<EnergyDiagnosticFilters {...defaultProps} filters={filters} />);

      // Selected classes should still be checked
      expect(screen.getByRole('checkbox', { name: 'E (Peu économe)' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'F (Énergivore)' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'G (Très énergivore)' })).toBeChecked();
    });

    it('should handle filter state changes', () => {
      const initialFilters: IEnergyDiagnosticFilters = {
        energyClasses: ['E'] as EnergyClass[],
      };

      const { rerender } = render(<EnergyDiagnosticFilters {...defaultProps} filters={initialFilters} />);

      expect(screen.getByRole('checkbox', { name: 'E (Peu économe)' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'F (Énergivore)' })).not.toBeChecked();

      // Update filters and re-render
      const updatedFilters: IEnergyDiagnosticFilters = {
        energyClasses: ['E', 'F'] as EnergyClass[],
      };

      rerender(<EnergyDiagnosticFilters {...defaultProps} filters={updatedFilters} />);

      expect(screen.getByRole('checkbox', { name: 'E (Peu économe)' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'F (Énergivore)' })).toBeChecked();
    });

    it('should handle clearing all selections', () => {
      const filters: IEnergyDiagnosticFilters = {
        energyClasses: ['E', 'F', 'G'] as EnergyClass[],
      };

      const { rerender } = render(<EnergyDiagnosticFilters {...defaultProps} filters={filters} />);

      // All should be checked
      expect(screen.getByRole('checkbox', { name: 'E (Peu économe)' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'F (Énergivore)' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'G (Très énergivore)' })).toBeChecked();

      // Clear filters
      const clearedFilters: IEnergyDiagnosticFilters = {};

      rerender(<EnergyDiagnosticFilters {...defaultProps} filters={clearedFilters} />);

      // None should be checked
      expect(screen.getByRole('checkbox', { name: 'E (Peu économe)' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'F (Énergivore)' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'G (Très énergivore)' })).not.toBeChecked();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined filter values', () => {
      const filters: IEnergyDiagnosticFilters = {
        energyClasses: undefined,
      };

      expect(() => {
        render(<EnergyDiagnosticFilters {...defaultProps} filters={filters} />);
      }).not.toThrow();

      // Should render without checked boxes
      expect(screen.getByRole('checkbox', { name: 'E (Peu économe)' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'F (Énergivore)' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'G (Très énergivore)' })).not.toBeChecked();
    });

    it('should handle empty array gracefully', () => {
      const filters: IEnergyDiagnosticFilters = {
        energyClasses: [],
      };

      expect(() => {
        render(<EnergyDiagnosticFilters {...defaultProps} filters={filters} />);
      }).not.toThrow();

      expect(screen.getByRole('checkbox', { name: 'E (Peu économe)' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'F (Énergivore)' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'G (Très énergivore)' })).not.toBeChecked();
    });

    it('should handle invalid energy class values gracefully', () => {
      const filters: IEnergyDiagnosticFilters = {
        // @ts-ignore - intentionally testing invalid values
        energyClasses: ['A', 'B', 'X', 'Y'] as EnergyClass[],
      };

      expect(() => {
        render(<EnergyDiagnosticFilters {...defaultProps} filters={filters} />);
      }).not.toThrow();

      // Only valid E, F, G classes should be rendered (invalid ones ignored)
      expect(screen.getByRole('checkbox', { name: 'E (Peu économe)' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'F (Énergivore)' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'G (Très énergivore)' })).not.toBeChecked();
    });

    it('should handle onFiltersChange being undefined', () => {
      expect(() => {
        render(<EnergyDiagnosticFilters {...defaultProps} onFiltersChange={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper section label', () => {
      render(<EnergyDiagnosticFilters {...defaultProps} />);

      expect(screen.getByText('Classes énergétiques')).toBeInTheDocument();
    });

    it('should have proper checkbox labels and associations', () => {
      render(<EnergyDiagnosticFilters {...defaultProps} />);

      const energyClassE = screen.getByRole('checkbox', { name: 'E (Peu économe)' });
      const energyClassF = screen.getByRole('checkbox', { name: 'F (Énergivore)' });
      const energyClassG = screen.getByRole('checkbox', { name: 'G (Très énergivore)' });

      expect(energyClassE).toHaveAttribute('id', 'energy-class-E');
      expect(energyClassF).toHaveAttribute('id', 'energy-class-F');
      expect(energyClassG).toHaveAttribute('id', 'energy-class-G');

      // Check label associations
      const labelE = screen.getByLabelText('E (Peu économe)');
      const labelF = screen.getByLabelText('F (Énergivore)');
      const labelG = screen.getByLabelText('G (Très énergivore)');

      expect(labelE).toBe(energyClassE);
      expect(labelF).toBe(energyClassF);
      expect(labelG).toBe(energyClassG);
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<EnergyDiagnosticFilters {...defaultProps} />);

      // Should be able to tab through checkboxes
      const energyClassE = screen.getByRole('checkbox', { name: 'E (Peu économe)' });
      const energyClassF = screen.getByRole('checkbox', { name: 'F (Énergivore)' });
      const energyClassG = screen.getByRole('checkbox', { name: 'G (Très énergivore)' });

      await user.tab();
      expect(energyClassE).toHaveFocus();

      await user.tab();
      expect(energyClassF).toHaveFocus();

      await user.tab();
      expect(energyClassG).toHaveFocus();
    });

    it('should support space key for checkbox activation', async () => {
      const user = userEvent.setup();
      render(<EnergyDiagnosticFilters {...defaultProps} />);

      const energyClassE = screen.getByRole('checkbox', { name: 'E (Peu économe)' });

      // Focus the checkbox and press space
      energyClassE.focus();
      await user.keyboard(' ');

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...emptyFilters,
        energyClasses: ['E'],
      });
    });

    it('should have proper color contrast for labels', () => {
      render(<EnergyDiagnosticFilters {...defaultProps} />);

      // Energy classes should have distinguishable colors
      const energyClassE = screen.getByText('E (Peu économe)');
      const energyClassF = screen.getByText('F (Énergivore)');
      const energyClassG = screen.getByText('G (Très énergivore)');

      // Colors should be different and sufficiently contrasted
      expect(energyClassE).toHaveClass('text-orange-600'); // Orange for E
      expect(energyClassF).toHaveClass('text-red-500'); // Red for F
      expect(energyClassG).toHaveClass('text-red-700'); // Dark red for G
    });
  });

  describe('Integration with BaseFilters', () => {
    it('should pass correct currentType to BaseFilters', () => {
      render(<EnergyDiagnosticFilters {...defaultProps} />);

      expect(screen.getByText('Current Type: energy_sieve')).toBeInTheDocument();
    });

    it('should pass filters and onFiltersChange to BaseFilters', async () => {
      const user = userEvent.setup();
      const filters: IEnergyDiagnosticFilters = { energyClasses: ['E'] as EnergyClass[] };

      render(<EnergyDiagnosticFilters {...defaultProps} filters={filters} />);

      // Simulate BaseFilters calling onFiltersChange
      const resetButton = screen.getByText('Mock Reset');
      await user.click(resetButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        energyClasses: ['E'],
        test: 'reset',
      });
    });

    it('should render extra filters in BaseFilters', () => {
      render(<EnergyDiagnosticFilters {...defaultProps} />);

      const extraFilters = screen.getByTestId('extra-filters');
      expect(extraFilters).toBeInTheDocument();

      // Verify energy diagnostic specific content is in extra filters
      expect(extraFilters).toHaveTextContent('Classes énergétiques');
      expect(extraFilters).toHaveTextContent('E (Peu économe)');
      expect(extraFilters).toHaveTextContent('F (Énergivore)');
      expect(extraFilters).toHaveTextContent('G (Très énergivore)');
    });

    it('should maintain BaseFilters integration with complex interactions', async () => {
      const user = userEvent.setup();
      const filters: IEnergyDiagnosticFilters = {
        energyClasses: ['E', 'F'] as EnergyClass[],
      };

      render(<EnergyDiagnosticFilters {...defaultProps} filters={filters} />);

      // Verify initial state
      expect(screen.getByRole('checkbox', { name: 'E (Peu économe)' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'F (Énergivore)' })).toBeChecked();

      // Interact with energy filter
      const energyClassG = screen.getByRole('checkbox', { name: 'G (Très énergivore)' });
      await user.click(energyClassG);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        energyClasses: ['E', 'F', 'G'],
      });

      // Interact with BaseFilters
      const resetButton = screen.getByText('Mock Reset');
      await user.click(resetButton);

      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        energyClasses: ['E', 'F'],
        test: 'reset',
      });
    });
  });
});