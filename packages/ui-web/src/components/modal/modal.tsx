import type { MouseEvent, ReactNode } from 'react';

import { useEffect, useEffectEvent, useId, useRef } from 'react';

export interface Props {
  children?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export const Modal = ({ children, isOpen, onClose, title }: Props): ReactNode => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const onKeyDown = useEffectEvent((event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.addEventListener('keydown', onKeyDown);
    dialogRef.current?.focus();

    return (): void => document.removeEventListener('keydown', onKeyDown);
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
