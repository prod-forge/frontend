import { getCoreConfig } from '../config/core-config';
import { BackendError, isBackendErrorResponse } from '../errors/backend-error';
import { NetworkError } from '../errors/network-error';
import { traceId } from '../services/logger/trace-id';

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Parses a Retry-After header value (RFC 9110): either a number of seconds or an HTTP date.
// Returns undefined when the header is missing or cannot be parsed.
function parseRetryAfter(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }

  const seconds = Number(value);
  if (Number.isInteger(seconds) && seconds >= 0) {
    return seconds;
  }

  const date = Date.parse(value);
  if (!Number.isNaN(date)) {
    return Math.max(0, Math.ceil((date - Date.now()) / 1000));
  }

  return undefined;
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const { apiBaseUrl, getToken, logger } = getCoreConfig();
  const method = options?.method ?? 'GET';
  logger.debug(`${method} /${path}`, 'api');

  const token = getToken();

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
      'x-trace-id': traceId,
      ...Object.fromEntries(new Headers(options?.headers)),
    },
  }).catch(() => {
    throw new NetworkError();
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const retryAfterSeconds = parseRetryAfter(response.headers.get('retry-after'));

    if (isBackendErrorResponse(body)) {
      const backendTraceId = body.traceId ?? response.headers.get('x-trace-id') ?? undefined;
      logger.warn(
        {
          code: body.code,
          method,
          path,
          status: String(response.status),
          ...(backendTraceId ? { traceId: backendTraceId } : {}),
        },
        'api',
      );
      throw new BackendError({ ...body, retryAfterSeconds, traceId: backendTraceId });
    }

    logger.warn({ method, path, status: String(response.status) }, 'api');
    throw new ApiError(`HTTP ${response.status}`, response.status, retryAfterSeconds);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
