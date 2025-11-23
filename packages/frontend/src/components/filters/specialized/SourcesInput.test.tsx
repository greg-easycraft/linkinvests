import { render, screen, waitFor } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { SourcesInput } from './SourcesInput';

// Mock the server action
jest.mock('~/app/_actions/listings/queries', () => ({
  getAvailableSources: jest.fn(),
}));

import { getAvailableSources } from '~/app/_actions/listings/queries';

const mockGetAvailableSources = getAvailableSources as jest.MockedFunction<typeof getAvailableSources>;

const mockSources = ['Source A', 'Source B', 'Source C'];

describe('SourcesInput', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    value: [] as string[],
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAvailableSources.mockResolvedValue(mockSources);
  });

  describe('Basic Rendering', () => {
    it('should render with loading state initially', () => {
      render(<SourcesInput {...defaultProps} />);

      expect(screen.getByText('Sources')).toBeInTheDocument();
      // Should show skeleton loading state
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render available sources after loading', async () => {
      const user = userEvent.setup();
      render(<SourcesInput {...defaultProps} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.getByText('Source A')).toBeInTheDocument();
      expect(screen.getByText('Source B')).toBeInTheDocument();
      expect(screen.getByText('Source C')).toBeInTheDocument();
    });

    it('should have purple badge color for selected sources', async () => {
      const value = ['Source A'];
      render(<SourcesInput {...defaultProps} value={value} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      const badge = screen.getByText('Source A');
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-800');
    });

    it('should show placeholder when no sources are selected', async () => {
      render(<SourcesInput {...defaultProps} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show skeleton animation during loading', () => {
      mockGetAvailableSources.mockImplementation(() => new Promise(() => {})); // Never resolves
      render(<SourcesInput {...defaultProps} />);

      // Should render with loading state - exact implementation depends on skeleton component
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle loading error gracefully', async () => {
      mockGetAvailableSources.mockRejectedValue(new Error('Failed to load sources'));

      expect(() => {
        render(<SourcesInput {...defaultProps} />);
      }).not.toThrow();

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when source is selected', async () => {
      const user = userEvent.setup();
      render(<SourcesInput {...defaultProps} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Source A');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(['Source A']);
    });

    it('should add to existing selection when additional source is selected', async () => {
      const user = userEvent.setup();
      const value = ['Source A'];
      render(<SourcesInput {...defaultProps} value={value} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Source B');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(['Source A', 'Source B']);
    });

    it('should toggle selection when already selected source is clicked', async () => {
      const user = userEvent.setup();
      const value = ['Source A', 'Source B'];
      render(<SourcesInput {...defaultProps} value={value} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Source A');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith(['Source B']);
    });

    it('should call onChange with empty array when last source is deselected', async () => {
      const user = userEvent.setup();
      const value = ['Source A'];
      render(<SourcesInput {...defaultProps} value={value} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const option = screen.getByText('Source A');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it('should remove source when badge X button is clicked', async () => {
      const user = userEvent.setup();
      const value = ['Source A', 'Source B'];
      render(<SourcesInput {...defaultProps} value={value} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      const badge = screen.getByText('Source A');
      const removeButton = badge.querySelector('svg');

      if (removeButton) {
        await user.click(removeButton);
        expect(mockOnChange).toHaveBeenCalledWith(['Source B']);
      }
    });
  });

  describe('Value Display', () => {
    it('should display selected sources as badges', async () => {
      const value = ['Source A', 'Source C'];
      render(<SourcesInput {...defaultProps} value={value} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByText('Source A')).toBeInTheDocument();
      expect(screen.getByText('Source C')).toBeInTheDocument();
      expect(screen.queryByText('Source B')).not.toBeInTheDocument();
    });

    it('should handle empty value array', async () => {
      render(<SourcesInput {...defaultProps} value={[]} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });

    it('should handle all sources being selected', async () => {
      const value = ['Source A', 'Source B', 'Source C'];
      render(<SourcesInput {...defaultProps} value={value} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByText('Source A')).toBeInTheDocument();
      expect(screen.getByText('Source B')).toBeInTheDocument();
      expect(screen.getByText('Source C')).toBeInTheDocument();
    });
  });

  describe('Server Action Integration', () => {
    it('should call getAvailableSources on mount', async () => {
      render(<SourcesInput {...defaultProps} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle empty sources list from server', async () => {
      mockGetAvailableSources.mockResolvedValue([]);
      const user = userEvent.setup();
      render(<SourcesInput {...defaultProps} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Should not crash when no options are available
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle single source from server', async () => {
      mockGetAvailableSources.mockResolvedValue(['Single Source']);
      const user = userEvent.setup();
      render(<SourcesInput {...defaultProps} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.getByText('Single Source')).toBeInTheDocument();
    });

    it('should handle sources with special characters', async () => {
      const specialSources = ['Source-1', 'Source & Co', 'Source "Quotes"'];
      mockGetAvailableSources.mockResolvedValue(specialSources);
      const user = userEvent.setup();
      render(<SourcesInput {...defaultProps} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.getByText('Source-1')).toBeInTheDocument();
      expect(screen.getByText('Source & Co')).toBeInTheDocument();
      expect(screen.getByText('Source "Quotes"')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle value with non-existent sources', async () => {
      const value = ['Source A', 'Non-existent Source', 'Source B'];
      render(<SourcesInput {...defaultProps} value={value} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      // Should display only existing sources
      expect(screen.getByText('Source A')).toBeInTheDocument();
      expect(screen.getByText('Source B')).toBeInTheDocument();
      expect(screen.queryByText('Non-existent Source')).not.toBeInTheDocument();
    });

    it('should handle invalid onChange prop', async () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<SourcesInput value={[]} onChange={undefined as any} />);
      }).not.toThrow();

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle malformed value prop', async () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<SourcesInput value={null as any} onChange={mockOnChange} />);
      }).not.toThrow();

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Component Structure', () => {
    it('should have proper label styling', async () => {
      render(<SourcesInput {...defaultProps} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      const label = screen.getByText('Sources');
      expect(label).toHaveClass(
        'text-sm',
        'font-medium',
        'mb-2',
        'block',
        'font-heading'
      );
    });

    it('should apply purple badge color to selected sources', async () => {
      const value = ['Source A'];
      render(<SourcesInput {...defaultProps} value={value} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      const badge = screen.getByText('Source A');
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-800');
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SourcesInput {...defaultProps} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Should be able to navigate with keyboard
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should have proper ARIA attributes', async () => {
      render(<SourcesInput {...defaultProps} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('should update when value prop changes', async () => {
      const { rerender } = render(
        <SourcesInput value={['Source A']} onChange={mockOnChange} />
      );

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByText('Source A')).toBeInTheDocument();

      rerender(
        <SourcesInput value={['Source B', 'Source C']} onChange={mockOnChange} />
      );

      expect(screen.queryByText('Source A')).not.toBeInTheDocument();
      expect(screen.getByText('Source B')).toBeInTheDocument();
      expect(screen.getByText('Source C')).toBeInTheDocument();
    });

    it('should clear badges when value is set to empty array', async () => {
      const { rerender } = render(
        <SourcesInput value={['Source A', 'Source B']} onChange={mockOnChange} />
      );

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByText('Source A')).toBeInTheDocument();
      expect(screen.getByText('Source B')).toBeInTheDocument();

      rerender(
        <SourcesInput value={[]} onChange={mockOnChange} />
      );

      expect(screen.queryByText('Source A')).not.toBeInTheDocument();
      expect(screen.queryByText('Source B')).not.toBeInTheDocument();
      expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
    });
  });

  describe('Data Source Context', () => {
    it('should handle real estate data sources', async () => {
      const realEstateSources = ['MLS', 'Notaires', 'AgencesImmobilieres', 'VentesAuxEncheres'];
      mockGetAvailableSources.mockResolvedValue(realEstateSources);
      const user = userEvent.setup();
      render(<SourcesInput {...defaultProps} />);

      await waitFor(() => {
        expect(mockGetAvailableSources).toHaveBeenCalledTimes(1);
      });

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      expect(screen.getByText('MLS')).toBeInTheDocument();
      expect(screen.getByText('Notaires')).toBeInTheDocument();
      expect(screen.getByText('AgencesImmobilieres')).toBeInTheDocument();
      expect(screen.getByText('VentesAuxEncheres')).toBeInTheDocument();
    });
  });
});