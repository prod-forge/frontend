import type { InputHTMLAttributes, ReactNode, Ref } from 'react';

import cn from 'classnames';

export interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  ref?: Ref<HTMLInputElement>;
}

export const Input = ({ className, error, id, label, name, ref, ...rest }: Props): ReactNode => {
  const errorId = error ? `${id ?? name ?? 'input'}-error` : undefined;

  return (
    <div className="flex flex-col gap-1">
      {label !== undefined && (
        <label className="text-sm font-medium text-fg-soft" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        aria-describedby={errorId}
        aria-invalid={error ? true : undefined}
        className={cn(
          'block min-h-9 w-full rounded-md border bg-card px-3 py-2 text-sm text-fg outline-none transition duration-[120ms] placeholder:text-fg-muted focus:shadow-[0_0_0_3px_var(--color-brand-soft)]',
          error ? 'border-err focus:border-err' : 'border-line focus:border-brand',
          className,
        )}
        id={id}
        name={name}
        ref={ref}
        {...rest}
      />
      {error ? (
        <p className="text-xs text-err" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

Input.displayName = 'Input';
