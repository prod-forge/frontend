import type { ReactNode } from 'react';

import cn from 'classnames';

export interface Props {
  limit: number;
  offset: number;
  onOffsetChange: (offset: number) => void;
  total: number;
}

const SIBLING_COUNT = 1;

type PageItem = { key: string; kind: 'ellipsis' } | { kind: 'page'; page: number };

const getPageItems = (currentPage: number, totalPages: number): PageItem[] => {
  const pages = new Set<number>([1, currentPage, totalPages]);
  for (let i = 1; i <= SIBLING_COUNT; i++) {
    if (currentPage - i >= 1) pages.add(currentPage - i);
    if (currentPage + i <= totalPages) pages.add(currentPage + i);
  }

  const sorted = [...pages].toSorted((a, b) => a - b);
  const items: PageItem[] = [];
  sorted.forEach((page, idx) => {
    if (idx > 0 && page - sorted[idx - 1] > 1) {
      items.push({ key: `ellipsis-${sorted[idx - 1]}-${page}`, kind: 'ellipsis' });
    }
    items.push({ kind: 'page', page });
  });

  return items;
};

const btnClass =
  'inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md border border-line bg-card px-4 max-[480px]:px-3 text-sm font-medium text-fg transition duration-[120ms] hover:not-disabled:border-brand hover:not-disabled:text-brand focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export const Pagination = ({ limit, offset, onOffsetChange, total }: Props): ReactNode => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(totalPages, Math.floor(offset / limit) + 1);
  const goTo = (page: number): void => onOffsetChange((page - 1) * limit);
  const items = getPageItems(currentPage, totalPages);

  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 max-[480px]:gap-3">
      <button
        aria-label="Previous page"
        className={btnClass}
        disabled={currentPage === 1}
        onClick={() => goTo(currentPage - 1)}
        type="button"
      >
        <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
          <path
            d="M10 3L5 8l5 5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
        <span>Prev</span>
      </button>

      <ul className="flex flex-wrap items-center justify-center gap-1 max-[480px]:hidden">
        {items.map((item) =>
          item.kind === 'ellipsis' ? (
            <li
              aria-hidden="true"
              className="inline-flex min-h-9 min-w-7 items-center justify-center text-fg-muted"
              key={item.key}
            >
              …
            </li>
          ) : (
            <li key={item.page}>
              <button
                aria-current={item.page === currentPage ? 'page' : undefined}
                aria-label={`Page ${item.page}`}
                className={cn(
                  'inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-transparent px-2 text-sm font-medium transition duration-[120ms] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2',
                  item.page === currentPage
                    ? 'bg-brand text-brand-fg'
                    : 'bg-transparent text-fg-soft hover:bg-page-soft hover:text-fg',
                )}
                onClick={() => goTo(item.page)}
                type="button"
              >
                {item.page}
              </button>
            </li>
          ),
        )}
      </ul>

      <span
        aria-live="polite"
        className="hidden flex-1 justify-center text-center text-sm font-medium text-fg-soft max-[480px]:inline-flex"
      >
        Page {currentPage} of {totalPages}
      </span>

      <button
        aria-label="Next page"
        className={btnClass}
        disabled={currentPage === totalPages}
        onClick={() => goTo(currentPage + 1)}
        type="button"
      >
        <span>Next</span>
        <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      </button>
    </nav>
  );
};
