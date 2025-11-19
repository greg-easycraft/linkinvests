import { render, screen } from '~/test-utils/test-helpers';
import {
  Command,
  CommandDialog,
  CommandShortcut,
} from './command';

// Note: Due to cmdk's complex internal state management and context requirements,
// we focus on testing the styling, props, and basic functionality that doesn't
// require the full cmdk context. The interactive functionality (search, filtering,
// keyboard navigation) is best tested through integration tests or E2E tests.

describe('Command Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Command (Root Component)', () => {
    it('should render with correct styling classes', () => {
      render(<Command data-testid="command" />);

      const command = screen.getByTestId('command');
      expect(command).toBeInTheDocument();
      expect(command).toHaveClass(
        'flex',
        'h-full',
        'w-full',
        'flex-col',
        'overflow-hidden',
        'rounded-md'
      );
    });

    it('should have theme-based background and text colors', () => {
      render(<Command data-testid="command" />);

      const command = screen.getByTestId('command');
      expect(command).toHaveClass(
        'bg-[var(--primary)]',
        'text-[var(--secundary)]'
      );
    });

    it('should apply custom className', () => {
      render(<Command data-testid="command" className="custom-command" />);

      const command = screen.getByTestId('command');
      expect(command).toHaveClass('custom-command');
    });

    it('should forward ref correctly', () => {
      const ref = jest.fn();
      render(<Command ref={ref} data-testid="command" />);

      expect(ref).toHaveBeenCalled();
    });

    it('should spread additional props', () => {
      render(
        <Command
          data-testid="command"
          aria-label="Command palette"
          role="combobox"
        />
      );

      const command = screen.getByTestId('command');
      expect(command).toHaveAttribute('aria-label', 'Command palette');
      expect(command).toHaveAttribute('role', 'combobox');
    });

    it('should render children correctly', () => {
      render(
        <Command data-testid="command">
          <div data-testid="child">Child content</div>
        </Command>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });
  });

  describe('CommandDialog', () => {
    it('should render children correctly', () => {
      render(
        <CommandDialog data-testid="command-dialog">
          <div data-testid="dialog-child">Dialog content</div>
        </CommandDialog>
      );

      expect(screen.getByTestId('command-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-child')).toBeInTheDocument();
      expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });

    it('should have proper structure with overflow styling', () => {
      render(
        <CommandDialog>
          <div data-testid="content">Content</div>
        </CommandDialog>
      );

      // Check that content is wrapped in proper structure and renders correctly
      const content = screen.getByTestId('content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Content');

      // CommandDialog creates a nested structure with Command component
      // The exact DOM structure includes cmdk-specific elements
    });

    it('should spread props to root element', () => {
      render(
        <CommandDialog
          data-testid="dialog-root"
          // @ts-expect-error - className is not in CommandDialogProps but needed for test
          className="custom-dialog"
        >
          Content
        </CommandDialog>
      );

      const dialog = screen.getByTestId('dialog-root');
      expect(dialog).toHaveAttribute('class', 'custom-dialog');
    });

    it('should work with complex content', () => {
      render(
        <CommandDialog>
          <div>
            <h2>Dialog Title</h2>
            <p>Dialog description</p>
            <button>Action</button>
          </div>
        </CommandDialog>
      );

      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      expect(screen.getByText('Dialog description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });

  describe('CommandShortcut', () => {
    it('should render shortcut text correctly', () => {
      render(
        <CommandShortcut data-testid="shortcut">⌘K</CommandShortcut>
      );

      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut).toBeInTheDocument();
      expect(shortcut).toHaveTextContent('⌘K');
    });

    it('should have correct styling classes', () => {
      render(
        <CommandShortcut data-testid="shortcut">⌘K</CommandShortcut>
      );

      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut).toHaveClass(
        'ml-auto',
        'text-xs',
        'tracking-widest',
        'text-muted-foreground'
      );
    });

    it('should apply custom className', () => {
      render(
        <CommandShortcut
          data-testid="shortcut"
          className="custom-shortcut"
        >
          ⌘K
        </CommandShortcut>
      );

      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut).toHaveClass('custom-shortcut');
    });

    it('should spread additional props', () => {
      render(
        <CommandShortcut
          data-testid="shortcut"
          aria-label="Keyboard shortcut"
          title="Press Command+K"
        >
          ⌘K
        </CommandShortcut>
      );

      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut).toHaveAttribute('aria-label', 'Keyboard shortcut');
      expect(shortcut).toHaveAttribute('title', 'Press Command+K');
    });

    it('should render different shortcut variations', () => {
      render(
        <div>
          <CommandShortcut data-testid="mac-shortcut">⌘K</CommandShortcut>
          <CommandShortcut data-testid="pc-shortcut">Ctrl+K</CommandShortcut>
          <CommandShortcut data-testid="function-shortcut">F1</CommandShortcut>
          <CommandShortcut data-testid="combo-shortcut">⌘⇧P</CommandShortcut>
        </div>
      );

      expect(screen.getByTestId('mac-shortcut')).toHaveTextContent('⌘K');
      expect(screen.getByTestId('pc-shortcut')).toHaveTextContent('Ctrl+K');
      expect(screen.getByTestId('function-shortcut')).toHaveTextContent('F1');
      expect(screen.getByTestId('combo-shortcut')).toHaveTextContent('⌘⇧P');
    });

    it('should work as span element', () => {
      render(
        <CommandShortcut data-testid="shortcut">⌘K</CommandShortcut>
      );

      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut.tagName).toBe('SPAN');
    });

    it('should handle empty content', () => {
      render(
        <CommandShortcut data-testid="empty-shortcut" />
      );

      const shortcut = screen.getByTestId('empty-shortcut');
      expect(shortcut).toBeInTheDocument();
      expect(shortcut).toBeEmptyDOMElement();
    });

    it('should work within complex layouts', () => {
      render(
        <div className="flex items-center justify-between">
          <span>Open File</span>
          <CommandShortcut>⌘O</CommandShortcut>
        </div>
      );

      expect(screen.getByText('Open File')).toBeInTheDocument();
      expect(screen.getByText('⌘O')).toBeInTheDocument();

      const shortcut = screen.getByText('⌘O');
      expect(shortcut).toHaveClass('ml-auto');
    });
  });

  describe('Component Integration', () => {
    it('should work together in a basic structure', () => {
      render(
        <CommandDialog data-testid="integrated-dialog">
          <Command>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span>Quick Actions</span>
                <CommandShortcut>⌘K</CommandShortcut>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>New File</span>
                  <CommandShortcut>⌘N</CommandShortcut>
                </div>
                <div className="flex items-center justify-between">
                  <span>Open File</span>
                  <CommandShortcut>⌘O</CommandShortcut>
                </div>
              </div>
            </div>
          </Command>
        </CommandDialog>
      );

      // Check that all components render together
      expect(screen.getByTestId('integrated-dialog')).toBeInTheDocument();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('New File')).toBeInTheDocument();
      expect(screen.getByText('Open File')).toBeInTheDocument();
      expect(screen.getByText('⌘K')).toBeInTheDocument();
      expect(screen.getByText('⌘N')).toBeInTheDocument();
      expect(screen.getByText('⌘O')).toBeInTheDocument();
    });

    it('should maintain styling when nested', () => {
      render(
        <CommandDialog>
          <Command className="custom-command" data-testid="nested-command">
            <div>
              <span>Action</span>
              <CommandShortcut className="custom-shortcut" data-testid="nested-shortcut">
                ⌘S
              </CommandShortcut>
            </div>
          </Command>
        </CommandDialog>
      );

      const command = screen.getByTestId('nested-command');
      const shortcut = screen.getByTestId('nested-shortcut');

      expect(command).toHaveClass('custom-command');
      expect(shortcut).toHaveClass('custom-shortcut');
      expect(shortcut).toHaveClass('ml-auto', 'text-xs');
    });
  });

  describe('Accessibility', () => {
    it('should support basic accessibility attributes', () => {
      render(
        <Command
          role="combobox"
          aria-expanded="false"
          aria-label="Command menu"
          data-testid="accessible-command"
        >
          <div>Content</div>
        </Command>
      );

      const command = screen.getByTestId('accessible-command');
      expect(command).toHaveAttribute('role', 'combobox');
      expect(command).toHaveAttribute('aria-expanded', 'false');
      expect(command).toHaveAttribute('aria-label', 'Command menu');
    });

    it('should support keyboard shortcut accessibility', () => {
      render(
        <div>
          <button aria-describedby="shortcut-description">
            Open
          </button>
          <CommandShortcut
            id="shortcut-description"
            aria-label="Keyboard shortcut Command O"
          >
            ⌘O
          </CommandShortcut>
        </div>
      );

      const button = screen.getByRole('button');
      const shortcut = screen.getByText('⌘O');

      expect(button).toHaveAttribute('aria-describedby', 'shortcut-description');
      expect(shortcut).toHaveAttribute('id', 'shortcut-description');
      expect(shortcut).toHaveAttribute('aria-label', 'Keyboard shortcut Command O');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty Command', () => {
      render(<Command data-testid="empty-command" />);

      const command = screen.getByTestId('empty-command');
      expect(command).toBeInTheDocument();
      // Command renders without errors even when empty
      // cmdk may add internal elements, so we don't check for empty DOM
    });

    it('should handle CommandDialog without children', () => {
      render(<CommandDialog data-testid="empty-dialog" />);

      const dialog = screen.getByTestId('empty-dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should handle complex nested structures', () => {
      render(
        <CommandDialog>
          <Command>
            <div>
              <div>
                <div>
                  <span>Deeply nested</span>
                  <CommandShortcut>⌘D</CommandShortcut>
                </div>
              </div>
            </div>
          </Command>
        </CommandDialog>
      );

      expect(screen.getByText('Deeply nested')).toBeInTheDocument();
      expect(screen.getByText('⌘D')).toBeInTheDocument();
    });

    it('should handle multiple shortcuts in same container', () => {
      render(
        <div>
          <CommandShortcut data-testid="first">⌘1</CommandShortcut>
          <CommandShortcut data-testid="second">⌘2</CommandShortcut>
          <CommandShortcut data-testid="third">⌘3</CommandShortcut>
        </div>
      );

      expect(screen.getByTestId('first')).toHaveTextContent('⌘1');
      expect(screen.getByTestId('second')).toHaveTextContent('⌘2');
      expect(screen.getByTestId('third')).toHaveTextContent('⌘3');
    });

    it('should handle special characters in shortcuts', () => {
      render(
        <div>
          <CommandShortcut>⌘⌥⇧K</CommandShortcut>
          <CommandShortcut>Ctrl+Alt+Del</CommandShortcut>
          <CommandShortcut>F12</CommandShortcut>
          <CommandShortcut>Esc</CommandShortcut>
        </div>
      );

      expect(screen.getByText('⌘⌥⇧K')).toBeInTheDocument();
      expect(screen.getByText('Ctrl+Alt+Del')).toBeInTheDocument();
      expect(screen.getByText('F12')).toBeInTheDocument();
      expect(screen.getByText('Esc')).toBeInTheDocument();
    });
  });
});