import type { ReactNode } from 'react';

import cn from 'classnames';

export interface Props {
  completed: boolean;
}

export const TodoStatus = ({ completed }: Props): ReactNode => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-[10px] py-[3px] text-xs font-semibold tracking-[0.06em] uppercase',
      completed ? 'bg-ok-soft text-ok' : 'bg-page-soft text-fg-soft',
    )}
  >
    {completed ? 'Done' : 'To Do'}
  </span>
);
