import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FAKE_TOKEN } from '../../features/auth/auth.constants';
import { authReducer, login } from '../../features/auth/auth.slices';
import { todosReducer } from '../../features/todos/todos.slices';
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
    store.dispatch(login({ email: 'a@b.com' }));
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
  });

  afterEach(() => {
    localStorage.clear();
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

    expect(store.getState().auth.token).toBe(FAKE_TOKEN);
    expect(store.getState().auth.user).toEqual({ email: 'a@b.com', name: 'Anna' });
    expect(localStorage.getItem('auth-token')).toBe(FAKE_TOKEN);
  });

  it('registers without a name when none is provided', async () => {
    const user = userEvent.setup();
    const { store } = renderRegister();

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'pwd');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(store.getState().auth.user).toEqual({ email: 'a@b.com' });
  });

  it('redirects to home when the user is already authenticated', () => {
    renderRegister({ authenticated: true });

    expect(screen.getByTestId('home')).toBeInTheDocument();
  });
});
