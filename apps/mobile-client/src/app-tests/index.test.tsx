import { sessionRestored, store } from '@prod-forge-todolist-frontend/core';
import { screen } from '@testing-library/react-native';

import Index from '../app/index';
import { prepareStore, renderWithStore } from '../test-utils/render-with-store';

jest.mock('expo-router', () => jest.requireActual<Record<string, unknown>>('../test-utils/expo-router-mock'));

beforeEach(() => {
  prepareStore();
});

describe('<Index />', () => {
  describe('negative cases', () => {
    it('redirects a guest to the login screen', async () => {
      await renderWithStore(<Index />);

      expect(screen.getByTestId('redirect')).toHaveTextContent('/login');
    });
  });

  describe('positive cases', () => {
    it('redirects a restored session straight to the todo list', async () => {
      store.dispatch(sessionRestored({ token: 'test-token', user: { email: 'a@b.com' } }));

      await renderWithStore(<Index />);

      expect(screen.getByTestId('redirect')).toHaveTextContent('/todos');
    });
  });
});
