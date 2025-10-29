import { vi } from 'vitest';

/**
 * Creates a mock instance of a class with all methods mocked
 * Follows the pattern from backend testing guidelines
 */
export function mockClass<T extends new (...args: any[]) => any>(
  constructor: T,
): jest.Mocked<InstanceType<T>> {
  const mock = {} as jest.Mocked<InstanceType<T>>;
  const prototype = constructor.prototype;

  Object.getOwnPropertyNames(prototype).forEach((name) => {
    if (name !== 'constructor') {
      mock[name as keyof typeof mock] = vi.fn() as any;
    }
  });

  return mock;
}
