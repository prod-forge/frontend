import type { MouseEvent, ReactNode } from 'react';

import { useEffect, useEffectEvent, useId, useRef } from 'react';

export type Props = {
  children?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

// Keeps Tab and Shift+Tab inside the dialog, so the page behind an aria-modal dialog is not reachable
const trapFocus = (event: KeyboardEvent, dialog: HTMLElement): void => {
  const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  const first = focusable.at(0);
  const last = focusable.at(-1);
  const active = document.activeElement;

  if (!first || !last) {
    event.preventDefault();
    dialog.focus();

    return;
  }

  if (event.shiftKey && (active === first || active === dialog || !dialog.contains(active))) {
    event.preventDefault();
    last.focus();

    return;
  }

  if (!event.shiftKey && (active === last || !dialog.contains(active))) {
    event.preventDefault();
    first.focus();
  }
};

export const Modal = ({ children, isOpen, onClose, title }: Props): ReactNode => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const onKeyDown = useEffectEvent((event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();

      return;
    }

    if (event.key === 'Tab' && dialogRef.current) {
      trapFocus(event, dialogRef.current);
    }
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.addEventListener('keydown', onKeyDown);
    dialogRef.current?.focus();

    return (): void => {
      document.removeEventListener('keydown', onKeyDown);
      // Returns the keyboard user to the control that opened the dialog, unless it left the page
      if (opener?.isConnected) {
        opener.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      data-testid="modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-line bg-card p-6 shadow-md outline-none"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <h2 className="text-lg font-semibold text-fg" id={titleId}>
          {title}
        </h2>
        {children ? <div className="mt-4 text-sm text-fg-soft">{children}</div> : null}
      </div>
    </div>
  );
};
