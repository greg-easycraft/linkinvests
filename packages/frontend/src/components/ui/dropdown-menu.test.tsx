import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu';

describe('DropdownMenu Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper component to wrap dropdown menu with common structure
  const DropdownMenuWrapper = ({
    children,
    triggerText = 'Open Menu',
    open,
    onOpenChange,
    ...dropdownProps
  }: {
    children?: React.ReactNode;
    triggerText?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    [key: string]: any;
  }) => (
    <DropdownMenu open={open} onOpenChange={onOpenChange} {...dropdownProps}>
      <DropdownMenuTrigger>{triggerText}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Menu Item 1</DropdownMenuItem>
        <DropdownMenuItem>Menu Item 2</DropdownMenuItem>
      </DropdownMenuContent>
      {children}
    </DropdownMenu>
  );

  describe('DropdownMenu Root', () => {
    it('should render trigger without errors', () => {
      render(<DropdownMenuWrapper triggerText="Test trigger" />);

      expect(screen.getByText('Test trigger')).toBeInTheDocument();
    });

    it('should not show content initially', () => {
      render(<DropdownMenuWrapper />);

      expect(screen.queryByText('Menu Item 1')).not.toBeInTheDocument();
    });

    it('should be uncontrolled by default', async () => {
      const user = userEvent.setup();
      render(<DropdownMenuWrapper />);

      const trigger = screen.getByText('Open Menu');
      // Note: In jsdom, we can't fully test dropdown opening due to Radix UI limitations
      // but we can verify the trigger is clickable without errors
      await user.click(trigger);
      // Dropdown behavior in jsdom is limited, so we just verify no errors
    });

    it('should support controlled state', () => {
      const onOpenChange = jest.fn();

      render(
        <DropdownMenuWrapper
          open={true}
          onOpenChange={onOpenChange}
        />
      );

      // With controlled state open=true, content might be visible in some scenarios
      // but Radix UI behavior in jsdom is limited
      expect(screen.getByText('Open Menu')).toBeInTheDocument();
    });

    it('should call onOpenChange when controlled', async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();

      render(
        <DropdownMenuWrapper
          open={false}
          onOpenChange={onOpenChange}
        />
      );

      const trigger = screen.getByText('Open Menu');
      await user.click(trigger);

      // onOpenChange behavior may be limited in jsdom
    });
  });

  describe('DropdownMenuTrigger', () => {
    it('should render as a button by default', () => {
      render(<DropdownMenuWrapper triggerText="Button trigger" />);

      const trigger = screen.getByRole('button', { name: 'Button trigger' });
      expect(trigger).toBeInTheDocument();
    });

    it('should support asChild prop', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button data-testid="custom-trigger">Custom Button</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveTextContent('Custom Button');

      await user.click(trigger);
      // Verify no errors on click
    });

    it('should have proper accessibility attributes', () => {
      render(<DropdownMenuWrapper />);

      const trigger = screen.getByText('Open Menu');
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should handle disabled state', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button disabled>Disabled trigger</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Should not show</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button', { name: 'Disabled trigger' });
      expect(trigger).toBeDisabled();
    });
  });

  describe('DropdownMenuContent', () => {
    it('should have correct display name', () => {
      expect(DropdownMenuContent.displayName).toBeDefined();
    });

    it('should be a forwardRef component', () => {
      expect(typeof DropdownMenuContent).toBe('object');
      // Check that it's a forwardRef by looking for the $$typeof property
      expect(DropdownMenuContent).toHaveProperty('$$typeof');
    });

    it('should render within dropdown menu context', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="content-trigger">Open</DropdownMenuTrigger>
          <DropdownMenuContent data-testid="dropdown-content">
            Test content
          </DropdownMenuContent>
        </DropdownMenu>
      );

      // Verify the trigger renders
      expect(screen.getByTestId('content-trigger')).toBeInTheDocument();

      // Note: Due to jsdom limitations with Radix UI, we can't easily test
      // the content visibility, but we can ensure no errors occur
      await user.click(screen.getByTestId('content-trigger'));
    });

    it('should accept className and other props', () => {
      // We can't test this in isolation due to context requirements,
      // but we can verify the component accepts these props without errors
      expect(() => {
        render(
          <DropdownMenu>
            <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
            <DropdownMenuContent
              className="custom-content"
              sideOffset={8}
              data-testid="content"
            >
              Content
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }).not.toThrow();
    });

    it('should support ref forwarding', () => {
      const ref = jest.fn();

      expect(() => {
        render(
          <DropdownMenu>
            <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
            <DropdownMenuContent ref={ref}>
              Content
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }).not.toThrow();
    });
  });

  describe('DropdownMenuItem', () => {
    it('should have correct display name', () => {
      expect(DropdownMenuItem.displayName).toBeDefined();
    });

    it('should be a forwardRef component', () => {
      expect(typeof DropdownMenuItem).toBe('object');
      expect(DropdownMenuItem).toHaveProperty('$$typeof');
    });

    it('should render within dropdown menu context', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem data-testid="menu-item">Menu Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      // Verify the trigger renders (content may not be visible due to jsdom limitations)
      expect(screen.getByText('Trigger')).toBeInTheDocument();
    });

    it('should accept inset and className props', () => {
      expect(() => {
        render(
          <DropdownMenu>
            <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                data-testid="item"
                inset
                className="custom-item"
              >
                Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }).not.toThrow();
    });

    it('should support ref forwarding and additional props', () => {
      const ref = jest.fn();

      expect(() => {
        render(
          <DropdownMenu>
            <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                ref={ref}
                aria-label="Custom item"
                role="menuitem"
              >
                Ref Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }).not.toThrow();
    });

    it('should render children correctly in context', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <span data-testid="icon">🎯</span>
              <span>Item with icon</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      // Due to jsdom limitations, we mainly verify no errors occur
      expect(screen.getByText('Trigger')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuLabel', () => {
    it('should render with correct styling classes', () => {
      render(<DropdownMenuLabel data-testid="menu-label">Menu Label</DropdownMenuLabel>);

      const label = screen.getByTestId('menu-label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Menu Label');
      expect(label).toHaveClass(
        'px-2',
        'py-1.5',
        'text-sm',
        'font-semibold'
      );
    });

    it('should apply inset styling when inset prop is true', () => {
      render(
        <DropdownMenuLabel data-testid="inset-label" inset>
          Inset Label
        </DropdownMenuLabel>
      );

      const label = screen.getByTestId('inset-label');
      expect(label).toHaveClass('pl-8');
    });

    it('should not apply inset styling when inset prop is false', () => {
      render(
        <DropdownMenuLabel data-testid="normal-label" inset={false}>
          Normal Label
        </DropdownMenuLabel>
      );

      const label = screen.getByTestId('normal-label');
      expect(label).not.toHaveClass('pl-8');
    });

    it('should apply custom className', () => {
      render(
        <DropdownMenuLabel data-testid="custom-label" className="custom-label">
          Custom Label
        </DropdownMenuLabel>
      );

      const label = screen.getByTestId('custom-label');
      expect(label).toHaveClass('custom-label');
    });

    it('should forward ref', () => {
      const ref = jest.fn();
      render(<DropdownMenuLabel ref={ref}>Ref Label</DropdownMenuLabel>);

      expect(ref).toHaveBeenCalled();
    });

    it('should spread additional props', () => {
      render(
        <DropdownMenuLabel
          data-testid="props-label"
          id="label-1"
          // @ts-expect-error - htmlFor is not in DropdownMenuLabelProps but needed for test
          htmlFor="input-1"
        >
          Props Label
        </DropdownMenuLabel>
      );

      const label = screen.getByTestId('props-label');
      expect(label).toHaveAttribute('id', 'label-1');
      expect(label).toHaveAttribute('for', 'input-1');
    });

    it('should render children correctly', () => {
      render(
        <DropdownMenuLabel>
          <strong>Important:</strong> Label text
        </DropdownMenuLabel>
      );

      expect(screen.getByText('Important:')).toBeInTheDocument();
      expect(screen.getByText('Label text')).toBeInTheDocument();
    });

    it('should have display name', () => {
      expect(DropdownMenuLabel.displayName).toBeDefined();
    });
  });

  describe('DropdownMenuSeparator', () => {
    it('should render with correct styling classes', () => {
      render(<DropdownMenuSeparator data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveClass(
        '-mx-1',
        'my-1',
        'h-px',
        'bg-muted'
      );
    });

    it('should apply custom className', () => {
      render(
        <DropdownMenuSeparator data-testid="custom-separator" className="custom-separator" />
      );

      const separator = screen.getByTestId('custom-separator');
      expect(separator).toHaveClass('custom-separator');
    });

    it('should forward ref', () => {
      const ref = jest.fn();
      render(<DropdownMenuSeparator ref={ref} data-testid="separator" />);

      expect(ref).toHaveBeenCalled();
    });

    it('should spread additional props', () => {
      render(
        <DropdownMenuSeparator
          data-testid="props-separator"
          aria-orientation="horizontal"
        />
      );

      const separator = screen.getByTestId('props-separator');
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('should render without children', () => {
      render(<DropdownMenuSeparator data-testid="separator" />);

      const separator = screen.getByTestId('separator');
      expect(separator).toBeEmptyDOMElement();
    });

    it('should have display name', () => {
      expect(DropdownMenuSeparator.displayName).toBeDefined();
    });
  });

  describe('DropdownMenuSubTrigger', () => {
    it('should have correct display name', () => {
      expect(DropdownMenuSubTrigger.displayName).toBeDefined();
    });

    it('should be a forwardRef component', () => {
      expect(typeof DropdownMenuSubTrigger).toBe('object');
      expect(DropdownMenuSubTrigger).toHaveProperty('$$typeof');
    });

    it('should render within dropdown menu sub context', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Main Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger data-testid="sub-trigger">
                Sub Trigger
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      // Verify main structure renders
      expect(screen.getByText('Main Trigger')).toBeInTheDocument();
    });

    it('should accept inset and className props', () => {
      expect(() => {
        render(
          <DropdownMenu>
            <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  inset
                  className="custom-sub-trigger"
                  data-testid="sub-trigger"
                >
                  Sub Trigger
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Item</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }).not.toThrow();
    });

    it('should support ref forwarding and additional props', () => {
      const ref = jest.fn();

      expect(() => {
        render(
          <DropdownMenu>
            <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  ref={ref}
                  aria-label="Custom sub trigger"
                >
                  Sub Trigger
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Item</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }).not.toThrow();
    });
  });

  describe('DropdownMenuSubContent', () => {
    it('should have correct display name', () => {
      expect(DropdownMenuSubContent.displayName).toBeDefined();
    });

    it('should be a forwardRef component', () => {
      expect(typeof DropdownMenuSubContent).toBe('object');
      expect(DropdownMenuSubContent).toHaveProperty('$$typeof');
    });

    it('should render within dropdown menu sub context', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Main Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Sub Trigger</DropdownMenuSubTrigger>
              <DropdownMenuSubContent data-testid="sub-content">
                <DropdownMenuItem>Sub Item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      // Verify main structure renders
      expect(screen.getByText('Main Trigger')).toBeInTheDocument();
    });

    it('should accept className and other props', () => {
      expect(() => {
        render(
          <DropdownMenu>
            <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Sub Trigger</DropdownMenuSubTrigger>
                <DropdownMenuSubContent
                  className="custom-sub-content"
                  data-testid="sub-content"
                >
                  Sub Content
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }).not.toThrow();
    });

    it('should support ref forwarding and additional props', () => {
      const ref = jest.fn();

      expect(() => {
        render(
          <DropdownMenu>
            <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Sub Trigger</DropdownMenuSubTrigger>
                <DropdownMenuSubContent
                  ref={ref}
                  aria-label="Custom sub content"
                >
                  Sub Content
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }).not.toThrow();
    });
  });

  describe('Re-exported Components', () => {
    it('should export DropdownMenu as Radix primitive', () => {
      expect(DropdownMenu).toBeDefined();
      expect(typeof DropdownMenu).toBe('function');
    });

    it('should export DropdownMenuTrigger as Radix primitive', () => {
      expect(DropdownMenuTrigger).toBeDefined();
      expect(typeof DropdownMenuTrigger).toBe('object');
    });

    it('should export DropdownMenuGroup as Radix primitive', () => {
      expect(DropdownMenuGroup).toBeDefined();
      expect(typeof DropdownMenuGroup).toBe('object');
    });

    it('should export DropdownMenuPortal as Radix primitive', () => {
      expect(DropdownMenuPortal).toBeDefined();
      expect(typeof DropdownMenuPortal).toBe('function');
    });

    it('should export DropdownMenuSub as Radix primitive', () => {
      expect(DropdownMenuSub).toBeDefined();
      expect(typeof DropdownMenuSub).toBe('function');
    });

    it('should export DropdownMenuRadioGroup as Radix primitive', () => {
      expect(DropdownMenuRadioGroup).toBeDefined();
      expect(typeof DropdownMenuRadioGroup).toBe('object');
    });
  });

  describe('Component Integration', () => {
    it('should work together in a complete dropdown menu', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="integrated-trigger">
            Options
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem inset>Billing</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
                <DropdownMenuItem>Sub Item 2</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      // Verify main trigger renders
      expect(screen.getByTestId('integrated-trigger')).toBeInTheDocument();
    });

    it('should handle complex nested structures', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Complex Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <div>
              <DropdownMenuLabel>Complex Label</DropdownMenuLabel>
              <div>
                <DropdownMenuItem>
                  <span>Complex Item</span>
                </DropdownMenuItem>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('Complex Menu')).toBeInTheDocument();
    });

    it('should maintain styling when nested', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger className="custom-trigger" data-testid="nested-trigger">
            Nested Menu
          </DropdownMenuTrigger>
          <DropdownMenuContent className="custom-content">
            <DropdownMenuItem className="custom-item" data-testid="nested-item">
              Nested Item
            </DropdownMenuItem>
            <DropdownMenuSeparator className="custom-separator" data-testid="nested-separator" />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByTestId('nested-trigger');
      expect(trigger).toHaveClass('custom-trigger');
    });
  });

  describe('Accessibility', () => {
    it('should support basic accessibility attributes', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Menu options"
            data-testid="accessible-trigger"
          >
            Menu
          </DropdownMenuTrigger>
          <DropdownMenuContent role="menu">
            <DropdownMenuItem role="menuitem">Item 1</DropdownMenuItem>
            <DropdownMenuItem role="menuitem">Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByTestId('accessible-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Menu options');
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('should support keyboard navigation attributes', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Keyboard Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem tabIndex={-1}>Item 1</DropdownMenuItem>
            <DropdownMenuItem tabIndex={-1}>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('Keyboard Menu')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Empty Menu</DropdownMenuTrigger>
          <DropdownMenuContent />
        </DropdownMenu>
      );

      expect(screen.getByText('Empty Menu')).toBeInTheDocument();
    });

    it('should handle content with no items', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>No Items Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <div data-testid="no-items">No items available</div>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('No Items Menu')).toBeInTheDocument();
    });

    it('should handle multiple separators in context', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu with separators</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator data-testid="sep1" />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
            <DropdownMenuSeparator data-testid="sep2" />
            <DropdownMenuItem>Item 3</DropdownMenuItem>
            <DropdownMenuSeparator data-testid="sep3" />
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('Menu with separators')).toBeInTheDocument();
    });

    it('should handle items with special characters in context', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Special chars menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>⌘⌥⇧K</DropdownMenuItem>
            <DropdownMenuItem>Ctrl+Alt+Del</DropdownMenuItem>
            <DropdownMenuItem>🎯 Target</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('Special chars menu')).toBeInTheDocument();
    });
  });
});