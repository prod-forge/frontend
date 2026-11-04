type BackendErrorCode =
  | 'BAD_REQUEST'
  | 'DATABASE_ERROR'
  | 'DTO_VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'HTTP_EXCEPTION'
  | 'INFRA_FAILURE'
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND'
  | 'PAYLOAD_TOO_LARGE'
  | 'REDIS_ERROR'
  | 'TODO_NOT_FOUND'
  | 'TOO_MANY_REQUESTS'
  | 'USER_IS_NOT_AUTHORIZED'
  | 'USER_NOT_FOUND';

type BackendErrorResponse = {
  readonly code: string;
  readonly details: Record<string, unknown>;
  readonly message: string;
  readonly status: number;
  readonly traceId: string;
};

const ERROR_MESSAGES: Record<BackendErrorCode, string> = {
  BAD_REQUEST: 'The request could not be processed. Please check your input.',
  DATABASE_ERROR: 'A storage error occurred. Please try again later.',
  DTO_VALIDATION_ERROR: 'Your request contains invalid data. Please check your input.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  HTTP_EXCEPTION: 'An unexpected request error occurred.',
  INFRA_FAILURE: 'A service is temporarily unavailable. Please try again later.',
  INTERNAL_ERROR: 'Something went wrong on our end. Please try again later.',
  NOT_FOUND: 'The requested item could not be found.',
  PAYLOAD_TOO_LARGE: 'The data you sent is too large.',
  REDIS_ERROR: 'A caching error occurred. Please try again later.',
  TODO_NOT_FOUND: 'The requested item could not be found.',
  TOO_MANY_REQUESTS: 'Too many requests. Please wait a moment and try again.',
  USER_IS_NOT_AUTHORIZED: 'Please log in to continue.',
  USER_NOT_FOUND: 'The requested user could not be found.',
};

const FALLBACK_MESSAGE = 'Something went wrong. Please try again later.';

export class BackendError extends Error {
  readonly code: string;
  readonly status: number;
  readonly traceId: string;

  constructor(response: BackendErrorResponse) {
    super((ERROR_MESSAGES as Partial<Record<string, string>>)[response.code] ?? FALLBACK_MESSAGE);
    this.name = 'BackendError';
    this.code = response.code;
    this.status = response.status;
    this.traceId = response.traceId;
  }
}

export function isBackendErrorResponse(body: unknown): body is BackendErrorResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    'code' in body &&
    typeof (body as Record<string, unknown>).code === 'string' &&
    'status' in body &&
    'traceId' in body
  );
}
