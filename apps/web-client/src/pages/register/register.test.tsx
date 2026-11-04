import { authReducer, sessionRestored, todosReducer } from '@prod-forge-todolist-frontend/core';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Register } from './register';

const renderRegister = (
  options: { authenticated?: boolean } = {},
): {
  store: ReturnType<
    typeof configureStore<{ auth: ReturnType<typeof authReducer>; todos: ReturnType<typeof todosReducer> }>
  >;
} => {
  const { authenticated = false } = options;
  const store = configureStore({ reducer: { auth: authReducer, todos: todosReducer } });

  if (authenticated) {
    store.dispatch(sessionRestored({ token: 'test-token', user: { email: 'a@b.com' } }));
  }

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route element={<Register />} path="/register" />
          <Route element={<div data-testid="home">Home</div>} path="/" />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  return { store };
};

describe('<Register /> page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ data: { accessToken: 'signed.jwt.token', expiresIn: 3600 } }),
        ok: true,
        status: 200,
      }),
    );
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('renders the heading and the register form', () => {
    renderRegister();

    expect(screen.getByRole('heading', { level: 1, name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByRole('form', { name: /register form/i })).toBeInTheDocument();
  });

  it('renders a link back to the login page', () => {
    renderRegister();

    expect(screen.getByRole('link', { name: /^sign in$/i })).toHaveAttribute('href', '/login');
  });

  it('registers the user and stores the token on submit', async () => {
    const user = userEvent.setup();
    const { store } = renderRegister();

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText(/name/i), 'Anna');
    await user.type(screen.getByLabelText('Password'), 'pwd');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(store.getState().auth.token).toBe('signed.jwt.token'));
    expect(store.getState().auth.user).toEqual({ email: 'a@b.com', name: 'Anna' });
  });

  it('registers without a name when none is provided', async () => {
    const user = userEvent.setup();
    const { store } = renderRegister();

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'pwd');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(store.getState().auth.user).toEqual({ email: 'a@b.com' }));
  });

  it('redirects to home when the user is already authenticated', () => {
    renderRegister({ authenticated: true });

    expect(screen.getByTestId('home')).toBeInTheDocument();
  });
});
