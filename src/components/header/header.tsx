import type { ReactNode } from 'react';

import { Link } from 'react-router-dom';

import { Button } from '../button/button';

export interface Props {
  isAuthenticated?: boolean;
  onLogout?: () => void;
  onToggle: () => void;
  theme: 'dark' | 'light';
  user?: AuthUserSummary | null;
}

interface AuthUserSummary {
  email: string;
  name?: string;
}

export const Header = ({ isAuthenticated = false, onLogout, onToggle, theme, user }: Props): ReactNode => (
  <header className="sticky top-0 right-0 left-0 z-100 h-[var(--header-height)] border-b border-line bg-card-alpha backdrop-blur-md">
    <div className="mx-auto flex h-full max-w-page items-center justify-between gap-3 px-6">
      <Link
        className="flex items-center gap-3 text-lg font-bold tracking-tight text-fg outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
        to="/"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-linear-[135deg,var(--color-brand),var(--color-brand-hover)] text-white">
          <svg fill="none" height="18" viewBox="0 0 18 18" width="18">
            <path
              d="M3 9.5l4 4 8-8"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </div>
        TodoAI
      </Link>

      <nav aria-label="User" className="flex items-center gap-3">
        {isAuthenticated && user ? (
          <>
            <span className="hidden text-sm text-fg-soft sm:inline" data-testid="header-user">
              {user.name ?? user.email}
            </span>
            <Button onClick={onLogout} size="sm" variant="secondary">
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Link
              className="text-sm font-medium text-fg-soft transition-colors duration-[120ms] hover:text-brand"
              to="/login"
            >
              Sign in
            </Link>
            <Link
              className="inline-flex min-h-8 items-center justify-center gap-2 rounded-md bg-brand px-3 text-xs font-semibold text-brand-fg transition duration-[120ms] hover:bg-brand-hover focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
              to="/register"
            >
              Sign up
            </Link>
          </>
        )}

        <button
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex size-[38px] items-center justify-center rounded-full border border-line bg-card text-fg-soft transition duration-[120ms] hover:border-brand hover:bg-brand-soft hover:text-brand"
          onClick={onToggle}
        >
          {theme === 'dark' ? (
            <svg fill="none" height="18" viewBox="0 0 18 18" width="18">
              <circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M9 1v2M9 15v2M1 9h2M15 9h2M3.64 3.64l1.42 1.42M12.94 12.94l1.42 1.42M3.64 14.36l1.42-1.42M12.94 5.06l1.42-1.42"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          ) : (
            <svg fill="none" height="18" viewBox="0 0 18 18" width="18">
              <path
                d="M15.5 10.5A7 7 0 017.5 2.5a7 7 0 100 13 7 7 0 008-5z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          )}
        </button>
      </nav>
    </div>
  </header>
);
