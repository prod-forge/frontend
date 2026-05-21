import type { ReactNode } from 'react';

import cn from 'classnames';
import { useId, useState } from 'react';

export interface Props {
  children: ReactNode;
  defaultOpen?: boolean;
  title: string;
}

export const Accordion = ({ children, defaultOpen = false, title }: Props): ReactNode => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();
  const triggerId = useId();

  return (
    <div className="overflow-hidden rounded-md border border-line bg-card">
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="flex min-h-11 w-full items-center justify-between gap-3 border-0 bg-transparent px-4 py-2 text-left text-sm font-semibold text-fg transition-colors duration-[120ms] hover:bg-page-soft focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-brand focus-visible:[outline-offset:-2px]"
        id={triggerId}
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span className="inline-flex items-center gap-2">{title}</span>
        <svg
          aria-hidden="true"
          className={cn(
            'shrink-0 will-change-transform transition-[color,transform] duration-[220ms] motion-reduce:transition-none',
            {
              'rotate-180 text-brand': isOpen,
              'text-fg-muted': !isOpen,
            },
          )}
          fill="none"
          height="16"
          viewBox="0 0 16 16"
          width="16"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      </button>
      <div
        aria-labelledby={triggerId}
        className={cn(
          'grid [transition-property:grid-template-rows,visibility] [transition-duration:220ms,0s] motion-reduce:transition-none',
          isOpen
            ? 'visible grid-rows-[1fr] [transition-delay:0s,0s]'
            : 'invisible grid-rows-[0fr] [transition-delay:0s,220ms]',
        )}
        id={panelId}
        role="region"
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-line-soft p-4">{children}</div>
        </div>
      </div>
    </div>
  );
};
