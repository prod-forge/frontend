import type { ReactNode } from 'react';

import cn from 'classnames';

export interface Props {
  completed: boolean;
  onToggle: () => void;
}

export const TodoStatusToggle = ({ completed, onToggle }: Props): ReactNode => (
  <button
    aria-label={completed ? 'Mark as to do' : 'Mark as done'}
    aria-pressed={completed}
    className={cn(
      'group/toggle inline-flex cursor-pointer items-center gap-2 rounded-full border border-transparent px-[10px] py-[3px] text-xs font-semibold tracking-[0.06em] uppercase transition duration-[120ms] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2',
      completed ? 'bg-ok-soft text-ok hover:border-ok' : 'bg-page-soft text-fg-soft hover:border-fg-muted',
    )}
    onClick={onToggle}
    type="button"
  >
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors duration-[120ms]',
        completed ? 'border-ok bg-ok' : 'border-line bg-card',
      )}
    >
      {completed ? (
        <svg fill="none" height="9" viewBox="0 0 12 12" width="9">
          <path
            className="text-white"
            d="M2.5 6.5l2 2L9.5 3.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      ) : null}
    </span>
    {completed ? 'Done' : 'To Do'}
  </button>
);
