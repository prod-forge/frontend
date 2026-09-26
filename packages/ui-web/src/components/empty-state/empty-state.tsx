import type { ReactNode } from 'react';

export type Props = {
  readonly message: string;
};

export const EmptyState = ({ message }: Props): ReactNode => (
  <p className="py-8 text-center text-sm text-fg-soft">{message}</p>
);

EmptyState.displayName = 'EmptyState';
