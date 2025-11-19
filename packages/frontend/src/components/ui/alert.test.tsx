import { render, screen } from '~/test-utils/test-helpers';
import { Alert, AlertTitle, AlertDescription } from './alert';

// Mock icon component for testing
const MockIcon = () => <svg data-testid="alert-icon">Icon</svg>;

describe('Alert Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Alert', () => {
    it('should render with default variant', () => {
      render(<Alert data-testid="alert">Alert content</Alert>);

      const alert = screen.getByTestId('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Alert content');
      expect(alert).toHaveClass('bg-background', 'text-foreground');
    });

    it('should render with destructive variant', () => {
      render(
        <Alert data-testid="alert" variant="destructive">
          Destructive alert
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
    });

    it('should have proper base styling classes', () => {
      render(<Alert data-testid="alert">Alert content</Alert>);

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass(
        'relative',
        'w-full',
        'rounded-lg',
        'border',
        'p-4'
      );
    });

    it('should have accessibility role="alert"', () => {
      render(<Alert>Alert content</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <Alert data-testid="alert" className="custom-class">
          Alert content
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('custom-class');
    });

    it('should forward ref', () => {
      const ref = jest.fn();
      render(<Alert ref={ref}>Alert content</Alert>);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });

    it('should spread additional props', () => {
      render(
        <Alert data-testid="alert" aria-label="Custom alert" id="alert-1">
          Alert content
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('aria-label', 'Custom alert');
      expect(alert).toHaveAttribute('id', 'alert-1');
    });

    it('should have icon positioning classes for SVG children', () => {
      render(<Alert data-testid="alert">Alert content</Alert>);

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass(
        '[&>svg~*]:pl-7',
        '[&>svg+div]:translate-y-[-3px]',
        '[&>svg]:absolute',
        '[&>svg]:left-4',
        '[&>svg]:top-4',
        '[&>svg]:text-foreground'
      );
    });

    it('should render as div element', () => {
      render(<Alert data-testid="alert">Alert content</Alert>);

      const alert = screen.getByTestId('alert');
      expect(alert.tagName).toBe('DIV');
    });
  });

  describe('AlertTitle', () => {
    it('should render as h5 element', () => {
      render(<AlertTitle data-testid="alert-title">Alert Title</AlertTitle>);

      const title = screen.getByTestId('alert-title');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H5');
      expect(title).toHaveTextContent('Alert Title');
    });

    it('should have correct styling classes', () => {
      render(<AlertTitle data-testid="alert-title">Alert Title</AlertTitle>);

      const title = screen.getByTestId('alert-title');
      expect(title).toHaveClass(
        'mb-1',
        'font-medium',
        'leading-none',
        'tracking-tight'
      );
    });

    it('should apply custom className', () => {
      render(
        <AlertTitle data-testid="alert-title" className="custom-title">
          Alert Title
        </AlertTitle>
      );

      const title = screen.getByTestId('alert-title');
      expect(title).toHaveClass('custom-title');
    });

    it('should forward ref', () => {
      const ref = jest.fn();
      render(<AlertTitle ref={ref}>Alert Title</AlertTitle>);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLHeadingElement));
    });

    it('should spread additional props', () => {
      render(
        <AlertTitle data-testid="alert-title" id="title-1">
          Alert Title
        </AlertTitle>
      );

      const title = screen.getByTestId('alert-title');
      expect(title).toHaveAttribute('id', 'title-1');
    });

    it('should render children correctly', () => {
      render(
        <AlertTitle>
          <span>Important:</span> Alert Title
        </AlertTitle>
      );

      expect(screen.getByText('Important:')).toBeInTheDocument();
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
    });
  });

  describe('AlertDescription', () => {
    it('should render as div element', () => {
      render(
        <AlertDescription data-testid="alert-description">
          Alert description text
        </AlertDescription>
      );

      const description = screen.getByTestId('alert-description');
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe('DIV');
      expect(description).toHaveTextContent('Alert description text');
    });

    it('should have correct styling classes', () => {
      render(
        <AlertDescription data-testid="alert-description">
          Alert description
        </AlertDescription>
      );

      const description = screen.getByTestId('alert-description');
      expect(description).toHaveClass('text-sm', '[&_p]:leading-relaxed');
    });

    it('should apply custom className', () => {
      render(
        <AlertDescription data-testid="alert-description" className="custom-description">
          Alert description
        </AlertDescription>
      );

      const description = screen.getByTestId('alert-description');
      expect(description).toHaveClass('custom-description');
    });

    it('should forward ref', () => {
      const ref = jest.fn();
      render(<AlertDescription ref={ref}>Alert description</AlertDescription>);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });

    it('should spread additional props', () => {
      render(
        <AlertDescription data-testid="alert-description" id="desc-1">
          Alert description
        </AlertDescription>
      );

      const description = screen.getByTestId('alert-description');
      expect(description).toHaveAttribute('id', 'desc-1');
    });

    it('should handle paragraph content styling', () => {
      render(
        <AlertDescription data-testid="alert-description">
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </AlertDescription>
      );

      const description = screen.getByTestId('alert-description');
      expect(description).toHaveClass('[&_p]:leading-relaxed');
      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    });
  });

  describe('Complete Alert with all components', () => {
    it('should render complete alert with title and description', () => {
      render(
        <Alert data-testid="complete-alert">
          <AlertTitle>Error Title</AlertTitle>
          <AlertDescription>This is an error description</AlertDescription>
        </Alert>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Error Title')).toBeInTheDocument();
      expect(screen.getByText('This is an error description')).toBeInTheDocument();
    });

    it('should render destructive alert with icon', () => {
      render(
        <Alert variant="destructive" data-testid="destructive-alert">
          <MockIcon />
          <AlertTitle>Critical Error</AlertTitle>
          <AlertDescription>This requires immediate attention</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('destructive-alert');
      expect(alert).toHaveClass('text-destructive');
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
      expect(screen.getByText('Critical Error')).toBeInTheDocument();
      expect(screen.getByText('This requires immediate attention')).toBeInTheDocument();
    });

    it('should apply icon positioning when icon is present', () => {
      render(
        <Alert data-testid="alert-with-icon">
          <MockIcon />
          <div>Content after icon</div>
        </Alert>
      );

      const alert = screen.getByTestId('alert-with-icon');
      expect(alert).toHaveClass('[&>svg~*]:pl-7');
    });

    it('should be accessible', () => {
      render(
        <Alert>
          <AlertTitle>Accessibility Test</AlertTitle>
          <AlertDescription>
            This alert should be announced by screen readers
          </AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('role', 'alert');
    });

    it('should handle empty content', () => {
      render(<Alert data-testid="empty-alert" />);

      const alert = screen.getByTestId('empty-alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('role', 'alert');
    });

    it('should handle only title without description', () => {
      render(
        <Alert>
          <AlertTitle>Just a title</AlertTitle>
        </Alert>
      );

      expect(screen.getByText('Just a title')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should handle only description without title', () => {
      render(
        <Alert>
          <AlertDescription>Just a description</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Just a description')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Variant behavior', () => {
    it('should use default variant when none specified', () => {
      render(<Alert data-testid="default-variant">Default alert</Alert>);

      const alert = screen.getByTestId('default-variant');
      expect(alert).toHaveClass('bg-background', 'text-foreground');
      expect(alert).not.toHaveClass('text-destructive');
    });

    it('should apply destructive variant correctly', () => {
      render(
        <Alert data-testid="destructive-variant" variant="destructive">
          Destructive alert
        </Alert>
      );

      const alert = screen.getByTestId('destructive-variant');
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
      expect(alert).not.toHaveClass('bg-background');
    });

    it('should handle icon color in destructive variant', () => {
      render(
        <Alert variant="destructive" data-testid="destructive-with-icon">
          <MockIcon />
          <AlertTitle>Error</AlertTitle>
        </Alert>
      );

      const alert = screen.getByTestId('destructive-with-icon');
      expect(alert).toHaveClass('[&>svg]:text-destructive');
    });
  });
});