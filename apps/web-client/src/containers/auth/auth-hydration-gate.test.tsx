import { authReducer, hydrateAuth } from '@prod-forge-todolist-frontend/core';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';

import { AuthHydrationGate } from './auth-hydration-gate';

const renderGate = (store = configureStore({ reducer: { auth: authReducer } })): void => {
  render(
    <Provider store={store}>
      <AuthHydrationGate>
        <div data-testid="app-content">App</div>
      </AuthHydrationGate>
    </Provider>,
  );
};

describe('<AuthHydrationGate />', () => {
  describe('negative cases', () => {
    it('renders nothing before hydration has started', () => {
      renderGate();

      expect(screen.queryByTestId('app-content')).not.toBeInTheDocument();
    });

    it('renders nothing while hydration is in progress', () => {
      const store = configureStore({ reducer: { auth: authReducer } });
      store.dispatch(hydrateAuth.pending('request-id'));

      renderGate(store);

      expect(screen.queryByTestId('app-content')).not.toBeInTheDocument();
    });
  });

  describe('positive cases', () => {
    it('renders children once hydration is done', () => {
      const store = configureStore({ reducer: { auth: authReducer } });
      store.dispatch(hydrateAuth.fulfilled(null, 'request-id'));

      renderGate(store);

      expect(screen.getByTestId('app-content')).toBeInTheDocument();
    });
  });
});
