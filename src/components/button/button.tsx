import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';

import cn from 'classnames';

export interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

type ButtonSize = 'lg' | 'md' | 'sm';

type ButtonVariant = 'danger' | 'ghost' | 'primary' | 'secondary';

const sizeClasses: Record<ButtonSize, string> = {
  lg: 'min-h-11 px-6 text-md',
  md: 'min-h-9 px-4 text-sm',
  sm: 'min-h-8 px-3 text-xs',
};

const variantClasses: Record<ButtonVariant, string> = {
  danger: 'bg-err text-white hover:opacity-90',
  ghost: 'bg-transparent text-fg-soft hover:bg-page-soft',
  primary: 'bg-brand text-brand-fg hover:bg-brand-hover',
  secondary: 'border border-line bg-card text-fg hover:border-fg-muted',
};

export const Button = ({
  children,
  className,
  ref,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...rest
}: Props): ReactNode => (
  <button
    className={cn(
      'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-semibold transition duration-[120ms] outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      sizeClasses[size],
      variantClasses[variant],
      className,
    )}
    ref={ref}
    type={type}
    {...rest}
  >
    {children}
  </button>
);

Button.displayName = 'Button';
