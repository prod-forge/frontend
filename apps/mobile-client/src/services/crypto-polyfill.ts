import { getRandomValues, randomUUID } from 'expo-crypto';

// Hermes has no Web Crypto API; uuid (used by core) needs crypto.getRandomValues or crypto.randomUUID.
if (typeof globalThis.crypto === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: { getRandomValues, randomUUID },
  });
}
