import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '~/test-utils/test-helpers';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

describe('Avatar Components', () => {
  describe('Avatar', () => {
    it('should render avatar container', () => {
      const { container } = render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(
        <Avatar className="custom-avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      expect(container.firstChild).toHaveClass('custom-avatar');
    });

    it('should apply default styling classes', () => {
      const { container } = render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar.className).toContain('rounded-full');
      expect(avatar.className).toContain('overflow-hidden');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(
        <Avatar ref={ref}>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('AvatarImage', () => {
    it('should render avatar with AvatarImage component', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="User avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Radix Avatar should render a container
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render fallback when image is not loaded', () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Fallback should be present
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('AvatarFallback', () => {
    it('should render fallback text', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render fallback when image fails to load', async () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/broken-image.jpg" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Fallback should be present in the DOM (Radix handles visibility)
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      render(
        <Avatar>
          <AvatarFallback className="custom-fallback">JD</AvatarFallback>
        </Avatar>
      );

      const fallback = screen.getByText('JD');
      expect(fallback).toHaveClass('custom-fallback');
    });

    it('should apply default styling classes', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const fallback = screen.getByText('JD');
      expect(fallback.className).toContain('rounded-full');
      expect(fallback.className).toContain('bg-muted');
      expect(fallback.className).toContain('items-center');
      expect(fallback.className).toContain('justify-center');
    });

    it('should render icon as fallback', () => {
      const IconComponent = () => <svg data-testid="icon">Icon</svg>;

      render(
        <Avatar>
          <AvatarFallback>
            <IconComponent />
          </AvatarFallback>
        </Avatar>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('Complete Avatar', () => {
    it('should render complete avatar with fallback', () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="John Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Fallback is visible when image doesn't load in test environment
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should handle user initials correctly', () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('should support different sizes through className', () => {
      const { container } = render(
        <Avatar className="h-8 w-8">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar.className).toContain('h-8');
      expect(avatar.className).toContain('w-8');
    });
  });
});
