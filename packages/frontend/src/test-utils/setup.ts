import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { src, alt, ...rest } = props;
    return {
      type: 'img',
      props: {
        src,
        alt: alt || '',
        ...rest,
      },
    };
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test-mapbox-token';
process.env.NEXT_PUBLIC_BETTER_AUTH_URL = 'http://localhost:3000';

// Mock browser APIs required by Radix UI components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Add polyfills for Node.js globals required by database libraries
if (typeof global.TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock server-side dependencies to prevent ESM issues in tests
jest.mock('~/lib/env', () => ({
  env: {
    DATABASE_URL: 'test-db-url',
    GOOGLE_CLIENT_ID: 'test-google-id',
    GOOGLE_CLIENT_SECRET: 'test-google-secret',
    BETTER_AUTH_SECRET: 'test-auth-secret',
    BETTER_AUTH_URL: 'http://localhost:3000',
    NEXT_PUBLIC_MAPBOX_TOKEN: 'test-mapbox-token',
    NEXT_PUBLIC_BETTER_AUTH_URL: 'http://localhost:3000',
  },
}));

// Mock server database
jest.mock('~/server/db', () => ({
  db: {
    select: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    distinct: jest.fn(),
  },
}));

// Mock server actions
jest.mock('~/app/_actions/listings/queries', () => ({
  getListingSources: jest.fn().mockResolvedValue([]),
}));

// Mock scrollIntoView (only in browser environment)
if (typeof HTMLElement !== 'undefined') {
  HTMLElement.prototype.scrollIntoView = jest.fn();
}

// Silence console errors during tests unless needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
