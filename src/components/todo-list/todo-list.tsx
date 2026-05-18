import type { ReactNode } from 'react';

export interface Props {
  children: ReactNode;
}

export const TodoList = ({ children }: Props): ReactNode => (
  <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">{children}</div>
);
