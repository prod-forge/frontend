import type { ReactNode } from 'react';

export interface Props {
  readonly message: string;
  readonly trailing?: ReactNode;
}

export const ErrorBanner = ({ message, trailing }: Props): ReactNode => (
  <div
    className="flex items-center justify-between rounded-md border border-err bg-card px-4 py-3 text-sm text-err"
    role="alert"
  >
    <span>{message}</span>
    {trailing !== undefined && <div className="ml-4 shrink-0">{trailing}</div>}
  </div>
);

ErrorBanner.displayName = 'ErrorBanner';
