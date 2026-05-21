import type { ReactNode } from 'react';

export interface Props {
  id: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

export const SearchField = ({ id, onChange, placeholder, value }: Props): ReactNode => (
  <div className="group flex min-h-10 w-full items-center gap-2 rounded-md border border-line bg-card px-3 transition duration-[120ms] hover:border-fg-muted focus-within:border-brand focus-within:shadow-[0_0_0_3px_var(--color-brand-soft)] motion-reduce:transition-none">
    <svg
      aria-hidden="true"
      className="shrink-0 origin-center text-fg-muted transition-[color,transform] duration-[220ms] group-focus-within:scale-110 group-focus-within:animate-search-pulse group-focus-within:text-brand motion-reduce:transition-none motion-reduce:group-focus-within:animate-none"
      fill="none"
      height="18"
      viewBox="0 0 18 18"
      width="18"
    >
      <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 12l3.5 3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
    <input
      autoComplete="off"
      className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-fg outline-none placeholder:text-fg-muted [&::-webkit-search-cancel-button]:appearance-none"
      id={id}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type="search"
      value={value}
    />
  </div>
);
