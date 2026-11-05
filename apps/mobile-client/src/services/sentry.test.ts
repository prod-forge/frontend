import { traceId } from '@prod-forge-todolist-frontend/core';
import * as Sentry from '@sentry/react-native';

import { captureException, initSentry } from './sentry';

type Scope = { setContext: jest.Mock };

const mockedSentry = jest.mocked(Sentry);

const runScopeWith = (scope: Scope): void => {
  mockedSentry.withScope.mockImplementation((callback) => callback(scope as unknown as Sentry.Scope));
};

const setDev = (value: boolean): void => {
  (globalThis as unknown as { __DEV__: boolean }).__DEV__ = value;
};

describe('sentry', () => {
  const originalDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  const originalDev = __DEV__;

  afterEach(() => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = originalDsn;
    setDev(originalDev);
    jest.clearAllMocks();
  });

  describe('negative cases', () => {
    it('does not capture when Sentry has no client', () => {
      mockedSentry.getClient.mockReturnValue(undefined);

      captureException(new Error('boom'));

      expect(mockedSentry.withScope).not.toHaveBeenCalled();
      expect(mockedSentry.captureException).not.toHaveBeenCalled();
    });

    it('does not init Sentry when EXPO_PUBLIC_SENTRY_DSN is not set', () => {
      delete process.env.EXPO_PUBLIC_SENTRY_DSN;

      initSentry();

      expect(mockedSentry.init).not.toHaveBeenCalled();
      expect(mockedSentry.setTag).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    it('captures the error without context', () => {
      const scope = { setContext: jest.fn() };
      const error = new Error('boom');
      mockedSentry.getClient.mockReturnValue({} as ReturnType<typeof Sentry.getClient>);
      runScopeWith(scope);

      captureException(error);

      expect(scope.setContext).not.toHaveBeenCalled();
      expect(mockedSentry.captureException).toHaveBeenCalledWith(error);
    });

    it('captures the error with its context', () => {
      const scope = { setContext: jest.fn() };
      const error = new Error('boom');
      mockedSentry.getClient.mockReturnValue({} as ReturnType<typeof Sentry.getClient>);
      runScopeWith(scope);

      captureException(error, { todoId: 1 });

      expect(scope.setContext).toHaveBeenCalledWith('context', { todoId: 1 });
      expect(mockedSentry.captureException).toHaveBeenCalledWith(error);
    });

    it('inits Sentry for development and tags the trace id', () => {
      process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://key@sentry.example/1';
      setDev(true);

      initSentry();

      expect(mockedSentry.init).toHaveBeenCalledWith({
        dsn: 'https://key@sentry.example/1',
        environment: 'development',
        sendDefaultPii: false,
        tracesSampleRate: 1.0,
      });
      expect(mockedSentry.setTag).toHaveBeenCalledWith('trace_id', traceId);
    });

    it('inits Sentry for production with a lower sample rate', () => {
      process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://key@sentry.example/1';
      setDev(false);

      initSentry();

      expect(mockedSentry.init).toHaveBeenCalledWith(
        expect.objectContaining({ environment: 'production', tracesSampleRate: 0.2 }),
      );
    });
  });
});
