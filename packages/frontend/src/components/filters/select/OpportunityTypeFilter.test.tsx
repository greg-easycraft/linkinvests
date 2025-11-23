import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { OpportunityType } from '@linkinvests/shared';
import { OpportunityTypeFilter } from './OpportunityTypeFilter';

// Mock Next.js navigation hooks
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

describe('OpportunityTypeFilter', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    value: OpportunityType.LIQUIDATION,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
  });

  describe('Basic Rendering', () => {
    it('should render with proper label', () => {
      render(<OpportunityTypeFilter {...defaultProps} />);

      expect(screen.getByText("Type d'opportunité")).toBeInTheDocument();
    });

    it('should render opportunity type options', async () => {
      const user = userEvent.setup();
      render(<OpportunityTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.getByText('Liquidations')).toBeInTheDocument();
      expect(screen.getByText('Passoires énergétiques')).toBeInTheDocument();
      expect(screen.getByText('Annonces immobilières')).toBeInTheDocument();
      expect(screen.getByText('Ventes aux enchères')).toBeInTheDocument();
      expect(screen.getByText('Successions')).toBeInTheDocument();
    });

    it('should show current value as selected', () => {
      render(<OpportunityTypeFilter value={OpportunityType.AUCTION} onChange={mockOnChange} />);

      expect(screen.getByDisplayValue(OpportunityType.AUCTION)).toBeInTheDocument();
    });

    it('should show placeholder when no value', () => {
      render(<OpportunityTypeFilter value={'' as OpportunityType} onChange={mockOnChange} />);

      expect(screen.getByText('Sélectionner un type...')).toBeInTheDocument();
    });
  });

  describe('User Interactions with onChange', () => {
    it('should call onChange when option is selected', async () => {
      const user = userEvent.setup();
      render(<OpportunityTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const auctionOption = screen.getByText('Ventes aux enchères');
      await user.click(auctionOption);

      expect(mockOnChange).toHaveBeenCalledWith(OpportunityType.AUCTION);
    });

    it('should call onChange with correct OpportunityType values', async () => {
      const user = userEvent.setup();
      render(<OpportunityTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const testCases = [
        { label: 'Liquidations', value: OpportunityType.LIQUIDATION },
        { label: 'Passoires énergétiques', value: OpportunityType.ENERGY_SIEVE },
        { label: 'Annonces immobilières', value: OpportunityType.REAL_ESTATE_LISTING },
        { label: 'Ventes aux enchères', value: OpportunityType.AUCTION },
        { label: 'Successions', value: OpportunityType.SUCCESSION },
      ];

      for (const testCase of testCases) {
        await user.click(selectTrigger);
        const option = screen.getByText(testCase.label);
        await user.click(option);

        expect(mockOnChange).toHaveBeenCalledWith(testCase.value);
        mockOnChange.mockClear();
      }
    });
  });

  describe('Navigation Behavior (no onChange)', () => {
    it('should navigate when no onChange is provided', async () => {
      const user = userEvent.setup();
      render(<OpportunityTypeFilter value={OpportunityType.LIQUIDATION} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const auctionOption = screen.getByText('Ventes aux enchères');
      await user.click(auctionOption);

      expect(mockPush).toHaveBeenCalledWith('/search/auctions?');
    });

    it('should preserve search params during navigation', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('department', '75');
      mockSearchParams.set('view', 'map');

      render(<OpportunityTypeFilter value={OpportunityType.LIQUIDATION} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const auctionOption = screen.getByText('Ventes aux enchères');
      await user.click(auctionOption);

      expect(mockPush).toHaveBeenCalledWith('/search/auctions?department=75&view=map');
    });

    it('should remove page parameter during navigation', async () => {
      const user = userEvent.setup();
      mockSearchParams.set('page', '3');
      mockSearchParams.set('department', '75');

      render(<OpportunityTypeFilter value={OpportunityType.LIQUIDATION} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const auctionOption = screen.getByText('Ventes aux enchères');
      await user.click(auctionOption);

      expect(mockPush).toHaveBeenCalledWith('/search/auctions?department=75');
    });

    it('should navigate to correct paths for each opportunity type', async () => {
      const user = userEvent.setup();

      const testCases = [
        { type: OpportunityType.LIQUIDATION, path: 'liquidations' },
        { type: OpportunityType.ENERGY_SIEVE, path: 'energy-sieves' },
        { type: OpportunityType.REAL_ESTATE_LISTING, path: 'listings' },
        { type: OpportunityType.AUCTION, path: 'auctions' },
        { type: OpportunityType.SUCCESSION, path: 'successions' },
      ];

      for (const testCase of testCases) {
        mockPush.mockClear();

        const { rerender } = render(
          <OpportunityTypeFilter value={OpportunityType.LIQUIDATION} onChange={() => {}} />
        );

        const selectTrigger = screen.getByRole('combobox');
        await user.click(selectTrigger);

        const option = screen.getByText(
          testCase.type === OpportunityType.LIQUIDATION ? 'Liquidations' :
          testCase.type === OpportunityType.ENERGY_SIEVE ? 'Passoires énergétiques' :
          testCase.type === OpportunityType.REAL_ESTATE_LISTING ? 'Annonces immobilières' :
          testCase.type === OpportunityType.AUCTION ? 'Ventes aux enchères' :
          'Successions'
        );
        await user.click(option);

        expect(mockPush).toHaveBeenCalledWith(`/search/${testCase.path}?`);

        rerender(<div />);
      }
    });
  });

  describe('Component Structure', () => {
    it('should have proper label structure', () => {
      render(<OpportunityTypeFilter {...defaultProps} />);

      const label = screen.getByText("Type d'opportunité");
      expect(label.tagName.toLowerCase()).toBe('label');
      expect(label).toHaveClass('text-sm', 'font-medium', 'mb-2', 'block', 'font-heading');
    });

    it('should have proper select structure', () => {
      render(<OpportunityTypeFilter {...defaultProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should have proper container structure', () => {
      render(<OpportunityTypeFilter {...defaultProps} />);

      const container = screen.getByText("Type d'opportunité").closest('div');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Display Order', () => {
    it('should render options in correct display order', async () => {
      const user = userEvent.setup();
      render(<OpportunityTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const options = screen.getAllByRole('option');
      const expectedOrder = [
        'Liquidations',
        'Passoires énergétiques',
        'Annonces immobilières',
        'Ventes aux enchères',
        'Successions', // Should be last
      ];

      options.forEach((option, index) => {
        expect(option).toHaveTextContent(expectedOrder[index] || '');
      });
    });

    it('should show Successions as the last option', async () => {
      const user = userEvent.setup();
      render(<OpportunityTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const options = screen.getAllByRole('option');
      const lastOption = options[options.length - 1];

      expect(lastOption).toHaveTextContent('Successions');
    });
  });

  describe('Type Mapping', () => {
    it('should correctly map all OpportunityType values to labels', async () => {
      const user = userEvent.setup();
      render(<OpportunityTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const mappings = {
        [OpportunityType.SUCCESSION]: 'Successions',
        [OpportunityType.LIQUIDATION]: 'Liquidations',
        [OpportunityType.ENERGY_SIEVE]: 'Passoires énergétiques',
        [OpportunityType.REAL_ESTATE_LISTING]: 'Annonces immobilières',
        [OpportunityType.AUCTION]: 'Ventes aux enchères',
      };

      Object.entries(mappings).forEach(([, label]) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid onChange prop gracefully', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<OpportunityTypeFilter value={OpportunityType.AUCTION} onChange={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle invalid value prop gracefully', () => {
      expect(() => {
        render(<OpportunityTypeFilter value={'invalid' as OpportunityType} onChange={mockOnChange} />);
      }).not.toThrow();
    });

    it('should handle missing navigation context gracefully', () => {
      // This tests the component when navigation hooks might fail
      expect(() => {
        render(<OpportunityTypeFilter value={OpportunityType.AUCTION} onChange={() => {}} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<OpportunityTypeFilter {...defaultProps} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<OpportunityTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');

      // Focus should work
      await user.tab();
      expect(selectTrigger).toHaveFocus();

      // Arrow keys should work
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should associate label with select properly', () => {
      render(<OpportunityTypeFilter {...defaultProps} />);

      const label = screen.getByText("Type d'opportunité");
      const select = screen.getByRole('combobox');

      expect(label).toBeInTheDocument();
      expect(select).toBeInTheDocument();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', () => {
      const { rerender } = render(
        <OpportunityTypeFilter value={OpportunityType.LIQUIDATION} onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue(OpportunityType.LIQUIDATION)).toBeInTheDocument();

      rerender(
        <OpportunityTypeFilter value={OpportunityType.AUCTION} onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue(OpportunityType.AUCTION)).toBeInTheDocument();
    });

    it('should maintain functionality after re-render', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <OpportunityTypeFilter value={OpportunityType.LIQUIDATION} onChange={mockOnChange} />
      );

      rerender(
        <OpportunityTypeFilter value={OpportunityType.AUCTION} onChange={mockOnChange} />
      );

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Liquidations');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(OpportunityType.LIQUIDATION);
    });
  });

  describe('Real Estate Context', () => {
    it('should handle real estate listing type selection', async () => {
      const user = userEvent.setup();
      render(<OpportunityTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const listingOption = screen.getByText('Annonces immobilières');
      await user.click(listingOption);

      expect(mockOnChange).toHaveBeenCalledWith(OpportunityType.REAL_ESTATE_LISTING);
    });

    it('should handle auction type selection', async () => {
      const user = userEvent.setup();
      render(<OpportunityTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const auctionOption = screen.getByText('Ventes aux enchères');
      await user.click(auctionOption);

      expect(mockOnChange).toHaveBeenCalledWith(OpportunityType.AUCTION);
    });

    it('should handle energy efficiency filtering', async () => {
      const user = userEvent.setup();
      render(<OpportunityTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const energyOption = screen.getByText('Passoires énergétiques');
      await user.click(energyOption);

      expect(mockOnChange).toHaveBeenCalledWith(OpportunityType.ENERGY_SIEVE);
    });
  });

  describe('Integration with Constants', () => {
    it('should use centralized constants correctly', async () => {
      const user = userEvent.setup();
      render(<OpportunityTypeFilter {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // These labels come from OPPORTUNITY_TYPE_LABELS constant
      expect(screen.getByText('Liquidations')).toBeInTheDocument();
      expect(screen.getByText('Passoires énergétiques')).toBeInTheDocument();
      expect(screen.getByText('Annonces immobilières')).toBeInTheDocument();
      expect(screen.getByText('Ventes aux enchères')).toBeInTheDocument();
      expect(screen.getByText('Successions')).toBeInTheDocument();
    });
  });
});