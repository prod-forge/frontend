import type { RenderResult } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { clearErrors, logout, store } from '@prod-forge-todolist-frontend/core';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { setupCore } from '../services/core-setup';
import { TEST_API_BASE_URL } from './fake-backend';

// Screens use the app's real store, so the auth and error slices are reset before every render.
export const prepareStore = (): void => {
  process.env.EXPO_PUBLIC_API_BASE_URL = TEST_API_BASE_URL;
  setupCore();
  store.dispatch(logout());
  store.dispatch(clearErrors());
};

export const renderWithStore = (ui: ReactElement): Promise<RenderResult> =>
  render(<Provider store={store}>{ui}</Provider>);
