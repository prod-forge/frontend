import type { ReactNode } from 'react';

import { register, selectIsAuthenticated } from '@prod-forge-todolist-frontend/core';
import { RegisterForm } from '@prod-forge-todolist-frontend/ui-web';
import { Link, Navigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../hooks/redux/redux';

export const Register = (): ReactNode => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div>
        <h1 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-fg">Create your account</h1>
        <p className="mt-2 text-md text-fg-soft">Sign up to start organising your day.</p>
      </div>

      <RegisterForm
        onSubmit={(values) =>
          dispatch(register({ email: values.email, ...(values.name ? { name: values.name } : {}) }))
        }
      />

      <p className="text-center text-sm text-fg-soft">
        Already have an account?{' '}
        <Link className="font-medium text-brand hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
};
