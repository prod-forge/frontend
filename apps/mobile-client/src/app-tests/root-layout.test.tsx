import { hydrateAuth, pushError, store } from '@prod-forge-todolist-frontend/core';
import { render, screen, userEvent } from '@testing-library/react-native';

import RootLayout from '../app/_layout';
import { prepareStore } from '../test-utils/render-with-store';

jest.mock('expo-router', () => jest.requireActual<Record<string, unknown>>('../test-utils/expo-router-mock'));

// RootLayout owns the Provider, so it is rendered without renderWithStore.
beforeEach(() => {
  prepareStore();
});

describe('<RootLayout />', () => {
  describe('negative cases', () => {
    it('shows the preloader before hydration has started', async () => {
      await render(<RootLayout />);

      expect(screen.getByLabelText('Loading')).toBeOnTheScreen();
      expect(screen.queryByTestId('stack')).not.toBeOnTheScreen();
    });

    it('shows the preloader and does not mount screens while auth is hydrating', async () => {
      store.dispatch(hydrateAuth.pending('hydrate-request'));

      await render(<RootLayout />);

      expect(screen.getByLabelText('Loading')).toBeOnTheScreen();
      expect(screen.queryByTestId('stack')).not.toBeOnTheScreen();
    });
  });

  describe('positive cases', () => {
    it('mounts the screens once hydration is done', async () => {
      store.dispatch(hydrateAuth.fulfilled(null, 'hydrate-request'));

      await render(<RootLayout />);

      expect(screen.getByTestId('stack')).toBeOnTheScreen();
      expect(screen.queryByLabelText('Loading')).not.toBeOnTheScreen();
    });

    it('shows a visible error in the banner and dismisses it', async () => {
      const user = userEvent.setup();
      store.dispatch(hydrateAuth.fulfilled(null, 'hydrate-request'));
      store.dispatch(pushError({ message: 'Server unavailable', source: 'manual', type: 'frontend-error' }));

      await render(<RootLayout />);

      expect(screen.getByRole('alert')).toHaveTextContent('Server unavailable');

      await user.press(screen.getByRole('button', { name: 'Dismiss' }));

      expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
    });
  });
});
