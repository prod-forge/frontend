import type { SerializedError } from '@reduxjs/toolkit';

import { miniSerializeError } from '@reduxjs/toolkit';

export type SerializedApiError = SerializedError & { readonly status?: number };

// RTK's default serializer drops `status`; keep it so the error middleware can tell 4xx from 5xx.
export function serializeApiError(error: unknown): SerializedApiError {
  const serialized = miniSerializeError(error);
  const status = (error as null | undefined | { status?: unknown })?.status;

  return typeof status === 'number' ? { ...serialized, status } : serialized;
}
