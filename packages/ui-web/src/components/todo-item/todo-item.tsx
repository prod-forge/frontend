import type { Todo } from '@prod-forge-todolist-frontend/core';
import type { ReactNode } from 'react';

import cn from 'classnames';
import { Link } from 'react-router-dom';

import { TodoStatusToggle } from '../todo-status-toggle/todo-status-toggle';

export interface Props {
  onToggle: (id: string) => void;
  todo: Todo;
}

export const TodoItem = ({ onToggle, todo }: Props): ReactNode => (
  <article
    className={cn(
      'group flex items-center gap-4 rounded-lg border border-l-[3px] border-line bg-card px-6 py-5 shadow-xs transition duration-[120ms] hover:-translate-y-px hover:shadow-md',
      todo.completed ? 'border-l-ok' : 'border-l-fg-muted hover:border-l-brand',
    )}
  >
    <div className="min-w-0 flex-1">
      <Link
        className="block truncate text-md font-semibold text-fg outline-none focus-visible:underline"
        to={`/todo/${todo.id}`}
      >
        {todo.title}
      </Link>
      <div className="mt-3 flex items-center gap-3">
        <TodoStatusToggle completed={todo.completed} onToggle={() => onToggle(todo.id)} />
      </div>
    </div>
    <Link
      aria-label={`Open ${todo.title}`}
      className="shrink-0 text-fg-muted transition duration-[120ms] outline-none group-hover:translate-x-1 group-hover:text-brand focus-visible:text-brand"
      to={`/todo/${todo.id}`}
    >
      <svg fill="none" height="20" viewBox="0 0 20 20" width="20">
        <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    </Link>
  </article>
);
