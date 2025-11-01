import { vi } from 'vitest';

/**
 * Creates a mock instance of a class with all methods mocked
 * Follows the pattern from backend testing guidelines
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockClass<T extends new (...args: any[]) => any>(
  constructor: T,
  // @ts-expect-error - jest.Mocked is not typed
): jest.Mocked<InstanceType<T>> {
  // @ts-expect-error - jest.Mocked is not typed
  const mock = {} as jest.Mocked<InstanceType<T>>;
  const prototype = constructor.prototype;

  Object.getOwnPropertyNames(prototype).forEach((name) => {
    if (name !== 'constructor') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mock[name as keyof typeof mock] = vi.fn() as any;
    }
  });

  return mock;
}
