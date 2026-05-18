import type { ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import type { RegisterValues } from '../../../features/auth/auth.schemas';

import { Button } from '../../../components/button/button';
import { Input } from '../../../components/input/input';
import { NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH, registerSchema } from '../../../features/auth/auth.schemas';

export interface Props {
  onSubmit: (values: RegisterSubmitValues) => void;
}

interface RegisterSubmitValues {
  email: string;
  name?: string;
  password: string;
}

const defaults: RegisterValues = { email: '', name: '', password: '' };

export const RegisterForm = ({ onSubmit }: Props): ReactNode => {
  const { formState, handleSubmit, register } = useForm<RegisterValues>({
    defaultValues: defaults,
    mode: 'onSubmit',
    resolver: zodResolver(registerSchema),
  });

  const submit = handleSubmit((data) => {
    const trimmedName = data.name.trim();

    onSubmit({
      email: data.email,
      ...(trimmedName ? { name: trimmedName } : {}),
      password: data.password,
    });
  });

  return (
    <form
      aria-label="Register form"
      className="rounded-xl border border-line bg-card p-6 shadow-md"
      noValidate
      onSubmit={(e) => void submit(e)}
    >
      <h2 className="mb-4 text-lg font-semibold text-fg">Create an account</h2>

      <div className="flex flex-col gap-3">
        <Input
          autoComplete="email"
          error={formState.errors.email?.message}
          id="register-email"
          label="Email"
          placeholder="you@example.com"
          type="email"
          {...register('email')}
        />

        <Input
          autoComplete="name"
          error={formState.errors.name?.message}
          id="register-name"
          label="Name (optional)"
          maxLength={NAME_MAX_LENGTH * 2}
          placeholder="How should we call you?"
          {...register('name')}
        />

        <Input
          autoComplete="new-password"
          error={formState.errors.password?.message}
          id="register-password"
          label="Password"
          maxLength={PASSWORD_MAX_LENGTH * 2}
          placeholder="3–20 characters"
          type="password"
          {...register('password')}
        />

        <div className="flex justify-end">
          <Button disabled={formState.isSubmitting} type="submit">
            Create account
          </Button>
        </div>
      </div>
    </form>
  );
};
