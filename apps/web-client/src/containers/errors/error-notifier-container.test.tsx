import type { ErrorsState } from '@prod-forge-todolist-frontend/core';
import type { EnhancedStore } from '@reduxjs/toolkit';

import { errorsReducer, pushError } from '@prod-forge-todolist-frontend/core';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';

import { ErrorNotifierContainer } from './error-notifier-container';

type TestStore = EnhancedStore<{ errors: ErrorsState }>;

const makeStore = (): TestStore => configureStore({ reducer: { errors: errorsReducer } });

const renderContainer = (store: TestStore): void => {
  render(
    <Provider store={store}>
      <ErrorNotifierContainer />
    </Provider>,
  );
};

describe('<ErrorNotifierContainer />', () => {
  describe('negative cases', () => {
    it('renders no alert when the store has no errors', () => {
      renderContainer(makeStore());

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('does not show a silent error', () => {
      const store = makeStore();
      store.dispatch(pushError({ message: 'Hidden', silent: true, source: 'rtk', type: 'backend-error' }));

      renderContainer(store);

      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    });
  });

  describe('positive cases', () => {
    it('shows the first visible error from the store', () => {
      const store = makeStore();
      store.dispatch(pushError({ message: 'Server is down', source: 'rtk', type: 'backend-error' }));

      renderContainer(store);

      expect(screen.getByRole('alert')).toHaveTextContent('Server is down');
    });

    it('removes the error from the store when it is dismissed', async () => {
      const user = userEvent.setup();
      const store = makeStore();
      store.dispatch(pushError({ message: 'Server is down', source: 'rtk', type: 'backend-error' }));
      renderContainer(store);

      await user.click(screen.getByRole('button', { name: 'Dismiss error' }));

      expect(store.getState().errors.errors).toEqual([]);
      expect(screen.queryByText('Server is down')).not.toBeInTheDocument();
    });
  });
});
