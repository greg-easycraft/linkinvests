import { render, screen, waitFor, fireEvent } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { DepartmentsInput } from './departments-input';

// Mock the departments module
jest.mock('~/constants/departments', () => ({
  searchDepartments: jest.fn(),
  getDepartmentsByIds: jest.fn(),
}));

// Mock the types module
jest.mock('~/types/filters', () => ({
  DepartmentOption: {},
}));

import { searchDepartments, getDepartmentsByIds } from '~/constants/departments';

const mockSearchDepartments = searchDepartments as jest.MockedFunction<typeof searchDepartments>;
const mockGetDepartmentsByIds = getDepartmentsByIds as jest.MockedFunction<typeof getDepartmentsByIds>;

describe('DepartmentsInput Component', () => {
  const mockDepartments = [
    { id: '01', name: 'Ain', label: '01 - Ain' },
    { id: '02', name: 'Aisne', label: '02 - Aisne' },
    { id: '13', name: 'Bouches-du-Rhône', label: '13 - Bouches du Rhône' },
    { id: '75', name: 'Paris', label: '75 - Paris' },
    { id: '69', name: 'Rhône', label: '69 - Rhône' },
  ];

  const defaultProps = {
    value: [],
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchDepartments.mockReturnValue(mockDepartments);
    mockGetDepartmentsByIds.mockReturnValue([]);
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Rechercher par numéro ou nom...');
      expect(input).toHaveValue('');
    });

    it('should render with custom placeholder', () => {
      render(<DepartmentsInput {...defaultProps} placeholder="Rechercher un département" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Rechercher un département');
    });

    it('should apply custom className', () => {
      render(<DepartmentsInput {...defaultProps} className="custom-departments-input" />);

      const container = screen.getByRole('textbox').closest('.relative');
      expect(container).toHaveClass('custom-departments-input');
    });

    it('should render in disabled state', () => {
      render(<DepartmentsInput {...defaultProps} disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should show chevron icon', () => {
      render(<DepartmentsInput {...defaultProps} />);

      const chevron = screen.getByRole('textbox').parentElement?.querySelector('svg');
      expect(chevron).toBeInTheDocument();
      expect(chevron).toHaveClass('h-4', 'w-4', 'text-muted-foreground');
    });

    it('should have correct input styling', () => {
      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(
        'w-full',
        'px-3',
        'py-2',
        'pr-8',
        'text-sm',
        'rounded-md',
        'border-2',
        'border-[var(--primary)]',
        'bg-[var(--secundary)]',
        'text-foreground'
      );
    });
  });

  describe('Selected Departments Display', () => {
    it('should display selected departments as badges', () => {
      const selectedDepartments = [
        { id: '01', name: 'Ain', label: '01 - Ain' },
        { id: '75', name: 'Paris', label: '75 - Paris' },
      ];
      mockGetDepartmentsByIds.mockReturnValue(selectedDepartments);

      render(<DepartmentsInput value={['01', '75']} onChange={jest.fn()} />);

      expect(screen.getByText('01')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('should show remove buttons for each badge', () => {
      const selectedDepartments = [
        { id: '01', name: 'Ain', label: '01 - Ain' },
        { id: '75', name: 'Paris', label: '75 - Paris' },
      ];
      mockGetDepartmentsByIds.mockReturnValue(selectedDepartments);

      render(<DepartmentsInput value={['01', '75']} onChange={jest.fn()} />);

      const removeButtons = screen.getAllByLabelText(/Supprimer le département/);
      expect(removeButtons).toHaveLength(2);
      expect(screen.getByLabelText('Supprimer le département 01')).toBeInTheDocument();
      expect(screen.getByLabelText('Supprimer le département 75')).toBeInTheDocument();
    });

    it('should not render badges container when no departments selected', () => {
      mockGetDepartmentsByIds.mockReturnValue([]);

      render(<DepartmentsInput {...defaultProps} />);

      const badgeContainer = screen.queryByText('01');
      expect(badgeContainer).not.toBeInTheDocument();
    });

    it('should show helper text with count', () => {
      const selectedDepartments = [
        { id: '01', name: 'Ain', label: '01 - Ain' },
        { id: '75', name: 'Paris', label: '75 - Paris' },
      ];
      mockGetDepartmentsByIds.mockReturnValue(selectedDepartments);

      render(<DepartmentsInput value={['01', '75']} onChange={jest.fn()} />);

      expect(screen.getByText('2 départements sélectionnés')).toBeInTheDocument();
    });

    it('should show singular form for single department', () => {
      const selectedDepartments = [{ id: '01', name: 'Ain', label: '01 - Ain' }];
      mockGetDepartmentsByIds.mockReturnValue(selectedDepartments);

      render(<DepartmentsInput value={['01']} onChange={jest.fn()} />);

      expect(screen.getByText('1 département sélectionné')).toBeInTheDocument();
    });

    it('should disable remove buttons when component is disabled', () => {
      const selectedDepartments = [{ id: '01', name: 'Ain', label: '01 - Ain' }];
      mockGetDepartmentsByIds.mockReturnValue(selectedDepartments);

      render(<DepartmentsInput value={['01']} onChange={jest.fn()} disabled />);

      const removeButton = screen.getByLabelText('Supprimer le département 01');
      expect(removeButton).toBeDisabled();
    });
  });

  describe('Search and Dropdown Functionality', () => {
    it('should open dropdown when input is focused', async () => {
      const user = userEvent.setup();
      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('01 - Ain')).toBeInTheDocument();
        expect(screen.getByText('75 - Paris')).toBeInTheDocument();
      });
    });

    it('should search departments when typing', async () => {
      const user = userEvent.setup();
      const filteredDepartments = [{ id: '75', name: 'Paris', label: '75 - Paris' }];
      mockSearchDepartments.mockReturnValue(filteredDepartments);

      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Paris');

      expect(mockSearchDepartments).toHaveBeenCalledWith('Paris');

      await waitFor(() => {
        expect(screen.getByText('75 - Paris')).toBeInTheDocument();
        expect(screen.queryByText('01 - Ain')).not.toBeInTheDocument();
      });
    });

    it('should filter out already selected departments from dropdown', async () => {
      const user = userEvent.setup();
      const selectedDepartments = [{ id: '01', name: 'Ain', label: '01 - Ain' }];
      mockGetDepartmentsByIds.mockReturnValue(selectedDepartments);

      render(<DepartmentsInput value={['01']} onChange={jest.fn()} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.queryByText('01 - Ain')).not.toBeInTheDocument();
        expect(screen.getByText('02 - Aisne')).toBeInTheDocument();
      });
    });

    it('should rotate chevron icon when dropdown opens', async () => {
      const user = userEvent.setup();
      render(<DepartmentsInput {...defaultProps} />);

      const chevron = screen.getByRole('textbox').parentElement?.querySelector('svg');
      expect(chevron).not.toHaveClass('rotate-180');

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(chevron).toHaveClass('rotate-180');
      });
    });

    it('should show appropriate message when no results found', async () => {
      const user = userEvent.setup();
      mockSearchDepartments.mockReturnValue([]);

      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('Aucun département trouvé')).toBeInTheDocument();
      });
    });

    it('should show search prompt when input is empty and dropdown is open', async () => {
      const user = userEvent.setup();
      mockSearchDepartments.mockReturnValue([]);

      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Tapez pour rechercher')).toBeInTheDocument();
      });
    });
  });

  describe('Department Selection', () => {
    it('should select department when clicked', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      render(<DepartmentsInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        const option = screen.getByText('01 - Ain');
        expect(option).toBeInTheDocument();
      });

      const option = screen.getByText('01 - Ain');
      await user.click(option);

      expect(onChange).toHaveBeenCalledWith(['01']);
    });

    it('should close dropdown after selection', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      render(<DepartmentsInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        const option = screen.getByText('01 - Ain');
        expect(option).toBeInTheDocument();
      });

      const option = screen.getByText('01 - Ain');
      await user.click(option);

      await waitFor(() => {
        expect(screen.queryByText('01 - Ain')).not.toBeInTheDocument();
      });
    });

    it('should clear search query after selection', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      render(<DepartmentsInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Paris');

      await waitFor(() => {
        const option = screen.getByText('75 - Paris');
        expect(option).toBeInTheDocument();
      });

      const option = screen.getByText('75 - Paris');
      await user.click(option);

      expect(input).toHaveValue('');
    });

    it('should maintain focus on input after selection', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      render(<DepartmentsInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        const option = screen.getByText('01 - Ain');
        expect(option).toBeInTheDocument();
      });

      const option = screen.getByText('01 - Ain');
      await user.click(option);

      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });

    it('should not add duplicate departments', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      const selectedDepartments = [{ id: '01', name: 'Ain', label: '01 - Ain' }];
      mockGetDepartmentsByIds.mockReturnValue(selectedDepartments);

      render(<DepartmentsInput value={['01']} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      // Department 01 should not appear in dropdown since it's already selected
      await waitFor(() => {
        expect(screen.queryByText('01 - Ain')).not.toBeInTheDocument();
        expect(screen.getByText('02 - Aisne')).toBeInTheDocument();
      });
    });
  });

  describe('Department Removal', () => {
    it('should remove department when X button is clicked', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      const selectedDepartments = [
        { id: '01', name: 'Ain', label: '01 - Ain' },
        { id: '75', name: 'Paris', label: '75 - Paris' },
      ];
      mockGetDepartmentsByIds.mockReturnValue(selectedDepartments);

      render(<DepartmentsInput value={['01', '75']} onChange={onChange} />);

      const removeButton = screen.getByLabelText('Supprimer le département 01');
      await user.click(removeButton);

      expect(onChange).toHaveBeenCalledWith(['75']);
    });

    it('should remove last department when backspace is pressed with empty input', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      const selectedDepartments = [
        { id: '01', name: 'Ain', label: '01 - Ain' },
        { id: '75', name: 'Paris', label: '75 - Paris' },
      ];
      mockGetDepartmentsByIds.mockReturnValue(selectedDepartments);

      render(<DepartmentsInput value={['01', '75']} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('{Backspace}');

      expect(onChange).toHaveBeenCalledWith(['01']);
    });

    it('should not remove department when backspace is pressed with text in input', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      const selectedDepartments = [{ id: '01', name: 'Ain', label: '01 - Ain' }];
      mockGetDepartmentsByIds.mockReturnValue(selectedDepartments);

      render(<DepartmentsInput value={['01']} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'search text');
      await user.keyboard('{Backspace}');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate options with arrow keys', async () => {
      const user = userEvent.setup();
      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('01 - Ain')).toBeInTheDocument();
      });

      // Navigate down
      await user.keyboard('{ArrowDown}');

      const firstOption = screen.getByText('01 - Ain');
      expect(firstOption.closest('button')).toHaveClass('bg-accent', 'text-accent-foreground');

      // Navigate down again
      await user.keyboard('{ArrowDown}');

      const secondOption = screen.getByText('02 - Aisne');
      expect(secondOption.closest('button')).toHaveClass('bg-accent', 'text-accent-foreground');
    });

    it('should select highlighted option with Enter', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      render(<DepartmentsInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('01 - Ain')).toBeInTheDocument();
      });

      // Navigate and select with Enter
      await user.keyboard('{ArrowDown}{Enter}');

      expect(onChange).toHaveBeenCalledWith(['01']);
    });

    it('should close dropdown with Escape key', async () => {
      const user = userEvent.setup();
      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('01 - Ain')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('01 - Ain')).not.toBeInTheDocument();
      });
    });

    it('should clear search and blur input on Escape', async () => {
      const user = userEvent.setup();
      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'search text');
      await user.keyboard('{Escape}');

      expect(input).toHaveValue('');
      expect(input).not.toHaveFocus();
    });

    it('should handle arrow up navigation', async () => {
      const user = userEvent.setup();
      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('01 - Ain')).toBeInTheDocument();
      });

      // Navigate up (should go to last item)
      await user.keyboard('{ArrowUp}');

      const lastOption = screen.getByText('69 - Rhône');
      expect(lastOption.closest('button')).toHaveClass('bg-accent', 'text-accent-foreground');
    });

    it('should cycle through options when reaching bounds', async () => {
      const user = userEvent.setup();
      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('01 - Ain')).toBeInTheDocument();
      });

      // Navigate down to last item
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');

      let lastOption = screen.getByText('69 - Rhône');
      expect(lastOption.closest('button')).toHaveClass('bg-accent', 'text-accent-foreground');

      // Navigate down again (should cycle to first)
      await user.keyboard('{ArrowDown}');

      const firstOption = screen.getByText('01 - Ain');
      expect(firstOption.closest('button')).toHaveClass('bg-accent', 'text-accent-foreground');
    });
  });

  describe('Click Outside Behavior', () => {
    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <DepartmentsInput {...defaultProps} />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('01 - Ain')).toBeInTheDocument();
      });

      const outside = screen.getByTestId('outside');
      fireEvent.mouseDown(outside);

      await waitFor(() => {
        expect(screen.queryByText('01 - Ain')).not.toBeInTheDocument();
      });
    });

    it('should clear search query when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <DepartmentsInput {...defaultProps} />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'search text');

      const outside = screen.getByTestId('outside');
      fireEvent.mouseDown(outside);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });
  });

  describe('Scroll Behavior', () => {
    it('should scroll highlighted item into view', async () => {
      const user = userEvent.setup();

      // Mock scrollIntoView
      const mockScrollIntoView = jest.fn();
      HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('01 - Ain')).toBeInTheDocument();
      });

      // Navigate down
      await user.keyboard('{ArrowDown}');

      // Should call scrollIntoView
      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'nearest',
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for remove buttons', () => {
      const selectedDepartments = [{ id: '01', name: 'Ain', label: '01 - Ain' }];
      mockGetDepartmentsByIds.mockReturnValue(selectedDepartments);

      render(<DepartmentsInput value={['01']} onChange={jest.fn()} />);

      const removeButton = screen.getByLabelText('Supprimer le département 01');
      expect(removeButton).toHaveAttribute('type', 'button');
    });

    it('should be keyboard accessible', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<DepartmentsInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');

      // Tab to input
      await user.tab();
      expect(input).toHaveFocus();

      // Open dropdown and select with keyboard
      await user.keyboard('{ArrowDown}{Enter}');

      expect(onChange).toHaveBeenCalledWith(['01']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle controlled component updates', () => {
      const selectedDepartments1 = [{ id: '01', name: 'Ain', label: '01 - Ain' }];
      const selectedDepartments2 = [
        { id: '01', name: 'Ain', label: '01 - Ain' },
        { id: '75', name: 'Paris', label: '75 - Paris' },
      ];

      mockGetDepartmentsByIds
        .mockReturnValueOnce(selectedDepartments1)
        .mockReturnValueOnce(selectedDepartments2);

      const { rerender } = render(<DepartmentsInput value={['01']} onChange={jest.fn()} />);

      expect(screen.getByText('01')).toBeInTheDocument();

      rerender(<DepartmentsInput value={['01', '75']} onChange={jest.fn()} />);

      expect(screen.getByText('01')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('should handle empty search results gracefully', async () => {
      const user = userEvent.setup();
      mockSearchDepartments.mockReturnValue([]);

      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'xyz');

      await waitFor(() => {
        expect(screen.getByText('Aucun département trouvé')).toBeInTheDocument();
      });
    });

    it('should handle invalid department IDs in value prop', () => {
      mockGetDepartmentsByIds.mockReturnValue([]);

      expect(() => {
        render(<DepartmentsInput value={['invalid-id']} onChange={jest.fn()} />);
      }).not.toThrow();

      // Should not show any badges for invalid IDs
      expect(screen.queryByText('invalid-id')).not.toBeInTheDocument();
    });

    it('should handle very long search queries', async () => {
      const user = userEvent.setup();
      const longQuery = 'a'.repeat(1000);
      mockSearchDepartments.mockReturnValue([]);

      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, longQuery);

      expect(mockSearchDepartments).toHaveBeenCalledWith(longQuery);
      expect(input).toHaveValue(longQuery);
    });

    it('should handle special characters in search', async () => {
      const user = userEvent.setup();
      const specialQuery = 'Côte d\'Or';
      mockSearchDepartments.mockReturnValue([]);

      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, specialQuery);

      expect(mockSearchDepartments).toHaveBeenCalledWith(specialQuery);
    });

    it('should handle rapid typing without errors', async () => {
      const user = userEvent.setup();
      mockSearchDepartments.mockReturnValue(mockDepartments);

      render(<DepartmentsInput {...defaultProps} />);

      const input = screen.getByRole('textbox');

      // Type rapidly
      await user.type(input, 'Paris', { delay: 1 });

      // Should handle without errors
      expect(input).toHaveValue('Paris');
      expect(mockSearchDepartments).toHaveBeenCalled();
    });

    it('should maintain search state during component updates', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<DepartmentsInput value={[]} onChange={jest.fn()} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'search text');

      // Rerender with new props
      rerender(<DepartmentsInput value={['01']} onChange={jest.fn()} />);

      // Search state should be maintained
      expect(input).toHaveValue('search text');
    });

    it('should handle Enter key when no option is highlighted', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      render(<DepartmentsInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('01 - Ain')).toBeInTheDocument();
      });

      // Press Enter without highlighting any option
      await user.keyboard('{Enter}');

      // Should not trigger onChange
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should handle Enter key when highlighted index is out of bounds', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();

      render(<DepartmentsInput value={[]} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'nonexistent');

      // This should result in empty filtered departments
      mockSearchDepartments.mockReturnValue([]);

      await waitFor(() => {
        expect(screen.getByText('Aucun département trouvé')).toBeInTheDocument();
      });

      // Try to select with Enter when no valid options
      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Component Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = render(<DepartmentsInput {...defaultProps} />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});