import type { ReactNode } from 'react';

export interface Props {
  readonly action?: ReactNode;
  readonly message: string;
}

export const ErrorBlock = ({ action, message }: Props): ReactNode => (
  <div className="py-8 text-center">
    <p className="text-sm text-err">{message}</p>
    {action !== undefined && <div className="mt-3">{action}</div>}
  </div>
);

ErrorBlock.displayName = 'ErrorBlock';
