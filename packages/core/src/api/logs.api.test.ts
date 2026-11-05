import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NetworkError } from '../errors/network-error';
import { logsApi } from './logs.api';

const mockFetch = (status: number): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(null),
      ok: status >= 200 && status < 300,
      status,
    }),
  );
};

const lastFetchCall = (): [string, RequestInit] =>
  (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];

beforeEach(() => {
  mockFetch(204);
});

describe('logsApi.send', () => {
  describe('negative cases', () => {
    it('rejects with a NetworkError when the request cannot be sent', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

      await expect(logsApi.send({ actions: [] })).rejects.toBeInstanceOf(NetworkError);
    });

    it('rejects when the backend throttles the request', async () => {
      mockFetch(429);

      await expect(logsApi.send({ actions: [] })).rejects.toMatchObject({ status: 429 });
    });
  });

  describe('positive cases', () => {
    it('posts the serialized stack to client-logs/web', async () => {
      const stack = { actions: [{ message: 'clicked' }], metadata: { url: '/' } };

      await logsApi.send(stack);

      const [url, init] = lastFetchCall();
      expect(url).toBe('https://api.test/client-logs/web');
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(stack));
    });

    it('resolves with no value when the backend answers 204', async () => {
      await expect(logsApi.send({ actions: [] })).resolves.toBeUndefined();
    });
  });
});
