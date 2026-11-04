import { selectIsAuthenticated, store, UNKNOWN_EMAIL_MESSAGE } from '@prod-forge-todolist-frontend/core';
import { screen, userEvent, waitFor } from '@testing-library/react-native';

import LoginScreen from '../app/login';
import { mockRouter } from '../test-utils/expo-router-mock';
import { fetchBodies, mockFakeBackend, TEST_ACCESS_TOKEN, UNKNOWN_TEST_EMAIL } from '../test-utils/fake-backend';
import { prepareStore, renderWithStore } from '../test-utils/render-with-store';

jest.mock('expo-router', () => jest.requireActual<Record<string, unknown>>('../test-utils/expo-router-mock'));

let fetchMock: ReturnType<typeof mockFakeBackend>;

beforeEach(() => {
  prepareStore();
  jest.clearAllMocks();
  fetchMock = mockFakeBackend();
});

afterEach(() => {
  fetchMock.mockRestore();
});

const signIn = async (email: string): Promise<void> => {
  const user = userEvent.setup();
  await renderWithStore(<LoginScreen />);

  await user.type(screen.getByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Password'), 'secret');
  await user.press(screen.getByRole('button', { name: 'Sign in' }));
};

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
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('shows the loginSchema error for a malformed email', async () => {
      const user = userEvent.setup();
      await renderWithStore(<LoginScreen />);

      await user.type(screen.getByLabelText('Email'), 'not-an-email');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.press(screen.getByRole('button', { name: 'Sign in' }));

      expect(screen.getByText('Enter a valid email')).toBeOnTheScreen();
    });

    it('stays signed out and pushes the unknown-email error when the backend answers 401', async () => {
      await signIn(UNKNOWN_TEST_EMAIL);

      await waitFor(() => {
        expect(store.getState().errors.errors.map((error) => error.message)).toEqual([UNKNOWN_EMAIL_MESSAGE]);
      });
      expect(selectIsAuthenticated(store.getState())).toBe(false);
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    it('signs in against the backend and replaces the route with /todos', async () => {
      await signIn('a@b.com');

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/todos');
      });
      expect(store.getState().auth.token).toBe(TEST_ACCESS_TOKEN);
      expect(fetchBodies(fetchMock, 'POST')).toEqual([{ email: 'a@b.com' }]);
    });

    it('opens the register screen', async () => {
      const user = userEvent.setup();
      await renderWithStore(<LoginScreen />);

      await user.press(screen.getByRole('button', { name: 'Create an account' }));

      expect(mockRouter.push).toHaveBeenCalledWith('/register');
    });
  });
});
