import type { ReactNode } from 'react';

export const Preloader = (): ReactNode => (
  <div aria-label="Loading" className="flex items-center justify-center py-16" role="status">
    <svg className="size-8 animate-spin text-brand" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
    </svg>
  </div>
);
