import { getRandomValues, randomUUID } from 'expo-crypto';

type CryptoLike = Partial<Pick<Crypto, 'getRandomValues' | 'randomUUID'>>;

const defineMethod = (target: object, name: keyof CryptoLike, value: unknown): void => {
  Object.defineProperty(target, name, { configurable: true, value, writable: true });
};

// Hermes has no Web Crypto API; uuid (used by core) needs crypto.getRandomValues or crypto.randomUUID.
// When a runtime exposes a crypto object without these methods, it is extended in place, not replaced.
const existing = (globalThis as { crypto?: CryptoLike }).crypto;

if (typeof existing?.getRandomValues !== 'function') {
  const target = existing ?? {};

  defineMethod(target, 'getRandomValues', getRandomValues);

  if (typeof target.randomUUID !== 'function') {
    defineMethod(target, 'randomUUID', randomUUID);
  }

  if (!existing) {
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: target });
  }
}
