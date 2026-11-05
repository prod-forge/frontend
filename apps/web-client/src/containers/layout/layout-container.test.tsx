import type { AuthState } from '@prod-forge-todolist-frontend/core';
import type { EnhancedStore } from '@reduxjs/toolkit';

import { authReducer, sessionRestored } from '@prod-forge-todolist-frontend/core';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { LayoutContainer } from './layout-container';

type TestStore = EnhancedStore<{ auth: AuthState }>;

const makeStore = (): TestStore => configureStore({ reducer: { auth: authReducer } });

const signedInStore = (): TestStore => {
  const store = makeStore();
  store.dispatch(sessionRestored({ token: 'signed.jwt.token', user: { email: 'ann@example.com', name: 'Ann' } }));

  return store;
};

const renderContainer = (store: TestStore): void => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Routes>
          <Route element={<LayoutContainer />}>
            <Route element={<p>Page content</p>} path="/" />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('<LayoutContainer />', () => {
  describe('negative cases', () => {
    it('shows the sign in links and no Sign out button for a guest', () => {
      renderContainer(makeStore());

      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
    });
  });

  describe('positive cases', () => {
    it('renders the page of the current route inside the layout', () => {
      renderContainer(makeStore());

      expect(screen.getByText('Page content')).toBeInTheDocument();
    });

    it('shows the signed-in user from the store', () => {
      renderContainer(signedInStore());

      expect(screen.getByText('Ann')).toBeInTheDocument();
    });

    it('logs the user out when Sign out is clicked', async () => {
      const user = userEvent.setup();
      const store = signedInStore();
      renderContainer(store);

      await user.click(screen.getByRole('button', { name: /sign out/i }));

      expect(store.getState().auth.token).toBeNull();
      expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
    });
  });
});
