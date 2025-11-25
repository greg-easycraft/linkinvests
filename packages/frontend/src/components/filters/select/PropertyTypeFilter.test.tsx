import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { PropertyTypeFilter } from './PropertyTypeFilter';
import { PropertyType } from '@linkinvests/shared';

describe('PropertyTypeFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    onChange: mockOnChange,
    type: 'auction' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default auction type options', async () => {
      const user = userEvent.setup();
      render(<PropertyTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Auction property types
      expect(screen.getByText('Maison')).toBeInTheDocument();
      expect(screen.getByText('Appartement')).toBeInTheDocument();
      expect(screen.getByText('Terrain')).toBeInTheDocument();
      expect(screen.getByText('Local commercial')).toBeInTheDocument();
      expect(screen.getByText('Local industriel')).toBeInTheDocument();
      expect(screen.getByText('Garage/Parking')).toBeInTheDocument();
    });

    it('should render with listing type options', async () => {
      const user = userEvent.setup();
      render(<PropertyTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Listing property types
      expect(screen.getByText('Appartement')).toBeInTheDocument();
      expect(screen.getByText('Maison')).toBeInTheDocument();
      expect(screen.getByText('Terrain')).toBeInTheDocument();
      expect(screen.getByText('Local commercial')).toBeInTheDocument();
      expect(screen.getByText('Immeuble')).toBeInTheDocument();
      expect(screen.getByText('Garage')).toBeInTheDocument();
      expect(screen.getByText('Cave')).toBeInTheDocument();
      expect(screen.getByText('Box')).toBeInTheDocument();
    });

    it('should have green badge color', () => {
      const value = [PropertyType.HOUSE];
      render(<PropertyTypeFilter {...defaultProps} value={value} />);

      const badge = screen.getByText('Maison');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when option is selected', async () => {
      const user = userEvent.setup();
      render(<PropertyTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Maison');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith([PropertyType.HOUSE]);
    });

    it('should handle multiple selections', async () => {
      const user = userEvent.setup();
      const value = [PropertyType.HOUSE];
      render(<PropertyTypeFilter {...defaultProps} value={value} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Appartement');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith([PropertyType.HOUSE, PropertyType.FLAT]);
    });

    it('should toggle selection when already selected option is clicked', async () => {
      const user = userEvent.setup();
      const value = [PropertyType.HOUSE, PropertyType.FLAT];
      render(<PropertyTypeFilter {...defaultProps} value={value} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Maison');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith([PropertyType.FLAT]);
    });

    it('should call onChange with undefined when last item is deselected', async () => {
      const user = userEvent.setup();
      const value = [PropertyType.HOUSE];
      render(<PropertyTypeFilter {...defaultProps} value={value} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Maison');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Value Display', () => {
    it('should display selected property types', () => {
      const value = [PropertyType.HOUSE, PropertyType.FLAT];
      render(<PropertyTypeFilter {...defaultProps} value={value} />);

      expect(screen.getByText('Maison')).toBeInTheDocument();
      expect(screen.getByText('Appartement')).toBeInTheDocument();
    });

    it('should handle empty selection', () => {
      render(<PropertyTypeFilter {...defaultProps} />);

      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });

    it('should handle undefined value', () => {
      render(<PropertyTypeFilter {...defaultProps} value={undefined} />);

      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });
  });

  describe('Property Type Differences', () => {
    it('should show different options for auction vs listing types', async () => {
      const user = userEvent.setup();

      const { rerender } = render(<PropertyTypeFilter {...defaultProps} />);

      let selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.getByText('Local industriel')).toBeInTheDocument();
      await user.keyboard('{Escape}');

      rerender(<PropertyTypeFilter {...defaultProps} />);

      selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.queryByText('Local industriel')).not.toBeInTheDocument();
      expect(screen.getByText('Immeuble')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid property type gracefully', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<PropertyTypeFilter {...defaultProps} value={['invalid' as any]} />);
      }).not.toThrow();
    });

    it('should handle invalid value prop', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<PropertyTypeFilter {...defaultProps} value={null as any} />);
      }).not.toThrow();
    });

    it('should handle missing onChange prop', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<PropertyTypeFilter value={undefined as any} onChange={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <PropertyTypeFilter {...defaultProps} value={[PropertyType.FLAT]} />
      );

      expect(screen.getByText('Maison')).toBeInTheDocument();

      rerender(
        <PropertyTypeFilter {...defaultProps} value={[PropertyType.FLAT]} />
      );

      expect(screen.queryByText('Maison')).not.toBeInTheDocument();
      expect(screen.getByText('Appartement')).toBeInTheDocument();
    });
  });
});