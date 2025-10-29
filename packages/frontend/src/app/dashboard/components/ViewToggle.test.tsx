import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '~/test-utils/test-helpers';
import userEvent from '@testing-library/user-event';
import { ViewToggle } from './ViewToggle';

describe('ViewToggle', () => {
  it('should render both view options', () => {
    const mockOnValueChange = vi.fn();
    render(<ViewToggle value="list" onValueChange={mockOnValueChange} />);

    expect(screen.getByText('Vue liste')).toBeInTheDocument();
    expect(screen.getByText('Vue carte')).toBeInTheDocument();
  });

  it('should show list view as active', () => {
    const mockOnValueChange = vi.fn();
    render(<ViewToggle value="list" onValueChange={mockOnValueChange} />);

    const listButton = screen.getByRole('tab', { name: /vue liste/i });
    expect(listButton).toHaveAttribute('data-state', 'active');
  });

  it('should show map view as active', () => {
    const mockOnValueChange = vi.fn();
    render(<ViewToggle value="map" onValueChange={mockOnValueChange} />);

    const mapButton = screen.getByRole('tab', { name: /vue carte/i });
    expect(mapButton).toHaveAttribute('data-state', 'active');
  });

  it('should call onValueChange with "list" when list button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnValueChange = vi.fn();
    render(<ViewToggle value="map" onValueChange={mockOnValueChange} />);

    const listButton = screen.getByRole('tab', { name: /vue liste/i });
    await user.click(listButton);

    expect(mockOnValueChange).toHaveBeenCalledWith('list');
  });

  it('should call onValueChange with "map" when map button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnValueChange = vi.fn();
    render(<ViewToggle value="list" onValueChange={mockOnValueChange} />);

    const mapButton = screen.getByRole('tab', { name: /vue carte/i });
    await user.click(mapButton);

    expect(mockOnValueChange).toHaveBeenCalledWith('map');
  });

  it('should render List icon for list view', () => {
    const mockOnValueChange = vi.fn();
    const { container } = render(<ViewToggle value="list" onValueChange={mockOnValueChange} />);

    // Lucide icons render as SVG elements
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('should render Map icon for map view', () => {
    const mockOnValueChange = vi.fn();
    const { container } = render(<ViewToggle value="map" onValueChange={mockOnValueChange} />);

    // Lucide icons render as SVG elements
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('should not call onValueChange when already active button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnValueChange = vi.fn();
    render(<ViewToggle value="list" onValueChange={mockOnValueChange} />);

    const listButton = screen.getByRole('tab', { name: /vue liste/i });
    await user.click(listButton);

    // Radix Tabs doesn't call onValueChange if the same value is clicked
    expect(mockOnValueChange).not.toHaveBeenCalled();
  });

  it('should have correct accessibility attributes', () => {
    const mockOnValueChange = vi.fn();
    render(<ViewToggle value="list" onValueChange={mockOnValueChange} />);

    const listButton = screen.getByRole('tab', { name: /vue liste/i });
    const mapButton = screen.getByRole('tab', { name: /vue carte/i });

    expect(listButton).toHaveAttribute('role', 'tab');
    expect(mapButton).toHaveAttribute('role', 'tab');
    expect(listButton).toHaveAttribute('data-state', 'active');
    expect(mapButton).toHaveAttribute('data-state', 'inactive');
  });
});
