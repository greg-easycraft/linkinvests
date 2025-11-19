import { cn } from './utils';

describe('cn (className utility)', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const result = cn('base-class', false && 'hidden-class', 'visible-class');
    expect(result).toBe('base-class visible-class');
  });

  it('should override conflicting Tailwind classes', () => {
    const result = cn('p-4', 'p-8');
    expect(result).toBe('p-8');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle undefined and null values', () => {
    const result = cn('text-base', undefined, null, 'font-bold');
    expect(result).toBe('text-base font-bold');
  });

  it('should merge arrays of class names', () => {
    const result = cn(['text-sm', 'font-medium'], 'text-gray-500');
    expect(result).toContain('text-sm');
    expect(result).toContain('font-medium');
    expect(result).toContain('text-gray-500');
  });

  it('should handle object syntax', () => {
    const result = cn({
      'text-red-500': true,
      'text-blue-500': false,
    });
    expect(result).toBe('text-red-500');
  });

  it('should deduplicate identical classes', () => {
    const result = cn('flex', 'flex', 'items-center');
    expect(result).toBe('flex items-center');
  });
});
