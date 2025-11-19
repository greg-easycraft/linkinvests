/**
 * Polyfill for crypto.randomUUID() for browsers that don't support it
 * Uses the reliable uuid package instead of custom implementation
 */

import { v4 as uuidv4 } from 'uuid';

if (typeof globalThis !== 'undefined' && globalThis.crypto && !globalThis.crypto.randomUUID) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis.crypto as any).randomUUID = function (): string {
    return uuidv4();
  };
}

if (typeof globalThis !== 'undefined' && !globalThis.crypto) {
  globalThis.crypto = {
    randomUUID: function (): string {
      return uuidv4();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}