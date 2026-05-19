import { logger } from 'logrock';

import { BackendError, isBackendErrorResponse } from '../errors/backend-error';
import { NetworkError } from '../errors/network-error';
import { FAKE_TOKEN } from '../features/auth/auth.constants';
import { traceId } from '../services/logger/trace-id';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method ?? 'GET';
  logger.debug(`${method} /${path}`, 'api');

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${FAKE_TOKEN}`,
      'Content-Type': 'application/json',
      'x-trace-id': traceId,
      ...options?.headers,
    },
  }).catch(() => {
    throw new NetworkError();
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);

    if (isBackendErrorResponse(body)) {
      logger.warn({ code: body.code, method, path, status: String(response.status), traceId: body.traceId }, 'api');
      throw new BackendError(body);
    }

    logger.warn({ method, path, status: String(response.status) }, 'api');
    throw new ApiError(`HTTP ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
