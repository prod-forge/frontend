import type { KeyboardEvent, ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export interface Props {
  maxLength?: number;
  onSubmit: (value: string) => void;
  schema: z.ZodType<string, string>;
  value: string;
}

interface FormValues {
  value: string;
}

export const EditableTitle = ({ maxLength, onSubmit, schema, value }: Props): ReactNode => {
  const [isEditing, setIsEditing] = useState(false);

  const formSchema = useMemo(() => z.object({ value: schema }), [schema]);

  const { formState, handleSubmit, register, reset } = useForm<FormValues>({
    defaultValues: { value },
    mode: 'onSubmit',
    resolver: zodResolver(formSchema),
  });

  const { ref: registerRef, ...inputProps } = register('value');

  const startEditing = (): void => {
    reset({ value });
    setIsEditing(true);
  };

  const cancelEditing = (): void => {
    reset({ value });
    setIsEditing(false);
  };

  const submit = handleSubmit((data) => {
    onSubmit(data.value);
    reset({ value: data.value });
    setIsEditing(false);
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
    }
  };

  return !isEditing ? (
    <div className="group/title flex items-start gap-3">
      <h1 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-fg">{value}</h1>
      <button
        aria-label="Edit title"
        className="mt-2 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent text-fg-muted opacity-0 transition duration-[120ms] outline-none hover:border-line hover:bg-page-soft hover:text-fg group-hover/title:opacity-100 focus-visible:border-brand focus-visible:opacity-100 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
        onClick={startEditing}
        type="button"
      >
        <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
          <path
            d="M11.333 2.667a1.886 1.886 0 1 1 2.667 2.667L5.333 14H2.667v-2.667l8.666-8.666z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </button>
    </div>
  ) : (
    <form noValidate onSubmit={(e) => void submit(e)}>
      <input
        aria-invalid={formState.errors.value ? true : undefined}
        aria-label="Title"
        autoComplete="off"
        className="block w-full rounded-md border border-line bg-card px-3 py-2 text-3xl font-bold leading-tight tracking-[-0.03em] text-fg outline-none transition duration-[120ms] focus:border-brand focus:shadow-[0_0_0_3px_var(--color-brand-soft)]"
        maxLength={maxLength}
        {...inputProps}
        onBlur={(event) => {
          void inputProps.onBlur?.(event);
          void submit();
        }}
        onKeyDown={handleKeyDown}
        ref={(node) => {
          registerRef(node);
          if (node) {
            node.focus();
            node.select();
          }
        }}
      />
      {formState.errors.value ? (
        <p className="mt-2 text-sm text-err" role="alert">
          {formState.errors.value.message}
        </p>
      ) : null}
    </form>
  );
};
