import type { ReactNode } from 'react';

export type Props = {
  readonly disabled?: boolean;
  readonly onClick: () => void;
};

export const RetryButton = ({ disabled, onClick }: Props): ReactNode => (
  <button
    aria-label="Retry"
    className="inline-flex size-8 items-center justify-center rounded-full border border-line bg-card text-fg-soft transition duration-fast hover:border-brand hover:bg-brand-soft hover:text-brand focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    <svg fill="none" height="14" viewBox="0 0 14 14" width="14">
      <path
        d="M1.5 7a5.5 5.5 0 1 0 .6-2.5M1.5 1.5V5H5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  </button>
);

RetryButton.displayName = 'RetryButton';
