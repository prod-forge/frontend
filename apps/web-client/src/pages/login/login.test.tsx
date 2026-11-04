import {
  authReducer,
  errorMiddleware,
  errorsReducer,
  sessionRestored,
  todosReducer,
  UNKNOWN_EMAIL_MESSAGE,
} from '@prod-forge-todolist-frontend/core';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Login } from './login';

const reducer = { auth: authReducer, errors: errorsReducer, todos: todosReducer };

type TestStore = ReturnType<typeof configureStore<{ [K in keyof typeof reducer]: ReturnType<(typeof reducer)[K]> }>>;

const makeStore = (): TestStore =>
  configureStore({
    middleware: (getDefault) => getDefault().concat(errorMiddleware),
    reducer,
  });

const mockLoginResponse = (status: number, body: unknown): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(body),
      ok: status >= 200 && status < 300,
      status,
    }),
  );
};

const renderLogin = (options: { authenticated?: boolean } = {}): { store: TestStore } => {
  const { authenticated = false } = options;
  const store = makeStore();

  if (authenticated) {
    store.dispatch(sessionRestored({ token: 'test-token', user: { email: 'a@b.com' } }));
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

const submitLogin = async (email: string): Promise<void> => {
  const user = userEvent.setup();
  const form = screen.getByRole('form', { name: /login form/i });

  await user.type(within(form).getByLabelText('Email'), email);
  await user.type(within(form).getByLabelText('Password'), 'pwd');
  await user.click(within(form).getByRole('button', { name: /^sign in$/i }));
};

describe('<Login /> page', () => {
  beforeEach(() => {
    localStorage.clear();
    mockLoginResponse(200, { data: { accessToken: 'signed.jwt.token', expiresIn: 3600 } });
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  describe('negative cases', () => {
    it('stays on the login page and reports the unknown email when the backend answers 401', async () => {
      mockLoginResponse(401, {
        code: 'USER_IS_NOT_AUTHORIZED',
        details: {},
        message: 'User is not authorized',
        status: 401,
        traceId: 'test-trace-id',
      });
      const { store } = renderLogin();

      await submitLogin('unknown@example.com');

      await waitFor(() =>
        expect(store.getState().errors.errors.map((e) => e.message)).toEqual([UNKNOWN_EMAIL_MESSAGE]),
      );
      expect(store.getState().auth.token).toBeNull();
      expect(screen.queryByTestId('home')).not.toBeInTheDocument();
    });
  });

  describe('positive cases', () => {
    it('renders the welcome heading and the login form', () => {
      renderLogin();

      expect(screen.getByRole('heading', { level: 1, name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByRole('form', { name: /login form/i })).toBeInTheDocument();
    });

    it('renders a link to the register page', () => {
      renderLogin();

      expect(screen.getByRole('link', { name: /create one/i })).toHaveAttribute('href', '/register');
    });

    it('logs the user in against the backend and stores the issued token', async () => {
      const { store } = renderLogin();

      await submitLogin('a@b.com');

      expect(fetch).toHaveBeenCalledWith('https://api.test/auth/login', expect.objectContaining({ method: 'POST' }));
      await waitFor(() => expect(store.getState().auth.token).toBe('signed.jwt.token'));
      expect(store.getState().auth.user).toEqual({ email: 'a@b.com' });
      expect(await screen.findByTestId('home')).toBeInTheDocument();
    });

    it('redirects to home when the user is already authenticated', () => {
      renderLogin({ authenticated: true });

      expect(screen.getByTestId('home')).toBeInTheDocument();
    });
  });
});
