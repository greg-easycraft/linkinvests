import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { EnergyClass } from '@linkinvests/shared';
import { EnergyClassFilter } from './EnergyClassFilter';

describe('EnergyClassFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default label', () => {
      render(<EnergyClassFilter {...defaultProps} />);

      expect(screen.getByText('Diagnostic énergétique (DPE)')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<EnergyClassFilter {...defaultProps} label="Custom Energy Label" />);

      expect(screen.getByText('Custom Energy Label')).toBeInTheDocument();
    });

    it('should render all energy classes by default', () => {
      render(<EnergyClassFilter {...defaultProps} />);

      expect(screen.getByLabelText('A (Très économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('B (Économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('C (Conventionnel)')).toBeInTheDocument();
      expect(screen.getByLabelText('D (Peu économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('E (Peu économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('F (Énergivore)')).toBeInTheDocument();
      expect(screen.getByLabelText('G (Très énergivore)')).toBeInTheDocument();
    });

    it('should render only energy sieve classes when type is "sieve"', () => {
      render(<EnergyClassFilter {...defaultProps} type="sieve" />);

      expect(screen.queryByLabelText('A (Très économe)')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('B (Économe)')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('C (Conventionnel)')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('D (Peu économe)')).not.toBeInTheDocument();
      expect(screen.getByLabelText('E (Peu économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('F (Énergivore)')).toBeInTheDocument();
      expect(screen.getByLabelText('G (Très énergivore)')).toBeInTheDocument();
    });
  });

  describe('Energy Class Colors', () => {
    it('should apply correct colors for each energy class', () => {
      render(<EnergyClassFilter {...defaultProps} />);

      expect(screen.getByText('A (Très économe)')).toHaveClass('text-green-600');
      expect(screen.getByText('B (Économe)')).toHaveClass('text-green-500');
      expect(screen.getByText('C (Conventionnel)')).toHaveClass('text-yellow-500');
      expect(screen.getByText('D (Peu économe)')).toHaveClass('text-orange-400');
      expect(screen.getByText('E (Peu économe)')).toHaveClass('text-orange-600');
      expect(screen.getByText('F (Énergivore)')).toHaveClass('text-red-500');
      expect(screen.getByText('G (Très énergivore)')).toHaveClass('text-red-700');
    });

    it('should apply correct colors for energy sieve classes', () => {
      render(<EnergyClassFilter {...defaultProps} type="sieve" />);

      expect(screen.getByText('E (Peu économe)')).toHaveClass('text-orange-600');
      expect(screen.getByText('F (Énergivore)')).toHaveClass('text-red-500');
      expect(screen.getByText('G (Très énergivore)')).toHaveClass('text-red-700');
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when energy class is selected', async () => {
      const user = userEvent.setup();
      render(<EnergyClassFilter {...defaultProps} />);

      const checkbox = screen.getByLabelText('A (Très économe)');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith([EnergyClass.A]);
    });

    it('should add to existing selection when additional energy class is selected', async () => {
      const user = userEvent.setup();
      const value = [EnergyClass.A];
      render(<EnergyClassFilter {...defaultProps} value={value} />);

      const checkbox = screen.getByLabelText('B (Économe)');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith([EnergyClass.A, EnergyClass.B]);
    });

    it('should remove from selection when energy class is deselected', async () => {
      const user = userEvent.setup();
      const value = [EnergyClass.A, EnergyClass.B];
      render(<EnergyClassFilter {...defaultProps} value={value} />);

      const checkbox = screen.getByLabelText('A (Très économe)');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith([EnergyClass.B]);
    });

    it('should call onChange with undefined when last energy class is deselected', async () => {
      const user = userEvent.setup();
      const value = [EnergyClass.A];
      render(<EnergyClassFilter {...defaultProps} value={value} />);

      const checkbox = screen.getByLabelText('A (Très économe)');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Value Display', () => {
    it('should display checked checkboxes for selected energy classes', () => {
      const value = [EnergyClass.A, EnergyClass.C, EnergyClass.E];
      render(<EnergyClassFilter {...defaultProps} value={value} />);

      expect(screen.getByLabelText('A (Très économe)')).toBeChecked();
      expect(screen.getByLabelText('B (Économe)')).not.toBeChecked();
      expect(screen.getByLabelText('C (Conventionnel)')).toBeChecked();
      expect(screen.getByLabelText('D (Peu économe)')).not.toBeChecked();
      expect(screen.getByLabelText('E (Peu économe)')).toBeChecked();
      expect(screen.getByLabelText('F (Énergivore)')).not.toBeChecked();
      expect(screen.getByLabelText('G (Très énergivore)')).not.toBeChecked();
    });

    it('should handle undefined value', () => {
      render(<EnergyClassFilter {...defaultProps} value={undefined} />);

      expect(screen.getByLabelText('A (Très économe)')).not.toBeChecked();
      expect(screen.getByLabelText('B (Économe)')).not.toBeChecked();
      expect(screen.getByLabelText('C (Conventionnel)')).not.toBeChecked();
      expect(screen.getByLabelText('D (Peu économe)')).not.toBeChecked();
      expect(screen.getByLabelText('E (Peu économe)')).not.toBeChecked();
      expect(screen.getByLabelText('F (Énergivore)')).not.toBeChecked();
      expect(screen.getByLabelText('G (Très énergivore)')).not.toBeChecked();
    });

    it('should handle empty array value', () => {
      render(<EnergyClassFilter {...defaultProps} value={[]} />);

      expect(screen.getByLabelText('A (Très économe)')).not.toBeChecked();
      expect(screen.getByLabelText('G (Très énergivore)')).not.toBeChecked();
    });
  });

  describe('Energy Class Filter Types', () => {
    it('should support all energy classes when type is "all"', () => {
      render(<EnergyClassFilter {...defaultProps} type="all" />);

      expect(screen.getByLabelText('A (Très économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('G (Très énergivore)')).toBeInTheDocument();

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(7);
    });

    it('should only show E, F, G classes when type is "sieve"', () => {
      render(<EnergyClassFilter {...defaultProps} type="sieve" />);

      expect(screen.getByLabelText('E (Peu économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('F (Énergivore)')).toBeInTheDocument();
      expect(screen.getByLabelText('G (Très énergivore)')).toBeInTheDocument();

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });

    it('should default to "all" when type is not specified', () => {
      render(<EnergyClassFilter {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(7);
    });
  });

  describe('Component Integration', () => {
    it('should pass through MultiCheckboxFilter props correctly', () => {
      const value = [EnergyClass.A, EnergyClass.B];
      render(<EnergyClassFilter value={value} onChange={mockOnChange} label="Test Energy Filter" />);

      expect(screen.getByText('Test Energy Filter')).toBeInTheDocument();
      expect(screen.getByLabelText('A (Très économe)')).toBeChecked();
      expect(screen.getByLabelText('B (Économe)')).toBeChecked();
    });

    it('should maintain proper component hierarchy', () => {
      render(<EnergyClassFilter {...defaultProps} />);

      const container = screen.getByText('Diagnostic énergétique (DPE)').nextElementSibling;
      expect(container).toHaveClass('space-y-2');
    });

    it('should have proper styling inheritance', () => {
      render(<EnergyClassFilter {...defaultProps} />);

      const label = screen.getByText('Diagnostic énergétique (DPE)');
      expect(label).toHaveClass(
        'text-sm',
        'font-medium',
        'mb-2',
        'block',
        'font-heading'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid energy class values', () => {
      const value = [EnergyClass.A, 'INVALID' as EnergyClass, EnergyClass.B];
      render(<EnergyClassFilter {...defaultProps} value={value} />);

      expect(screen.getByLabelText('A (Très économe)')).toBeChecked();
      expect(screen.getByLabelText('B (Économe)')).toBeChecked();
      // Should not crash on invalid value
    });

    it('should handle invalid type prop', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<EnergyClassFilter {...defaultProps} type={'invalid' as any} />);
      }).not.toThrow();
    });

    it('should handle null value prop', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<EnergyClassFilter {...defaultProps} value={null as any} />);
      }).not.toThrow();
    });

    it('should handle missing onChange prop', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<EnergyClassFilter onChange={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<EnergyClassFilter {...defaultProps} />);

      const checkboxA = screen.getByLabelText('A (Très économe)');
      const checkboxB = screen.getByLabelText('B (Économe)');

      await user.click(checkboxA);
      expect(checkboxA).toHaveFocus();

      await user.tab();
      expect(checkboxB).toHaveFocus();
    });

    it('should have proper ARIA labels for energy classes', () => {
      render(<EnergyClassFilter {...defaultProps} />);

      expect(screen.getByLabelText('A (Très économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('B (Économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('C (Conventionnel)')).toBeInTheDocument();
      expect(screen.getByLabelText('D (Peu économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('E (Peu économe)')).toBeInTheDocument();
      expect(screen.getByLabelText('F (Énergivore)')).toBeInTheDocument();
      expect(screen.getByLabelText('G (Très énergivore)')).toBeInTheDocument();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <EnergyClassFilter {...defaultProps} value={[EnergyClass.A]} />
      );

      expect(screen.getByLabelText('A (Très économe)')).toBeChecked();
      expect(screen.getByLabelText('B (Économe)')).not.toBeChecked();

      rerender(
        <EnergyClassFilter {...defaultProps} value={[EnergyClass.B, EnergyClass.C]} />
      );

      expect(screen.getByLabelText('A (Très économe)')).not.toBeChecked();
      expect(screen.getByLabelText('B (Économe)')).toBeChecked();
      expect(screen.getByLabelText('C (Conventionnel)')).toBeChecked();
    });

    it('should update when type prop changes', () => {
      const { rerender } = render(
        <EnergyClassFilter {...defaultProps} type="all" />
      );

      expect(screen.getByLabelText('A (Très économe)')).toBeInTheDocument();

      rerender(
        <EnergyClassFilter {...defaultProps} type="sieve" />
      );

      expect(screen.queryByLabelText('A (Très économe)')).not.toBeInTheDocument();
      expect(screen.getByLabelText('E (Peu économe)')).toBeInTheDocument();
    });

    it('should clear checkboxes when value is set to undefined', () => {
      const { rerender } = render(
        <EnergyClassFilter {...defaultProps} value={[EnergyClass.A, EnergyClass.B]} />
      );

      expect(screen.getByLabelText('A (Très économe)')).toBeChecked();
      expect(screen.getByLabelText('B (Économe)')).toBeChecked();

      rerender(<EnergyClassFilter {...defaultProps} value={undefined} />);

      expect(screen.getByLabelText('A (Très économe)')).not.toBeChecked();
      expect(screen.getByLabelText('B (Économe)')).not.toBeChecked();
    });
  });

  describe('Real Estate Energy Efficiency Context', () => {
    it('should handle efficient properties filtering (A-C)', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<EnergyClassFilter {...defaultProps} value={[]} />);

      const checkboxA = screen.getByLabelText('A (Très économe)');
      await user.click(checkboxA);
      expect(mockOnChange).toHaveBeenLastCalledWith([EnergyClass.A]);

      // Re-render with updated value
      rerender(<EnergyClassFilter {...defaultProps} value={[EnergyClass.A]} />);

      const checkboxB = screen.getByLabelText('B (Économe)');
      await user.click(checkboxB);
      expect(mockOnChange).toHaveBeenLastCalledWith([EnergyClass.A, EnergyClass.B]);

      // Re-render with updated value
      rerender(<EnergyClassFilter {...defaultProps} value={[EnergyClass.A, EnergyClass.B]} />);

      const checkboxC = screen.getByLabelText('C (Conventionnel)');
      await user.click(checkboxC);
      expect(mockOnChange).toHaveBeenLastCalledWith([EnergyClass.A, EnergyClass.B, EnergyClass.C]);
    });

    it('should handle energy sieve filtering for inefficient properties', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<EnergyClassFilter {...defaultProps} type="sieve" value={[]} />);

      const checkboxE = screen.getByLabelText('E (Peu économe)');
      await user.click(checkboxE);
      expect(mockOnChange).toHaveBeenLastCalledWith([EnergyClass.E]);

      // Re-render with updated value
      rerender(<EnergyClassFilter {...defaultProps} type="sieve" value={[EnergyClass.E]} />);

      const checkboxF = screen.getByLabelText('F (Énergivore)');
      await user.click(checkboxF);
      expect(mockOnChange).toHaveBeenLastCalledWith([EnergyClass.E, EnergyClass.F]);

      // Re-render with updated value
      rerender(<EnergyClassFilter {...defaultProps} type="sieve" value={[EnergyClass.E, EnergyClass.F]} />);

      const checkboxG = screen.getByLabelText('G (Très énergivore)');
      await user.click(checkboxG);
      expect(mockOnChange).toHaveBeenLastCalledWith([EnergyClass.E, EnergyClass.F, EnergyClass.G]);
    });
  });
});