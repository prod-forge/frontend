import { getRandomValues, randomUUID } from 'expo-crypto';

jest.mock('expo-crypto', () => ({ getRandomValues: jest.fn(), randomUUID: jest.fn() }));

const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, 'crypto');

const setGlobalCrypto = (value: unknown): void => {
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value });
};

const loadPolyfill = (): void => {
  jest.isolateModules(() => {
    jest.requireActual('./crypto-polyfill');
  });
};

const currentCrypto = (): Crypto => (globalThis as unknown as { crypto: Crypto }).crypto;

describe('crypto-polyfill', () => {
  afterEach(() => {
    if (originalCrypto) {
      Object.defineProperty(globalThis, 'crypto', originalCrypto);
    }
  });

  describe('negative cases', () => {
    it('keeps a native getRandomValues untouched', () => {
      const nativeGetRandomValues = jest.fn();
      const nativeCrypto = { getRandomValues: nativeGetRandomValues };
      setGlobalCrypto(nativeCrypto);

      loadPolyfill();

      expect(currentCrypto()).toBe(nativeCrypto);
      expect(currentCrypto().getRandomValues).toBe(nativeGetRandomValues);
    });
  });

  describe('positive cases', () => {
    it('installs crypto when the runtime has none', () => {
      setGlobalCrypto(undefined);

      loadPolyfill();

      expect(currentCrypto().getRandomValues).toBe(getRandomValues);
      expect(currentCrypto().randomUUID).toBe(randomUUID);
    });

    it('extends a crypto object that lacks getRandomValues and keeps its other members', () => {
      const subtle = {};
      const partialCrypto = { subtle };
      setGlobalCrypto(partialCrypto);

      loadPolyfill();

      expect(currentCrypto()).toBe(partialCrypto);
      expect(currentCrypto().subtle).toBe(subtle);
      expect(currentCrypto().getRandomValues).toBe(getRandomValues);
    });
  });
});
