export interface AppError {
  readonly id: string;
  readonly message: string;
  readonly silent: boolean;
  readonly source: ErrorSource;
  readonly timestamp: number;
  readonly type: AppErrorType;
}
export type AppErrorType = BackendErrorType | FrontendErrorType;

export type ErrorSource = 'manual' | 'react' | 'rtk';

export interface ErrorsState {
  readonly errors: AppError[];
}

export interface ResponseError {
  code: string;
  details: Record<string, unknown>;
  message: string;
  status: number;
  traceId: string;
}

type BackendErrorType = 'backend-error';

type FrontendErrorType = 'frontend-error';
