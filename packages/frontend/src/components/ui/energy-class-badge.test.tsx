import { render, screen } from '~/test-utils/test-helpers';
import { EnergyClass } from '@linkinvests/shared';
import { EnergyClassBadge } from './energy-class-badge';

describe('EnergyClassBadge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with energy class A', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.A} />);

      const badge = screen.getByText('A');
      expect(badge).toBeInTheDocument();
    });

    it('should render with energy class B', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.B} />);

      const badge = screen.getByText('B');
      expect(badge).toBeInTheDocument();
    });

    it('should render with energy class C', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.C} />);

      const badge = screen.getByText('C');
      expect(badge).toBeInTheDocument();
    });

    it('should render with energy class D', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.D} />);

      const badge = screen.getByText('D');
      expect(badge).toBeInTheDocument();
    });

    it('should render with energy class E', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.E} />);

      const badge = screen.getByText('E');
      expect(badge).toBeInTheDocument();
    });

    it('should render with energy class F', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.F} />);

      const badge = screen.getByText('F');
      expect(badge).toBeInTheDocument();
    });

    it('should render with energy class G', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.G} />);

      const badge = screen.getByText('G');
      expect(badge).toBeInTheDocument();
    });

    it('should render "NC" when energyClass is undefined', () => {
      render(<EnergyClassBadge />);

      const badge = screen.getByText('NC');
      expect(badge).toBeInTheDocument();
    });

    it('should render "NC" when energyClass is explicitly undefined', () => {
      render(<EnergyClassBadge energyClass={undefined} />);

      const badge = screen.getByText('NC');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Color Styling', () => {
    it('should apply green-600 color class for energy class A', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.A} />);

      const badge = screen.getByText('A');
      expect(badge).toHaveClass('bg-green-600');
    });

    it('should apply green-500 color class for energy class B', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.B} />);

      const badge = screen.getByText('B');
      expect(badge).toHaveClass('bg-green-500');
    });

    it('should apply yellow-500 color class for energy class C', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.C} />);

      const badge = screen.getByText('C');
      expect(badge).toHaveClass('bg-yellow-500');
    });

    it('should apply orange-500 color class for energy class D', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.D} />);

      const badge = screen.getByText('D');
      expect(badge).toHaveClass('bg-orange-500');
    });

    it('should apply orange-500 color class for energy class E', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.E} />);

      const badge = screen.getByText('E');
      expect(badge).toHaveClass('bg-orange-500');
    });

    it('should apply red-500 color class for energy class F', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.F} />);

      const badge = screen.getByText('F');
      expect(badge).toHaveClass('bg-red-500');
    });

    it('should apply red-600 color class for energy class G', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.G} />);

      const badge = screen.getByText('G');
      expect(badge).toHaveClass('bg-red-600');
    });

    it('should apply default primary color when energyClass is undefined', () => {
      render(<EnergyClassBadge />);

      const badge = screen.getByText('NC');
      expect(badge).toHaveClass('bg-[var(--primary)]');
    });

    it('should apply secondary text color when energyClass is undefined', () => {
      render(<EnergyClassBadge />);

      const badge = screen.getByText('NC');
      expect(badge).toHaveClass('text-[var(--secundary)]');
    });
  });

  describe('Base Styling', () => {
    it('should have proper base styling classes', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.A} />);

      const badge = screen.getByText('A');
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'rounded-full',
        'px-2.5',
        'py-0.5',
        'text-xs',
        'font-semibold'
      );
    });

    it('should maintain base styling when no energy class is provided', () => {
      render(<EnergyClassBadge />);

      const badge = screen.getByText('NC');
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'rounded-full',
        'px-2.5',
        'py-0.5',
        'text-xs',
        'font-semibold'
      );
    });
  });

  describe('DOM Structure', () => {
    it('should render as div element', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.A} />);

      const badge = screen.getByText('A');
      expect(badge.tagName).toBe('DIV');
    });

    it('should contain only the energy class text', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.B} />);

      const badge = screen.getByText('B');
      expect(badge).toHaveTextContent('B');
      expect(badge.textContent?.trim()).toBe('B');
    });

    it('should contain only "NC" when undefined', () => {
      render(<EnergyClassBadge />);

      const badge = screen.getByText('NC');
      expect(badge).toHaveTextContent('NC');
      expect(badge.textContent?.trim()).toBe('NC');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null energyClass gracefully', () => {
      expect(() => {
        render(<EnergyClassBadge energyClass={null as unknown as EnergyClass} />);
      }).not.toThrow();

      const badge = screen.getByText('NC');
      expect(badge).toBeInTheDocument();
    });

    it('should handle invalid energyClass values gracefully', () => {
      expect(() => {
        render(<EnergyClassBadge energyClass={'X' as EnergyClass} />);
      }).not.toThrow();

      const badge = screen.getByText('X');
      expect(badge).toBeInTheDocument();
      // Should fall back to default color
      expect(badge).toHaveClass('bg-[var(--primary)]');
    });

    it('should handle empty string energyClass', () => {
      expect(() => {
        render(<EnergyClassBadge energyClass={'' as EnergyClass} />);
      }).not.toThrow();

      // Empty string is shown as empty, not 'NC' due to nullish coalescing operator
      const badge = document.querySelector('[class*="inline-flex"]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with energy class content', () => {
      render(<EnergyClassBadge energyClass={EnergyClass.A} />);

      const badge = screen.getByText('A');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('A');
    });

    it('should be accessible with NC content', () => {
      render(<EnergyClassBadge />);

      const badge = screen.getByText('NC');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('NC');
    });

    it('should support aria-label when provided', () => {
      render(
        <div aria-label="Energy efficiency rating">
          <EnergyClassBadge energyClass={EnergyClass.A} />
        </div>
      );

      const container = screen.getByLabelText('Energy efficiency rating');
      expect(container).toBeInTheDocument();
      expect(container).toHaveTextContent('A');
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when energyClass prop changes', () => {
      const { rerender } = render(<EnergyClassBadge energyClass={EnergyClass.A} />);

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('A')).toHaveClass('bg-green-600');

      rerender(<EnergyClassBadge energyClass={EnergyClass.G} />);

      expect(screen.queryByText('A')).not.toBeInTheDocument();
      expect(screen.getByText('G')).toBeInTheDocument();
      expect(screen.getByText('G')).toHaveClass('bg-red-600');
    });

    it('should update from energy class to NC', () => {
      const { rerender } = render(<EnergyClassBadge energyClass={EnergyClass.C} />);

      expect(screen.getByText('C')).toBeInTheDocument();
      expect(screen.getByText('C')).toHaveClass('bg-yellow-500');

      rerender(<EnergyClassBadge />);

      expect(screen.queryByText('C')).not.toBeInTheDocument();
      expect(screen.getByText('NC')).toBeInTheDocument();
      expect(screen.getByText('NC')).toHaveClass('bg-[var(--primary)]');
      expect(screen.getByText('NC')).toHaveClass('text-[var(--secundary)]');
    });

    it('should update from NC to energy class', () => {
      const { rerender } = render(<EnergyClassBadge />);

      expect(screen.getByText('NC')).toBeInTheDocument();
      expect(screen.getByText('NC')).toHaveClass('text-[var(--secundary)]');

      rerender(<EnergyClassBadge energyClass={EnergyClass.E} />);

      expect(screen.queryByText('NC')).not.toBeInTheDocument();
      expect(screen.getByText('E')).toBeInTheDocument();
      expect(screen.getByText('E')).toHaveClass('bg-orange-500');
      expect(screen.getByText('E')).not.toHaveClass('text-[var(--secundary)]');
    });
  });

  describe('Multiple Instances', () => {
    it('should render multiple badges with different energy classes', () => {
      render(
        <div>
          <EnergyClassBadge energyClass={EnergyClass.A} />
          <EnergyClassBadge energyClass={EnergyClass.E} />
          <EnergyClassBadge />
        </div>
      );

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('E')).toBeInTheDocument();
      expect(screen.getByText('NC')).toBeInTheDocument();

      expect(screen.getByText('A')).toHaveClass('bg-green-600');
      expect(screen.getByText('E')).toHaveClass('bg-orange-500');
      expect(screen.getByText('NC')).toHaveClass('bg-[var(--primary)]');
    });

    it('should render multiple badges with same energy class', () => {
      render(
        <div>
          <EnergyClassBadge energyClass={EnergyClass.B} />
          <EnergyClassBadge energyClass={EnergyClass.B} />
        </div>
      );

      const badges = screen.getAllByText('B');
      expect(badges).toHaveLength(2);

      badges.forEach(badge => {
        expect(badge).toHaveClass('bg-green-500');
      });
    });
  });

  describe('Complete Energy Class Coverage', () => {
    // Test to ensure all energy classes are properly supported
    const energyClassTests = [
      { class: EnergyClass.A, color: 'bg-green-600' },
      { class: EnergyClass.B, color: 'bg-green-500' },
      { class: EnergyClass.C, color: 'bg-yellow-500' },
      { class: EnergyClass.D, color: 'bg-orange-500' },
      { class: EnergyClass.E, color: 'bg-orange-500' },
      { class: EnergyClass.F, color: 'bg-red-500' },
      { class: EnergyClass.G, color: 'bg-red-600' },
    ];

    energyClassTests.forEach(({ class: energyClass, color }) => {
      it(`should render ${energyClass} with ${color} color`, () => {
        render(<EnergyClassBadge energyClass={energyClass} />);

        const badge = screen.getByText(energyClass);
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass(color);
        expect(badge).toHaveClass(
          'inline-flex',
          'items-center',
          'rounded-full',
          'px-2.5',
          'py-0.5',
          'text-xs',
          'font-semibold'
        );
      });
    });
  });
});