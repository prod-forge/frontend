import type { CoreLogger } from '@prod-forge-todolist-frontend/core';

// jest.setup.ts replaces the adapter with spies for every other test; this file checks the real one.
const { consoleLogger } = jest.requireActual<{ consoleLogger: CoreLogger }>('./console-logger');

const setDev = (value: boolean): void => {
  (globalThis as unknown as { __DEV__: boolean }).__DEV__ = value;
};

describe('consoleLogger', () => {
  const originalDev = __DEV__;
  let debugSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    setDev(originalDev);
    jest.restoreAllMocks();
  });

  describe('negative cases', () => {
    it('does not print debug messages outside development', () => {
      setDev(false);

      consoleLogger.debug('hidden', 'auth');

      expect(debugSpy).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    it('prints debug messages in development with the context prefix', () => {
      setDev(true);

      consoleLogger.debug('visible', 'auth');

      expect(debugSpy).toHaveBeenCalledWith('[auth]', 'visible');
    });

    it('prints errors with the default prefix when no context is given', () => {
      const error = new Error('boom');

      consoleLogger.error(error);

      expect(errorSpy).toHaveBeenCalledWith('[core]', error);
    });

    it('prints warnings with the context prefix', () => {
      consoleLogger.warn('careful', 'todos');

      expect(warnSpy).toHaveBeenCalledWith('[todos]', 'careful');
    });
  });
});
