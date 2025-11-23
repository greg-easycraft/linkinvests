import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { FeaturesFilter } from './FeaturesFilter';
import type { ListingFeatures } from '~/types/filters';

describe('FeaturesFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default label', () => {
      render(<FeaturesFilter {...defaultProps} />);

      expect(screen.getByText('Équipements')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<FeaturesFilter {...defaultProps} label="Custom Features" />);

      expect(screen.getByText('Custom Features')).toBeInTheDocument();
    });

    it('should render all feature options', () => {
      render(<FeaturesFilter {...defaultProps} />);

      expect(screen.getByLabelText('Balcon')).toBeInTheDocument();
      expect(screen.getByLabelText('Terrasse')).toBeInTheDocument();
      expect(screen.getByLabelText('Jardin')).toBeInTheDocument();
      expect(screen.getByLabelText('Garage')).toBeInTheDocument();
      expect(screen.getByLabelText('Parking')).toBeInTheDocument();
      expect(screen.getByLabelText('Ascenseur')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onChange with feature object when feature is selected', async () => {
      const user = userEvent.setup();
      render(<FeaturesFilter {...defaultProps} />);

      const checkbox = screen.getByLabelText('Balcon');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith({ balcony: true });
    });

    it('should add to existing features when additional feature is selected', async () => {
      const user = userEvent.setup();
      const value: ListingFeatures = { balcony: true };
      render(<FeaturesFilter {...defaultProps} value={value} />);

      const checkbox = screen.getByLabelText('Terrasse');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith({ balcony: true, terrace: true });
    });

    it('should remove feature when checkbox is unchecked', async () => {
      const user = userEvent.setup();
      const value: ListingFeatures = { balcony: true, terrace: true };
      render(<FeaturesFilter {...defaultProps} value={value} />);

      const checkbox = screen.getByLabelText('Balcon');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith({ terrace: true });
    });

    it('should call onChange with undefined when last feature is unchecked', async () => {
      const user = userEvent.setup();
      const value: ListingFeatures = { balcony: true };
      render(<FeaturesFilter {...defaultProps} value={value} />);

      const checkbox = screen.getByLabelText('Balcon');
      await user.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });

    it('should handle multiple features being selected and deselected', async () => {
      const user = userEvent.setup();
      render(<FeaturesFilter {...defaultProps} />);

      // Select multiple features
      await user.click(screen.getByLabelText('Balcon'));
      await user.click(screen.getByLabelText('Garage'));
      await user.click(screen.getByLabelText('Ascenseur'));

      expect(mockOnChange).toHaveBeenLastCalledWith({
        balcony: true,
        garage: true,
        elevator: true
      });
    });
  });

  describe('Value Display', () => {
    it('should display checked checkboxes for selected features', () => {
      const value: ListingFeatures = { balcony: true, garage: true, elevator: true };
      render(<FeaturesFilter {...defaultProps} value={value} />);

      expect(screen.getByLabelText('Balcon')).toBeChecked();
      expect(screen.getByLabelText('Terrasse')).not.toBeChecked();
      expect(screen.getByLabelText('Jardin')).not.toBeChecked();
      expect(screen.getByLabelText('Garage')).toBeChecked();
      expect(screen.getByLabelText('Parking')).not.toBeChecked();
      expect(screen.getByLabelText('Ascenseur')).toBeChecked();
    });

    it('should handle undefined value', () => {
      render(<FeaturesFilter {...defaultProps} value={undefined} />);

      expect(screen.getByLabelText('Balcon')).not.toBeChecked();
      expect(screen.getByLabelText('Terrasse')).not.toBeChecked();
      expect(screen.getByLabelText('Jardin')).not.toBeChecked();
      expect(screen.getByLabelText('Garage')).not.toBeChecked();
      expect(screen.getByLabelText('Parking')).not.toBeChecked();
      expect(screen.getByLabelText('Ascenseur')).not.toBeChecked();
    });

    it('should handle empty features object', () => {
      render(<FeaturesFilter {...defaultProps} value={{}} />);

      expect(screen.getByLabelText('Balcon')).not.toBeChecked();
      expect(screen.getByLabelText('Terrasse')).not.toBeChecked();
      expect(screen.getByLabelText('Jardin')).not.toBeChecked();
      expect(screen.getByLabelText('Garage')).not.toBeChecked();
      expect(screen.getByLabelText('Parking')).not.toBeChecked();
      expect(screen.getByLabelText('Ascenseur')).not.toBeChecked();
    });
  });

  describe('Features Object Handling', () => {
    it('should handle all features being true', () => {
      const value: ListingFeatures = {
        balcony: true,
        terrace: true,
        garden: true,
        garage: true,
        parking: true,
        elevator: true,
      };
      render(<FeaturesFilter {...defaultProps} value={value} />);

      expect(screen.getByLabelText('Balcon')).toBeChecked();
      expect(screen.getByLabelText('Terrasse')).toBeChecked();
      expect(screen.getByLabelText('Jardin')).toBeChecked();
      expect(screen.getByLabelText('Garage')).toBeChecked();
      expect(screen.getByLabelText('Parking')).toBeChecked();
      expect(screen.getByLabelText('Ascenseur')).toBeChecked();
    });

    it('should handle partial features object', () => {
      const value: ListingFeatures = { balcony: true, garage: true };
      render(<FeaturesFilter {...defaultProps} value={value} />);

      expect(screen.getByLabelText('Balcon')).toBeChecked();
      expect(screen.getByLabelText('Terrasse')).not.toBeChecked();
      expect(screen.getByLabelText('Jardin')).not.toBeChecked();
      expect(screen.getByLabelText('Garage')).toBeChecked();
      expect(screen.getByLabelText('Parking')).not.toBeChecked();
      expect(screen.getByLabelText('Ascenseur')).not.toBeChecked();
    });

    it('should ignore false values in features object', () => {
      const value: ListingFeatures = { balcony: true, terrace: false, garage: true };
      render(<FeaturesFilter {...defaultProps} value={value} />);

      expect(screen.getByLabelText('Balcon')).toBeChecked();
      expect(screen.getByLabelText('Terrasse')).not.toBeChecked();
      expect(screen.getByLabelText('Garage')).toBeChecked();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid value prop', () => {
      expect(() => {
        render(<FeaturesFilter {...defaultProps} value={null as any} />);
      }).not.toThrow();
    });

    it('should handle missing onChange prop', () => {
      expect(() => {
        render(<FeaturesFilter onChange={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle malformed features object', () => {
      const value: ListingFeatures = { balcony: true, extraProp: 'invalid' } as any;

      expect(() => {
        render(<FeaturesFilter {...defaultProps} value={value} />);
      }).not.toThrow();

      expect(screen.getByLabelText('Balcon')).toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<FeaturesFilter {...defaultProps} />);

      const balconCheckbox = screen.getByLabelText('Balcon');
      const terraceCheckbox = screen.getByLabelText('Terrasse');

      await user.click(balconCheckbox);
      expect(balconCheckbox).toHaveFocus();

      await user.tab();
      expect(terraceCheckbox).toHaveFocus();
    });

    it('should have proper ARIA labels for features', () => {
      render(<FeaturesFilter {...defaultProps} />);

      expect(screen.getByLabelText('Balcon')).toBeInTheDocument();
      expect(screen.getByLabelText('Terrasse')).toBeInTheDocument();
      expect(screen.getByLabelText('Jardin')).toBeInTheDocument();
      expect(screen.getByLabelText('Garage')).toBeInTheDocument();
      expect(screen.getByLabelText('Parking')).toBeInTheDocument();
      expect(screen.getByLabelText('Ascenseur')).toBeInTheDocument();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <FeaturesFilter {...defaultProps} value={{ balcony: true }} />
      );

      expect(screen.getByLabelText('Balcon')).toBeChecked();
      expect(screen.getByLabelText('Garage')).not.toBeChecked();

      rerender(
        <FeaturesFilter {...defaultProps} value={{ garage: true, elevator: true }} />
      );

      expect(screen.getByLabelText('Balcon')).not.toBeChecked();
      expect(screen.getByLabelText('Garage')).toBeChecked();
      expect(screen.getByLabelText('Ascenseur')).toBeChecked();
    });

    it('should clear checkboxes when value is set to undefined', () => {
      const { rerender } = render(
        <FeaturesFilter {...defaultProps} value={{ balcony: true, garage: true }} />
      );

      expect(screen.getByLabelText('Balcon')).toBeChecked();
      expect(screen.getByLabelText('Garage')).toBeChecked();

      rerender(<FeaturesFilter {...defaultProps} value={undefined} />);

      expect(screen.getByLabelText('Balcon')).not.toBeChecked();
      expect(screen.getByLabelText('Garage')).not.toBeChecked();
    });
  });

  describe('Real Estate Features Context', () => {
    it('should handle outdoor features selection', async () => {
      const user = userEvent.setup();
      render(<FeaturesFilter {...defaultProps} />);

      await user.click(screen.getByLabelText('Balcon'));
      await user.click(screen.getByLabelText('Terrasse'));
      await user.click(screen.getByLabelText('Jardin'));

      expect(mockOnChange).toHaveBeenLastCalledWith({
        balcony: true,
        terrace: true,
        garden: true,
      });
    });

    it('should handle parking features selection', async () => {
      const user = userEvent.setup();
      render(<FeaturesFilter {...defaultProps} />);

      await user.click(screen.getByLabelText('Garage'));
      await user.click(screen.getByLabelText('Parking'));

      expect(mockOnChange).toHaveBeenLastCalledWith({
        garage: true,
        parking: true,
      });
    });

    it('should handle accessibility features selection', async () => {
      const user = userEvent.setup();
      render(<FeaturesFilter {...defaultProps} />);

      await user.click(screen.getByLabelText('Ascenseur'));

      expect(mockOnChange).toHaveBeenCalledWith({ elevator: true });
    });
  });
});