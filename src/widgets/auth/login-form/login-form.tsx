import type { ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import type { ForgotPasswordValues, LoginValues } from '../../../features/auth/auth.schemas';

import { Accordion } from '../../../components/accordion/accordion';
import { Button } from '../../../components/button/button';
import { Input } from '../../../components/input/input';
import { forgotPasswordSchema, loginSchema, PASSWORD_MAX_LENGTH } from '../../../features/auth/auth.schemas';

export interface Props {
  onForgotPassword?: (values: ForgotPasswordValues) => void;
  onSubmit: (values: LoginValues) => void;
}

const loginDefaults: LoginValues = { email: '', password: '' };

const forgotDefaults: ForgotPasswordValues = { email: '' };

export const LoginForm = ({ onForgotPassword, onSubmit }: Props): ReactNode => {
  const [forgotMessage, setForgotMessage] = useState<null | string>(null);

  const loginForm = useForm<LoginValues>({
    defaultValues: loginDefaults,
    mode: 'onSubmit',
    resolver: zodResolver(loginSchema),
  });

  const forgotForm = useForm<ForgotPasswordValues>({
    defaultValues: forgotDefaults,
    mode: 'onSubmit',
    resolver: zodResolver(forgotPasswordSchema),
  });

  const submitLogin = loginForm.handleSubmit((data) => {
    onSubmit(data);
  });

  const submitForgot = forgotForm.handleSubmit((data) => {
    onForgotPassword?.(data);
    setForgotMessage(`If an account exists for ${data.email}, you will receive a reset link.`);
    forgotForm.reset(forgotDefaults);
  });

  return (
    <div className="flex flex-col gap-4">
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

      <Accordion title="Forgot password?">
        <form
          aria-label="Forgot password form"
          className="flex flex-col gap-3"
          noValidate
          onSubmit={(e) => void submitForgot(e)}
        >
          <p className="text-sm text-fg-soft">Enter your email and we will send you a reset link.</p>

          <Input
            autoComplete="email"
            error={forgotForm.formState.errors.email?.message}
            id="forgot-email"
            label="Email"
            placeholder="you@example.com"
            type="email"
            {...forgotForm.register('email')}
          />

          <div className="flex justify-end">
            <Button disabled={forgotForm.formState.isSubmitting} type="submit" variant="secondary">
              Send reset link
            </Button>
          </div>

          {forgotMessage ? (
            <p className="text-sm text-fg-soft" role="status">
              {forgotMessage}
            </p>
          ) : null}
        </form>
      </Accordion>
    </div>
  );
};
