import { selectIsAuthenticated, store } from '@prod-forge-todolist-frontend/core';
import { screen, userEvent } from '@testing-library/react-native';

import LoginScreen from '../app/login';
import { mockRouter } from '../test-utils/expo-router-mock';
import { prepareStore, renderWithStore } from '../test-utils/render-with-store';

jest.mock('expo-router', () => jest.requireActual<Record<string, unknown>>('../test-utils/expo-router-mock'));

beforeEach(() => {
  prepareStore();
  jest.clearAllMocks();
});

describe('<LoginScreen />', () => {
  describe('negative cases', () => {
    it('shows the loginSchema error for an empty email and stays signed out', async () => {
      const user = userEvent.setup();
      await renderWithStore(<LoginScreen />);

      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.press(screen.getByRole('button', { name: 'Sign in' }));

      expect(screen.getByText('Email is required')).toBeOnTheScreen();
      expect(selectIsAuthenticated(store.getState())).toBe(false);
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('shows the loginSchema error for a malformed email', async () => {
      const user = userEvent.setup();
      await renderWithStore(<LoginScreen />);

      await user.type(screen.getByLabelText('Email'), 'not-an-email');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.press(screen.getByRole('button', { name: 'Sign in' }));

      expect(screen.getByText('Enter a valid email')).toBeOnTheScreen();
    });
  });

  describe('positive cases', () => {
    it('signs in with a valid email and replaces the route with /todos', async () => {
      const user = userEvent.setup();
      await renderWithStore(<LoginScreen />);

      await user.type(screen.getByLabelText('Email'), 'a@b.com');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.press(screen.getByRole('button', { name: 'Sign in' }));

      expect(selectIsAuthenticated(store.getState())).toBe(true);
      expect(mockRouter.replace).toHaveBeenCalledWith('/todos');
    });

    it('opens the register screen', async () => {
      const user = userEvent.setup();
      await renderWithStore(<LoginScreen />);

      await user.press(screen.getByRole('button', { name: 'Create an account' }));

      expect(mockRouter.push).toHaveBeenCalledWith('/register');
    });
  });
});
