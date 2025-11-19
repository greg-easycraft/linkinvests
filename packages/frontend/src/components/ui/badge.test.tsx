import { render, screen } from '~/test-utils/test-helpers';
import { Badge, badgeVariants } from './badge';

describe('Badge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default variant', () => {
    render(<Badge>Default Badge</Badge>);

    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-neutral-900', 'text-neutral-50');
  });

  it('should render with secondary variant', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);

    const badge = screen.getByText('Secondary Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-neutral-100', 'text-neutral-900');
  });

  it('should render with destructive variant', () => {
    render(<Badge variant="destructive">Error Badge</Badge>);

    const badge = screen.getByText('Error Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-500', 'text-neutral-50');
  });

  it('should render with outline variant', () => {
    render(<Badge variant="outline">Outline Badge</Badge>);

    const badge = screen.getByText('Outline Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-neutral-950');
  });

  it('should apply custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);

    const badge = screen.getByText('Custom Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('custom-class');
  });

  it('should spread additional props', () => {
    render(
      <Badge data-testid="test-badge" aria-label="Test badge">
        Test Badge
      </Badge>
    );

    const badge = screen.getByTestId('test-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-label', 'Test badge');
  });

  it('should render children correctly', () => {
    render(
      <Badge>
        <span>Complex</span> Badge
      </Badge>
    );

    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('Badge')).toBeInTheDocument();
  });

  it('should have proper base styling classes', () => {
    render(<Badge>Base Styling</Badge>);

    const badge = screen.getByText('Base Styling');
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-full',
      'border',
      'px-2.5',
      'py-0.5',
      'text-xs',
      'font-semibold',
      'transition-colors'
    );
  });

  it('should have focus styling classes', () => {
    render(<Badge>Focusable Badge</Badge>);

    const badge = screen.getByText('Focusable Badge');
    expect(badge).toHaveClass(
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-neutral-950',
      'focus:ring-offset-2'
    );
  });

  it('should handle empty content', () => {
    render(<Badge></Badge>);

    const badge = document.querySelector('[class*="inline-flex"]');
    expect(badge).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<Badge role="status">Status Badge</Badge>);

    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Status Badge');
  });

  it('should handle click events when provided', () => {
    const handleClick = jest.fn();
    render(<Badge onClick={handleClick}>Clickable Badge</Badge>);

    const badge = screen.getByText('Clickable Badge');
    badge.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render as div element', () => {
    render(<Badge>Div Badge</Badge>);

    const badge = screen.getByText('Div Badge');
    expect(badge.tagName).toBe('DIV');
  });

  describe('badgeVariants', () => {
    it('should generate correct classes for default variant', () => {
      const classes = badgeVariants({ variant: 'default' });
      expect(classes).toContain('bg-neutral-900');
      expect(classes).toContain('text-neutral-50');
    });

    it('should generate correct classes for secondary variant', () => {
      const classes = badgeVariants({ variant: 'secondary' });
      expect(classes).toContain('bg-neutral-100');
      expect(classes).toContain('text-neutral-900');
    });

    it('should generate correct classes for destructive variant', () => {
      const classes = badgeVariants({ variant: 'destructive' });
      expect(classes).toContain('bg-red-500');
      expect(classes).toContain('text-neutral-50');
    });

    it('should generate correct classes for outline variant', () => {
      const classes = badgeVariants({ variant: 'outline' });
      expect(classes).toContain('text-neutral-950');
    });

    it('should use default variant when none specified', () => {
      const defaultClasses = badgeVariants();
      const explicitDefaultClasses = badgeVariants({ variant: 'default' });
      expect(defaultClasses).toBe(explicitDefaultClasses);
    });
  });
});