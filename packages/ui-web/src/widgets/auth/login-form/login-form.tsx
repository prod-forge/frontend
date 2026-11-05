import type { LoginValues } from '@prod-forge-todolist-frontend/core';
import type { ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, PASSWORD_MAX_LENGTH } from '@prod-forge-todolist-frontend/core';
import { useForm } from 'react-hook-form';

import { Button } from '../../../components/button/button';
import { Input } from '../../../components/input/input';

export type Props = {
  /** A returned promise keeps the submit button disabled until it settles. */
  onSubmit: (values: LoginValues) => unknown;
};

const loginDefaults: LoginValues = { email: '', password: '' };

export const LoginForm = ({ onSubmit }: Props): ReactNode => {
  const loginForm = useForm<LoginValues>({
    defaultValues: loginDefaults,
    mode: 'onSubmit',
    resolver: zodResolver(loginSchema),
  });

  const submitLogin = loginForm.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form
      aria-label="Login form"
      className="rounded-xl border border-line bg-card p-6 shadow-md"
      noValidate
      onSubmit={(e) => void submitLogin(e)}
    >
      <h2 className="mb-4 text-lg font-semibold text-fg">Sign in</h2>

      <div className="flex flex-col gap-3">
        <Input
          autoComplete="email"
          error={loginForm.formState.errors.email?.message}
          id="login-email"
          label="Email"
          placeholder="you@example.com"
          type="email"
          {...loginForm.register('email')}
        />

        <Input
          autoComplete="current-password"
          error={loginForm.formState.errors.password?.message}
          id="login-password"
          label="Password"
          maxLength={PASSWORD_MAX_LENGTH * 2}
          placeholder="Your password"
          type="password"
          {...loginForm.register('password')}
        />

        <div className="flex justify-end">
          <Button disabled={loginForm.formState.isSubmitting} type="submit">
            Sign in
          </Button>
        </div>
      </div>
    </form>
  );
};
