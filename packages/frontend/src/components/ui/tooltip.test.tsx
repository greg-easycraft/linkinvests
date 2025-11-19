import { render, screen, waitFor } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';

describe('Tooltip Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper component to wrap tooltip with provider
  const TooltipWrapper = ({
    children,
    triggerText = 'Hover me',
    contentText = 'Tooltip content',
    ...tooltipProps
  }: {
    children?: React.ReactNode;
    triggerText?: string;
    contentText?: string;
    [key: string]: any;
  }) => (
    <TooltipProvider>
      <Tooltip {...tooltipProps}>
        <TooltipTrigger>{triggerText}</TooltipTrigger>
        <TooltipContent>{contentText}</TooltipContent>
      </Tooltip>
      {children}
    </TooltipProvider>
  );

  describe('TooltipProvider', () => {
    it('should render children without errors', () => {
      render(
        <TooltipProvider>
          <div>Content inside provider</div>
        </TooltipProvider>
      );

      expect(screen.getByText('Content inside provider')).toBeInTheDocument();
    });

    it('should allow multiple tooltips within provider', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>First trigger</TooltipTrigger>
            <TooltipContent>First tooltip</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>Second trigger</TooltipTrigger>
            <TooltipContent>Second tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByText('First trigger')).toBeInTheDocument();
      expect(screen.getByText('Second trigger')).toBeInTheDocument();
    });
  });

  describe('Tooltip and TooltipTrigger', () => {
    it('should render trigger correctly', () => {
      render(<TooltipWrapper triggerText="Test trigger" />);

      expect(screen.getByText('Test trigger')).toBeInTheDocument();
    });

    it('should show tooltip on hover', async () => {
      const user = userEvent.setup();
      render(<TooltipWrapper contentText="Hover tooltip" />);

      const trigger = screen.getByText('Hover me');

      await user.hover(trigger);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Hover tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
        // Check that at least one visible tooltip exists
        const visibleTooltip = tooltips.find(el =>
          !el.style.position?.includes('absolute') ||
          !el.style.width?.includes('1px')
        );
        expect(visibleTooltip).toBeInTheDocument();
      });
    });

    it('should hide tooltip when not hovering', async () => {
      const user = userEvent.setup();
      render(<TooltipWrapper contentText="Hover tooltip" />);

      const trigger = screen.getByText('Hover me');

      // Hover to show tooltip
      await user.hover(trigger);
      await waitFor(() => {
        const tooltips = screen.getAllByText('Hover tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
      });

      // Unhover to hide tooltip
      await user.unhover(trigger);

      await waitFor(() => {
        expect(screen.queryAllByText('Hover tooltip')).toHaveLength(0);
      }, { timeout: 2000 });
    });

    it('should show tooltip on focus', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Focusable trigger</button>
            </TooltipTrigger>
            <TooltipContent>Focus tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByRole('button', { name: 'Focusable trigger' });

      await user.click(trigger); // Focus the button

      await waitFor(() => {
        const tooltips = screen.getAllByText('Focus tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });

    it('should handle controlled open state', () => {
      const onOpenChange = jest.fn();

      render(
        <TooltipProvider>
          <Tooltip open={true} onOpenChange={onOpenChange}>
            <TooltipTrigger>Controlled trigger</TooltipTrigger>
            <TooltipContent>Controlled tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const tooltips = screen.getAllByText('Controlled tooltip');
      expect(tooltips.length).toBeGreaterThan(0);
    });
  });

  describe('TooltipContent', () => {
    it('should render with correct styling classes', async () => {
      const user = userEvent.setup();
      render(<TooltipWrapper contentText="Styled tooltip" />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Styled tooltip');
        const visibleTooltip = tooltips.find(el =>
          !el.style.position?.includes('absolute') ||
          !el.style.width?.includes('1px')
        );
        expect(visibleTooltip).toBeInTheDocument();
        expect(visibleTooltip).toHaveClass(
          'z-50',
          'overflow-hidden',
          'rounded-md',
          'px-3',
          'py-1.5',
          'text-xs'
        );
      });
    });

    it('should have animation classes', async () => {
      const user = userEvent.setup();
      render(<TooltipWrapper contentText="Animated tooltip" />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Animated tooltip');
        const visibleTooltip = tooltips.find(el =>
          !el.style.position?.includes('absolute') ||
          !el.style.width?.includes('1px')
        );
        expect(visibleTooltip).toBeInTheDocument();
        expect(visibleTooltip).toHaveClass(
          'animate-in',
          'fade-in-0',
          'zoom-in-95'
        );
      });
    });

    it('should apply custom className', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Custom trigger</TooltipTrigger>
            <TooltipContent className="custom-tooltip">
              Custom tooltip
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Custom trigger');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Custom tooltip');
        const visibleTooltip = tooltips.find(el =>
          !el.style.position?.includes('absolute') ||
          !el.style.width?.includes('1px')
        );
        expect(visibleTooltip).toBeInTheDocument();
        expect(visibleTooltip).toHaveClass('custom-tooltip');
      });
    });

    it('should use default sideOffset', async () => {
      const user = userEvent.setup();
      render(<TooltipWrapper />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Tooltip content');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });

    it('should apply custom sideOffset', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Custom offset trigger</TooltipTrigger>
            <TooltipContent sideOffset={8}>
              Custom offset tooltip
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Custom offset trigger');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Custom offset tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });

    it('should forward ref', async () => {
      const ref = jest.fn();
      const user = userEvent.setup();

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Ref trigger</TooltipTrigger>
            <TooltipContent ref={ref}>Ref tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Ref trigger');
      await user.hover(trigger);

      await waitFor(() => {
        expect(ref).toHaveBeenCalled();
      });
    });

    it('should spread additional props', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Props trigger</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content" aria-label="Custom tooltip">
              Props tooltip
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Props trigger');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByTestId('tooltip-content');
        expect(tooltip).toHaveAttribute('aria-label', 'Custom tooltip');
      }, { timeout: 2000 });
    });
  });

  describe('Complete tooltip interaction', () => {
    it('should work with custom trigger element', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button">Custom button</button>
            </TooltipTrigger>
            <TooltipContent>Button tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const button = screen.getByRole('button', { name: 'Custom button' });
      await user.hover(button);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Button tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });

    it('should work with complex content', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Rich content trigger</TooltipTrigger>
            <TooltipContent>
              <div>
                <strong>Rich Content</strong>
                <p>This tooltip has multiple elements</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Rich content trigger');
      await user.hover(trigger);

      await waitFor(() => {
        const richContent = screen.getAllByText('Rich Content');
        const multipleElements = screen.getAllByText('This tooltip has multiple elements');
        expect(richContent.length).toBeGreaterThan(0);
        expect(multipleElements.length).toBeGreaterThan(0);
      });
    });

    it('should handle multiple tooltips independently', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>First trigger</TooltipTrigger>
            <TooltipContent>First tooltip</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>Second trigger</TooltipTrigger>
            <TooltipContent>Second tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      // Hover first tooltip
      await user.hover(screen.getByText('First trigger'));
      await waitFor(() => {
        const firstTooltips = screen.getAllByText('First tooltip');
        expect(firstTooltips.length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      // Hover second tooltip
      await user.hover(screen.getByText('Second trigger'));
      await waitFor(() => {
        const secondTooltips = screen.getAllByText('Second tooltip');
        expect(secondTooltips.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('should be accessible', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger aria-describedby="tooltip">
              Accessible trigger
            </TooltipTrigger>
            <TooltipContent role="tooltip">
              Accessible tooltip content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Accessible trigger');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltips = screen.getAllByRole('tooltip');
        expect(tooltips.length).toBeGreaterThan(0);
        const visibleTooltip = tooltips.find(el => el.textContent === 'Accessible tooltip content' &&
          (!el.style.position?.includes('absolute') || !el.style.width?.includes('1px'))
        );
        expect(visibleTooltip).toBeInTheDocument();
        expect(visibleTooltip).toHaveTextContent('Accessible tooltip content');
      }, { timeout: 2000 });
    });

    it('should handle disabled trigger', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button disabled>Disabled trigger</button>
            </TooltipTrigger>
            <TooltipContent>Should not show</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const button = screen.getByRole('button', { name: 'Disabled trigger' });
      expect(button).toBeDisabled();
    });
  });

  describe('Portal behavior', () => {
    it('should render tooltip content in portal', async () => {
      const user = userEvent.setup();
      render(<TooltipWrapper contentText="Portal tooltip" />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Portal tooltip');
        const visibleTooltip = tooltips.find(el =>
          !el.style.position?.includes('absolute') ||
          !el.style.width?.includes('1px')
        );
        expect(visibleTooltip).toBeInTheDocument();
        // Tooltip should be rendered outside the normal DOM tree
        expect(visibleTooltip.closest('[data-radix-popper-content-wrapper]')).toBeTruthy();
      });
    });
  });
});