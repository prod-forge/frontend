import type { ReactNode } from 'react';

export interface Props<T extends string = string> {
  'aria-label'?: string;
  id: string;
  label?: string;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  value: T;
}

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

export const Select = <T extends string>({
  'aria-label': ariaLabel,
  id,
  label,
  onChange,
  options,
  value,
}: Props<T>): ReactNode => {
  return (
    <div className="inline-flex items-center gap-2 max-[480px]:w-full">
      {label !== undefined && (
        <label className="text-sm font-medium whitespace-nowrap text-fg-soft" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="relative inline-flex max-[480px]:flex-1">
        <select
          aria-label={label === undefined ? ariaLabel : undefined}
          className="min-h-9 cursor-pointer appearance-none rounded-md border border-line bg-card pr-8 pl-3 text-sm font-medium text-fg transition duration-[120ms] hover:border-brand focus-visible:border-brand focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 max-[480px]:w-full"
          id={id}
          onChange={(event) => onChange(event.target.value as T)}
          value={value}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-fg-muted"
          fill="none"
          height="16"
          viewBox="0 0 16 16"
          width="16"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
};
