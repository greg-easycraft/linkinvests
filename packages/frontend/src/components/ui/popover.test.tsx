/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { Popover, PopoverTrigger, PopoverContent } from './popover';

describe('Popover Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper component to wrap popover with common structure
  const PopoverWrapper = ({
    children,
    triggerText = 'Open Popover',
    contentText = 'Popover content',
    open,
    onOpenChange,
    ...popoverProps
  }: {
    children?: React.ReactNode;
    triggerText?: string;
    contentText?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    [key: string]: any;
  }) => (
    <Popover open={open} onOpenChange={onOpenChange} {...popoverProps}>
      <PopoverTrigger>{triggerText}</PopoverTrigger>
      <PopoverContent>{contentText}</PopoverContent>
      {children}
    </Popover>
  );

  describe('Popover Root', () => {
    it('should render trigger without errors', () => {
      render(<PopoverWrapper triggerText="Test trigger" />);

      expect(screen.getByText('Test trigger')).toBeInTheDocument();
    });

    it('should not show content initially', () => {
      render(<PopoverWrapper contentText="Hidden content" />);

      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('should be uncontrolled by default', async () => {
      const user = userEvent.setup();
      render(<PopoverWrapper />);

      const trigger = screen.getByText('Open Popover');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });
    });

    it('should support controlled state', () => {
      const onOpenChange = jest.fn();

      render(
        <PopoverWrapper
          open={true}
          onOpenChange={onOpenChange}
          contentText="Controlled content"
        />
      );

      expect(screen.getByText('Controlled content')).toBeInTheDocument();
    });

    it('should call onOpenChange when controlled', async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();

      render(
        <PopoverWrapper
          open={false}
          onOpenChange={onOpenChange}
        />
      );

      const trigger = screen.getByText('Open Popover');
      await user.click(trigger);

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('PopoverTrigger', () => {
    it('should render as a button by default', () => {
      render(<PopoverWrapper triggerText="Button trigger" />);

      const trigger = screen.getByRole('button', { name: 'Button trigger' });
      expect(trigger).toBeInTheDocument();
    });

    it('should open popover on click', async () => {
      const user = userEvent.setup();
      render(<PopoverWrapper contentText="Click content" />);

      const trigger = screen.getByText('Open Popover');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Click content')).toBeInTheDocument();
      });
    });

    it('should close popover on second click', async () => {
      const user = userEvent.setup();
      render(<PopoverWrapper contentText="Toggle content" />);

      const trigger = screen.getByText('Open Popover');

      // Open popover
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByText('Toggle content')).toBeInTheDocument();
      });

      // Close popover
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.queryByText('Toggle content')).not.toBeInTheDocument();
      });
    });

    it('should have proper accessibility attributes', async () => {
      const user = userEvent.setup();
      render(<PopoverWrapper />);

      const trigger = screen.getByText('Open Popover');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should support asChild prop', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger asChild>
            <button data-testid="custom-trigger">Custom Button</button>
          </PopoverTrigger>
          <PopoverContent>Custom content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveTextContent('Custom Button');

      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Custom content')).toBeInTheDocument();
      });
    });
  });

  describe('PopoverContent', () => {
    it('should render with correct styling classes', async () => {
      const user = userEvent.setup();
      render(<PopoverWrapper />);

      const trigger = screen.getByText('Open Popover');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Popover content');
        expect(content).toHaveClass(
          'z-50',
          'w-72',
          'rounded-md',
          'border',
          'p-4',
          'shadow-md'
        );
      });
    });

    it('should have theme-based background and text classes', async () => {
      const user = userEvent.setup();
      render(<PopoverWrapper />);

      const trigger = screen.getByText('Open Popover');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Popover content');
        expect(content).toHaveClass(
          'border-[var(--primary)]',
          'bg-[var(--primary)]',
          'text-[var(--secundary)]'
        );
      });
    });

    it('should have animation classes', async () => {
      const user = userEvent.setup();
      render(<PopoverWrapper />);

      const trigger = screen.getByText('Open Popover');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Popover content');
        expect(content).toHaveClass(
          'data-[state=open]:animate-in',
          'data-[state=closed]:animate-out',
          'data-[state=open]:fade-in-0',
          'data-[state=closed]:fade-out-0',
          'data-[state=open]:zoom-in-95',
          'data-[state=closed]:zoom-out-95'
        );
      });
    });

    it('should apply custom className', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Custom class trigger</PopoverTrigger>
          <PopoverContent className="custom-popover">
            Custom class content
          </PopoverContent>
        </Popover>
      );

      const trigger = screen.getByText('Custom class trigger');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Custom class content');
        expect(content).toHaveClass('custom-popover');
      });
    });

    it('should use default align prop', async () => {
      const user = userEvent.setup();
      render(<PopoverWrapper />);

      const trigger = screen.getByText('Open Popover');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Popover content');
        expect(content).toBeInTheDocument();
        // Default align="center" - can't directly test this but content should render
      });
    });

    it('should use default sideOffset prop', async () => {
      const user = userEvent.setup();
      render(<PopoverWrapper />);

      const trigger = screen.getByText('Open Popover');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Popover content');
        expect(content).toBeInTheDocument();
        // Default sideOffset=4 - can't directly test this but content should render
      });
    });

    it('should apply custom align and sideOffset', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Custom props trigger</PopoverTrigger>
          <PopoverContent align="start" sideOffset={8}>
            Custom props content
          </PopoverContent>
        </Popover>
      );

      const trigger = screen.getByText('Custom props trigger');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Custom props content');
        expect(content).toBeInTheDocument();
      });
    });

    it('should forward ref', async () => {
      const ref = jest.fn();
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Ref trigger</PopoverTrigger>
          <PopoverContent ref={ref}>Ref content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByText('Ref trigger');
      await user.click(trigger);

      await waitFor(() => {
        expect(ref).toHaveBeenCalled();
      });
    });

    it('should spread additional props', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Props trigger</PopoverTrigger>
          <PopoverContent data-testid="popover-content" aria-label="Custom popover">
            Props content
          </PopoverContent>
        </Popover>
      );

      const trigger = screen.getByText('Props trigger');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByTestId('popover-content');
        expect(content).toHaveAttribute('aria-label', 'Custom popover');
      });
    });

    it('should have focus management', async () => {
      const user = userEvent.setup();
      render(<PopoverWrapper />);

      const trigger = screen.getByText('Open Popover');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Popover content');
        expect(content).toBeInTheDocument();
        expect(content).toHaveClass('outline-none');
      });
    });
  });

  describe('Complete Popover interaction', () => {
    it('should work with complex content', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Complex trigger</PopoverTrigger>
          <PopoverContent>
            <div>
              <h3>Complex Title</h3>
              <p>This popover has multiple elements</p>
              <button>Action Button</button>
            </div>
          </PopoverContent>
        </Popover>
      );

      const trigger = screen.getByText('Complex trigger');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Complex Title')).toBeInTheDocument();
        expect(screen.getByText('This popover has multiple elements')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
      });
    });

    it('should close when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <PopoverWrapper contentText="Outside click test" />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      const trigger = screen.getByText('Open Popover');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Outside click test')).toBeInTheDocument();
      });

      // Click outside
      const outside = screen.getByTestId('outside');
      await user.click(outside);

      await waitFor(() => {
        expect(screen.queryByText('Outside click test')).not.toBeInTheDocument();
      });
    });

    it('should close when pressing Escape key', async () => {
      const user = userEvent.setup();
      render(<PopoverWrapper contentText="Escape test" />);

      const trigger = screen.getByText('Open Popover');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Escape test')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Escape test')).not.toBeInTheDocument();
      });
    });

    it('should handle multiple popovers independently', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Popover>
            <PopoverTrigger>First trigger</PopoverTrigger>
            <PopoverContent>First popover</PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger>Second trigger</PopoverTrigger>
            <PopoverContent>Second popover</PopoverContent>
          </Popover>
        </div>
      );

      // Open first popover
      const firstTrigger = screen.getByText('First trigger');
      await user.click(firstTrigger);

      await waitFor(() => {
        expect(screen.getByText('First popover')).toBeInTheDocument();
      });

      // Open second popover
      const secondTrigger = screen.getByText('Second trigger');
      await user.click(secondTrigger);

      await waitFor(() => {
        expect(screen.getByText('Second popover')).toBeInTheDocument();
      });
    });

    it('should be accessible with proper roles', async () => {
      const user = userEvent.setup();
      render(<PopoverWrapper />);

      const trigger = screen.getByRole('button', { name: 'Open Popover' });
      expect(trigger).toBeInTheDocument();

      await user.click(trigger);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveTextContent('Popover content');
      });
    });

    it('should handle disabled trigger', () => {
      render(
        <Popover>
          <PopoverTrigger asChild>
            <button disabled>Disabled trigger</button>
          </PopoverTrigger>
          <PopoverContent>Should not show</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: 'Disabled trigger' });
      expect(trigger).toBeDisabled();
    });
  });

  describe('Portal behavior', () => {
    it('should render content in portal', async () => {
      const user = userEvent.setup();
      render(<PopoverWrapper contentText="Portal test" />);

      const trigger = screen.getByText('Open Popover');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Portal test');
        expect(content).toBeInTheDocument();
        // Content should be rendered outside the normal DOM tree
        expect(content.closest('[data-radix-popper-content-wrapper]')).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Empty trigger</PopoverTrigger>
          <PopoverContent />
        </Popover>
      );

      const trigger = screen.getByText('Empty trigger');
      await user.click(trigger);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });
    });

    it('should handle content with no text', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Icon trigger</PopoverTrigger>
          <PopoverContent>
            <div data-testid="icon-content">
              <span role="img" aria-label="icon">🏠</span>
            </div>
          </PopoverContent>
        </Popover>
      );

      const trigger = screen.getByText('Icon trigger');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByTestId('icon-content');
        expect(content).toBeInTheDocument();
      });
    });

    it('should handle rapid open/close', async () => {
      const user = userEvent.setup();
      render(<PopoverWrapper contentText="Rapid test" />);

      const trigger = screen.getByText('Open Popover');

      // Rapid clicks - odd number should leave it open
      await user.click(trigger); // Open
      await user.click(trigger); // Close
      await user.click(trigger); // Open

      // Should end up open after 3 clicks
      await waitFor(() => {
        expect(screen.getByText('Rapid test')).toBeInTheDocument();
      });
    });
  });
});