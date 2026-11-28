import type { SerializedError } from '@reduxjs/toolkit';

import { miniSerializeError } from '@reduxjs/toolkit';

export type SerializedApiError = SerializedError & {
  readonly retryAfterSeconds?: number;
  readonly status?: number;
};

// RTK's default serializer drops `status` and `retryAfterSeconds`; keep them so the error
// middleware can tell 4xx from 5xx and the UI can show the Retry-After wait.
export function serializeApiError(error: unknown): SerializedApiError {
  const serialized = miniSerializeError(error);
  const status = (error as null | undefined | { status?: unknown })?.status;
  const retryAfterSeconds = (error as null | undefined | { retryAfterSeconds?: unknown })
    ?.retryAfterSeconds;

  return {
    ...serialized,
    ...(typeof status === 'number' ? { status } : {}),
    ...(typeof retryAfterSeconds === 'number' ? { retryAfterSeconds } : {}),
  };
}
