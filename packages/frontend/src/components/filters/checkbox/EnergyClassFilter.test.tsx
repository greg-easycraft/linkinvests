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

      expect(screen.getByLabelText('A (Très performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('B (Performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('C (Assez performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('D (Peu performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('E (Peu performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('F (Très peu performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('G (Extrêmement peu performant)')).toBeInTheDocument();
    });

    it('should render only energy sieve classes when type is "sieve"', () => {
      render(<EnergyClassFilter {...defaultProps} type="sieve" />);

      expect(screen.queryByLabelText('A (Très performant)')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('B (Performant)')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('C (Assez performant)')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('D (Peu performant)')).not.toBeInTheDocument();
      expect(screen.getByLabelText('E (Peu performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('F (Très peu performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('G (Extrêmement peu performant)')).toBeInTheDocument();
    });
  });

  describe('Energy Class Colors', () => {
    it('should apply correct colors for each energy class', () => {
      render(<EnergyClassFilter {...defaultProps} />);

      expect(screen.getByText('A (Très performant)')).toHaveClass('text-green-600');
      expect(screen.getByText('B (Performant)')).toHaveClass('text-green-500');
      expect(screen.getByText('C (Assez performant)')).toHaveClass('text-yellow-500');
      expect(screen.getByText('D (Peu performant)')).toHaveClass('text-orange-500');
      expect(screen.getByText('E (Peu performant)')).toHaveClass('text-orange-500');
      expect(screen.getByText('F (Très peu performant)')).toHaveClass('text-red-500');
      expect(screen.getByText('G (Extrêmement peu performant)')).toHaveClass('text-red-600');
    });

    it('should apply correct colors for energy sieve classes', () => {
      render(<EnergyClassFilter {...defaultProps} type="sieve" />);

      expect(screen.getByText('E (Peu performant)')).toHaveClass('text-orange-500');
      expect(screen.getByText('F (Très peu performant)')).toHaveClass('text-red-500');
      expect(screen.getByText('G (Extrêmement peu performant)')).toHaveClass('text-red-600');
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when energy class is selected', async () => {
      const user = userEvent.setup();
      render(<EnergyClassFilter {...defaultProps} />);

      const checkbox = screen.getByLabelText('A (Très performant)');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith([EnergyClass.A]);
    });

    it('should add to existing selection when additional energy class is selected', async () => {
      const user = userEvent.setup();
      const value = [EnergyClass.A];
      render(<EnergyClassFilter {...defaultProps} value={value} />);

      const checkbox = screen.getByLabelText('B (Performant)');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith([EnergyClass.A, EnergyClass.B]);
    });

    it('should remove from selection when energy class is deselected', async () => {
      const user = userEvent.setup();
      const value = [EnergyClass.A, EnergyClass.B];
      render(<EnergyClassFilter {...defaultProps} value={value} />);

      const checkbox = screen.getByLabelText('A (Très performant)');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith([EnergyClass.B]);
    });

    it('should call onChange with undefined when last energy class is deselected', async () => {
      const user = userEvent.setup();
      const value = [EnergyClass.A];
      render(<EnergyClassFilter {...defaultProps} value={value} />);

      const checkbox = screen.getByLabelText('A (Très performant)');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Value Display', () => {
    it('should display checked checkboxes for selected energy classes', () => {
      const value = [EnergyClass.A, EnergyClass.C, EnergyClass.E];
      render(<EnergyClassFilter {...defaultProps} value={value} />);

      expect(screen.getByLabelText('A (Très performant)')).toBeChecked();
      expect(screen.getByLabelText('B (Performant)')).not.toBeChecked();
      expect(screen.getByLabelText('C (Assez performant)')).toBeChecked();
      expect(screen.getByLabelText('D (Peu performant)')).not.toBeChecked();
      expect(screen.getByLabelText('E (Peu performant)')).toBeChecked();
      expect(screen.getByLabelText('F (Très peu performant)')).not.toBeChecked();
      expect(screen.getByLabelText('G (Extrêmement peu performant)')).not.toBeChecked();
    });

    it('should handle undefined value', () => {
      render(<EnergyClassFilter {...defaultProps} value={undefined} />);

      expect(screen.getByLabelText('A (Très performant)')).not.toBeChecked();
      expect(screen.getByLabelText('B (Performant)')).not.toBeChecked();
      expect(screen.getByLabelText('C (Assez performant)')).not.toBeChecked();
      expect(screen.getByLabelText('D (Peu performant)')).not.toBeChecked();
      expect(screen.getByLabelText('E (Peu performant)')).not.toBeChecked();
      expect(screen.getByLabelText('F (Très peu performant)')).not.toBeChecked();
      expect(screen.getByLabelText('G (Extrêmement peu performant)')).not.toBeChecked();
    });

    it('should handle empty array value', () => {
      render(<EnergyClassFilter {...defaultProps} value={[]} />);

      expect(screen.getByLabelText('A (Très performant)')).not.toBeChecked();
      expect(screen.getByLabelText('G (Extrêmement peu performant)')).not.toBeChecked();
    });
  });

  describe('Energy Class Filter Types', () => {
    it('should support all energy classes when type is "all"', () => {
      render(<EnergyClassFilter {...defaultProps} type="all" />);

      expect(screen.getByLabelText('A (Très performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('G (Extrêmement peu performant)')).toBeInTheDocument();

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(7);
    });

    it('should only show E, F, G classes when type is "sieve"', () => {
      render(<EnergyClassFilter {...defaultProps} type="sieve" />);

      expect(screen.getByLabelText('E (Peu performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('F (Très peu performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('G (Extrêmement peu performant)')).toBeInTheDocument();

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
      expect(screen.getByLabelText('A (Très performant)')).toBeChecked();
      expect(screen.getByLabelText('B (Performant)')).toBeChecked();
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

      expect(screen.getByLabelText('A (Très performant)')).toBeChecked();
      expect(screen.getByLabelText('B (Performant)')).toBeChecked();
      // Should not crash on invalid value
    });

    it('should handle invalid type prop', () => {
      expect(() => {
        render(<EnergyClassFilter {...defaultProps} type={'invalid' as any} />);
      }).not.toThrow();
    });

    it('should handle null value prop', () => {
      expect(() => {
        render(<EnergyClassFilter {...defaultProps} value={null as any} />);
      }).not.toThrow();
    });

    it('should handle missing onChange prop', () => {
      expect(() => {
        render(<EnergyClassFilter onChange={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<EnergyClassFilter {...defaultProps} />);

      const checkboxA = screen.getByLabelText('A (Très performant)');
      const checkboxB = screen.getByLabelText('B (Performant)');

      await user.click(checkboxA);
      expect(checkboxA).toHaveFocus();

      await user.tab();
      expect(checkboxB).toHaveFocus();
    });

    it('should have proper ARIA labels for energy classes', () => {
      render(<EnergyClassFilter {...defaultProps} />);

      expect(screen.getByLabelText('A (Très performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('B (Performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('C (Assez performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('D (Peu performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('E (Peu performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('F (Très peu performant)')).toBeInTheDocument();
      expect(screen.getByLabelText('G (Extrêmement peu performant)')).toBeInTheDocument();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <EnergyClassFilter {...defaultProps} value={[EnergyClass.A]} />
      );

      expect(screen.getByLabelText('A (Très performant)')).toBeChecked();
      expect(screen.getByLabelText('B (Performant)')).not.toBeChecked();

      rerender(
        <EnergyClassFilter {...defaultProps} value={[EnergyClass.B, EnergyClass.C]} />
      );

      expect(screen.getByLabelText('A (Très performant)')).not.toBeChecked();
      expect(screen.getByLabelText('B (Performant)')).toBeChecked();
      expect(screen.getByLabelText('C (Assez performant)')).toBeChecked();
    });

    it('should update when type prop changes', () => {
      const { rerender } = render(
        <EnergyClassFilter {...defaultProps} type="all" />
      );

      expect(screen.getByLabelText('A (Très performant)')).toBeInTheDocument();

      rerender(
        <EnergyClassFilter {...defaultProps} type="sieve" />
      );

      expect(screen.queryByLabelText('A (Très performant)')).not.toBeInTheDocument();
      expect(screen.getByLabelText('E (Peu performant)')).toBeInTheDocument();
    });

    it('should clear checkboxes when value is set to undefined', () => {
      const { rerender } = render(
        <EnergyClassFilter {...defaultProps} value={[EnergyClass.A, EnergyClass.B]} />
      );

      expect(screen.getByLabelText('A (Très performant)')).toBeChecked();
      expect(screen.getByLabelText('B (Performant)')).toBeChecked();

      rerender(<EnergyClassFilter {...defaultProps} value={undefined} />);

      expect(screen.getByLabelText('A (Très performant)')).not.toBeChecked();
      expect(screen.getByLabelText('B (Performant)')).not.toBeChecked();
    });
  });

  describe('Real Estate Energy Efficiency Context', () => {
    it('should handle efficient properties filtering (A-C)', async () => {
      const user = userEvent.setup();
      render(<EnergyClassFilter {...defaultProps} />);

      const checkboxA = screen.getByLabelText('A (Très performant)');
      const checkboxB = screen.getByLabelText('B (Performant)');
      const checkboxC = screen.getByLabelText('C (Assez performant)');

      await user.click(checkboxA);
      await user.click(checkboxB);
      await user.click(checkboxC);

      expect(mockOnChange).toHaveBeenLastCalledWith([EnergyClass.A, EnergyClass.B, EnergyClass.C]);
    });

    it('should handle energy sieve filtering for inefficient properties', async () => {
      const user = userEvent.setup();
      render(<EnergyClassFilter {...defaultProps} type="sieve" />);

      const checkboxE = screen.getByLabelText('E (Peu performant)');
      const checkboxF = screen.getByLabelText('F (Très peu performant)');
      const checkboxG = screen.getByLabelText('G (Extrêmement peu performant)');

      await user.click(checkboxE);
      await user.click(checkboxF);
      await user.click(checkboxG);

      expect(mockOnChange).toHaveBeenLastCalledWith([EnergyClass.E, EnergyClass.F, EnergyClass.G]);
    });
  });
});