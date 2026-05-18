import type { ReactNode } from 'react';

import { Link, Navigate } from 'react-router-dom';

import { selectIsAuthenticated } from '../../features/auth/auth.selectors';
import { login } from '../../features/auth/auth.slices';
import { useAppDispatch, useAppSelector } from '../../hooks/redux/redux';
import { LoginForm } from '../../widgets/auth/login-form/login-form';

export const Login = (): ReactNode => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div>
        <h1 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-fg">Welcome back</h1>
        <p className="mt-2 text-md text-fg-soft">Sign in to access your tasks.</p>
      </div>

      <LoginForm onSubmit={(values) => dispatch(login({ email: values.email }))} />

      <p className="text-center text-sm text-fg-soft">
        Don&apos;t have an account?{' '}
        <Link className="font-medium text-brand hover:underline" to="/register">
          Create one
        </Link>
      </p>
    </div>
  );
};
