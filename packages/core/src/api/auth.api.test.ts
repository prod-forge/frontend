import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ResponseError } from '../features/errors/errors.types';

import { BackendError } from '../errors/backend-error';
import { authApi } from './auth.api';

const unauthorizedBody: ResponseError = {
  code: 'USER_IS_NOT_AUTHORIZED',
  details: {},
  message: 'User is not authorized',
  status: 401,
  traceId: 'test-trace-id',
};

const mockFetch = (status: number, body: unknown): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(body),
      ok: status >= 200 && status < 300,
      status,
    }),
  );
};

const lastFetchCall = (): [string, RequestInit] =>
  (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];

beforeEach(() => {
  mockFetch(200, { data: { accessToken: 'signed.jwt.token', expiresIn: 3600 } });
});

describe('authApi.login', () => {
  describe('negative cases', () => {
    it('rejects with a BackendError carrying the 401 status for an unknown email', async () => {
      mockFetch(401, unauthorizedBody);

      const result = authApi.login('unknown@example.com');

      await expect(result).rejects.toBeInstanceOf(BackendError);
      await expect(result).rejects.toMatchObject({ code: 'USER_IS_NOT_AUTHORIZED', status: 401 });
    });
  });

  describe('positive cases', () => {
    it('posts the email to auth/login', async () => {
      await authApi.login('user1@example.com');

      const [url, init] = lastFetchCall();
      expect(url).toBe('https://api.test/auth/login');
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ email: 'user1@example.com' }));
    });

    it('returns the unwrapped access token and its lifetime', async () => {
      const result = await authApi.login('user1@example.com');

      expect(result).toEqual({ accessToken: 'signed.jwt.token', expiresIn: 3600 });
    });
  });
});
