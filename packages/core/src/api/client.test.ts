import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/logger/trace-id', () => ({ traceId: 'test-trace-id' }));

import type { ResponseError } from '../features/errors/errors.types';

import { configureCore, getCoreConfig } from '../config/core-config';
import { NETWORK_ERROR_MESSAGES } from '../errors/network-error';
import { apiRequest } from './client';

const makeFetchMock = (status: number, body: unknown = null): ReturnType<typeof vi.fn> =>
  vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue(body),
    ok: status >= 200 && status < 300,
    status,
  });

beforeEach(() => {
  vi.stubGlobal('fetch', makeFetchMock(200, { id: '1' }));
});

const lastFetchCall = (): [string, RequestInit] =>
  (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];

const setToken = (token: null | string): void => {
  configureCore({ ...getCoreConfig(), getToken: () => token });
};

const makeBackendErrorBody = (code = 'INTERNAL_ERROR', status = 500): ResponseError => ({
  code,
  details: {},
  message: 'Internal Server Error',
  status,
  traceId: 'test-trace-id',
});

describe('apiRequest', () => {
  describe('negative cases', () => {
    it('throws CoreNotConfiguredError on the first request when core is not configured', async () => {
      vi.resetModules();
      const freshClient = await import('./client');
      const freshConfig = await import('../config/core-config');

      await expect(freshClient.apiRequest('todos')).rejects.toBeInstanceOf(freshConfig.CoreNotConfiguredError);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('omits the Authorization header when getToken returns null', async () => {
      setToken(null);

      await apiRequest('todos');

      const [, init] = lastFetchCall();
      expect(init.headers as Record<string, string>).not.toHaveProperty('Authorization');
    });

    it('throws ApiError when response is not ok and body is not a backend error', async () => {
      vi.stubGlobal('fetch', makeFetchMock(404));

      await expect(apiRequest('todos/missing')).rejects.toMatchObject({
        name: 'ApiError',
        status: 404,
      });
    });

    it('includes the HTTP status in the error message for non-backend errors', async () => {
      vi.stubGlobal('fetch', makeFetchMock(500));

      await expect(apiRequest('todos')).rejects.toThrow('HTTP 500');
    });

    it('throws BackendError when response body matches backend error format', async () => {
      vi.stubGlobal('fetch', makeFetchMock(500, makeBackendErrorBody()));

      await expect(apiRequest('todos')).rejects.toMatchObject({
        code: 'INTERNAL_ERROR',
        name: 'BackendError',
        status: 500,
        traceId: 'test-trace-id',
      });
    });

    it('sets a user-friendly message on BackendError instead of raw backend message', async () => {
      vi.stubGlobal('fetch', makeFetchMock(500, makeBackendErrorBody('INTERNAL_ERROR')));

      await expect(apiRequest('todos')).rejects.toThrow('Something went wrong on our end. Please try again later.');
    });

    it('uses fallback message for unknown backend error codes', async () => {
      vi.stubGlobal('fetch', makeFetchMock(500, makeBackendErrorBody('UNKNOWN_CODE')));

      await expect(apiRequest('todos')).rejects.toThrow('Something went wrong. Please try again later.');
    });

    it('throws NetworkError when fetch rejects due to no connection', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

      await expect(apiRequest('todos')).rejects.toMatchObject({ name: 'NetworkError' });
    });

    it('sets a user-friendly message on NetworkError instead of raw fetch error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

      await expect(apiRequest('todos')).rejects.toThrow(NETWORK_ERROR_MESSAGES.CONNECTION_FAILED);
    });

    it('throws ApiError when response body json parsing fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
          ok: false,
          status: 502,
        }),
      );

      await expect(apiRequest('todos')).rejects.toMatchObject({ name: 'ApiError', status: 502 });
    });
  });

  describe('positive cases', () => {
    it('sends x-trace-id header with the value from traceId', async () => {
      await apiRequest('todos');

      const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
      expect((init.headers as Record<string, string>)['x-trace-id']).toBe('test-trace-id');
    });

    it('sends the request to apiBaseUrl joined with the path', async () => {
      await apiRequest('todos/1');

      const [url] = lastFetchCall();
      expect(url).toBe('https://api.test/todos/1');
    });

    it('sends the Authorization header with the token from getToken', async () => {
      setToken('token-from-config');

      await apiRequest('todos');

      const [, init] = lastFetchCall();
      expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-from-config');
    });

    it('reads the token on every request', async () => {
      setToken('first-token');
      await apiRequest('todos');
      setToken('second-token');
      await apiRequest('todos');

      const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[1] as [string, RequestInit];
      expect((init.headers as Record<string, string>).Authorization).toBe('Bearer second-token');
    });

    it('logs the request through the configured logger', async () => {
      await apiRequest('todos', { method: 'POST' });

      expect(getCoreConfig().logger.debug).toHaveBeenCalledWith('POST /todos', 'api');
    });

    it('sends Content-Type application/json header', async () => {
      await apiRequest('todos');

      const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
      expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    });

    it('returns undefined for 204 responses', async () => {
      vi.stubGlobal('fetch', makeFetchMock(204));

      const result = await apiRequest('todos/1');

      expect(result).toBeUndefined();
    });

    it('returns parsed JSON for successful responses', async () => {
      vi.stubGlobal('fetch', makeFetchMock(200, { id: '1', title: 'Test' }));

      const result = await apiRequest<{ id: string; title: string }>('todos/1');

      expect(result).toEqual({ id: '1', title: 'Test' });
    });

    it('forwards custom options to fetch', async () => {
      await apiRequest('todos', { body: JSON.stringify({ title: 'New' }), method: 'POST' });

      const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ title: 'New' }));
    });
  });
});
