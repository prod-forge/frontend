import { configureStore } from '@reduxjs/toolkit';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FAKE_TOKEN } from '../../features/auth/auth.constants';
import { authReducer, login } from '../../features/auth/auth.slices';
import { todosReducer } from '../../features/todos/todos.slices';
import { Login } from './login';

const renderLogin = (
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
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<Login />} path="/login" />
          <Route element={<div data-testid="home">Home</div>} path="/" />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  return { store };
};

describe('<Login /> page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders the welcome heading and the login form', () => {
    renderLogin();

    expect(screen.getByRole('heading', { level: 1, name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole('form', { name: /login form/i })).toBeInTheDocument();
  });

  it('renders a link to the register page', () => {
    renderLogin();

    expect(screen.getByRole('link', { name: /create one/i })).toHaveAttribute('href', '/register');
  });

  it('logs the user in and stores the token in localStorage on submit', async () => {
    const user = userEvent.setup();
    const { store } = renderLogin();

    const form = screen.getByRole('form', { name: /login form/i });
    await user.type(within(form).getByLabelText('Email'), 'a@b.com');
    await user.type(within(form).getByLabelText('Password'), 'pwd');
    await user.click(within(form).getByRole('button', { name: /^sign in$/i }));

    expect(store.getState().auth.token).toBe(FAKE_TOKEN);
    expect(store.getState().auth.user).toEqual({ email: 'a@b.com' });
    expect(localStorage.getItem('auth-token')).toBe(FAKE_TOKEN);
  });

  it('redirects to home when the user is already authenticated', () => {
    renderLogin({ authenticated: true });

    expect(screen.getByTestId('home')).toBeInTheDocument();
  });
});
