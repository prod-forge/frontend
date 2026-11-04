import { selectAuthUser, store } from '@prod-forge-todolist-frontend/core';
import { screen, userEvent, waitFor } from '@testing-library/react-native';

import RegisterScreen from '../app/register';
import { mockRouter } from '../test-utils/expo-router-mock';
import { mockFakeBackend, TEST_ACCESS_TOKEN } from '../test-utils/fake-backend';
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

describe('<RegisterScreen />', () => {
  describe('negative cases', () => {
    it('shows the registerSchema error for a too short password', async () => {
      const user = userEvent.setup();
      await renderWithStore(<RegisterScreen />);

      await user.type(screen.getByLabelText('Email'), 'a@b.com');
      await user.type(screen.getByLabelText('Password'), 'ab');
      await user.press(screen.getByRole('button', { name: 'Create account' }));

      expect(screen.getByText('Password must be at least 3 characters')).toBeOnTheScreen();
      expect(selectAuthUser(store.getState())).toBeNull();
    });
  });

  describe('positive cases', () => {
    it('logs the existing user in, keeps the name and replaces the route with /todos', async () => {
      const user = userEvent.setup();
      await renderWithStore(<RegisterScreen />);

      await user.type(screen.getByLabelText('Name'), 'Alice');
      await user.type(screen.getByLabelText('Email'), 'alice@example.com');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.press(screen.getByRole('button', { name: 'Create account' }));

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/todos');
      });
      expect(selectAuthUser(store.getState())).toEqual({ email: 'alice@example.com', name: 'Alice' });
      expect(store.getState().auth.token).toBe(TEST_ACCESS_TOKEN);
    });
  });
});
