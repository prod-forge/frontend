import type { AlertButton } from 'react-native';

import { login, store } from '@prod-forge-todolist-frontend/core';
import { todos } from '@prod-forge-todolist-frontend/test-data';
import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import TodoDetailScreen from '../app/todos/[id]';
import { mockRouter, mockSearchParams } from '../test-utils/expo-router-mock';
import { fetchBodies, fetchCalls, mockFakeBackend } from '../test-utils/fake-backend';
import { prepareStore, renderWithStore } from '../test-utils/render-with-store';

jest.mock('expo-router', () => jest.requireActual<Record<string, unknown>>('../test-utils/expo-router-mock'));

const todo = todos[0];
const todoUrl = `http://localhost:3000/api/v1/todos/${todo.id}`;

const renderDetail = async (id: string): Promise<void> => {
  mockSearchParams.current = { id };
  store.dispatch(login({ email: 'a@b.com' }));
  await renderWithStore(<TodoDetailScreen />);
};

// Presses the button of the native confirmation dialog whose style matches.
const answerAlertWith = (style: AlertButton['style']): jest.SpyInstance =>
  jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
    buttons?.find((button) => button.style === style)?.onPress?.();
  });

let fetchMock: ReturnType<typeof mockFakeBackend>;

beforeEach(() => {
  prepareStore();
  jest.clearAllMocks();
  fetchMock = mockFakeBackend();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('<TodoDetailScreen />', () => {
  describe('negative cases', () => {
    it('shows the "Not found" screen when the API answers 404', async () => {
      await renderDetail('missing-id');

      expect(await screen.findByText('Not found')).toBeOnTheScreen();
      expect(screen.queryByLabelText('Title')).not.toBeOnTheScreen();
    });

    it('shows the titleSchema error and sends no PATCH for an empty title', async () => {
      const user = userEvent.setup();
      await renderDetail(todo.id);

      await user.clear(await screen.findByLabelText('Title'));
      await user.press(screen.getByRole('button', { name: 'Save changes' }));

      expect(screen.getByText('Title is required')).toBeOnTheScreen();
      expect(fetchCalls(fetchMock, 'PATCH')).toEqual([]);
    });

    it('does not send DELETE when the deletion is cancelled', async () => {
      const user = userEvent.setup();
      answerAlertWith('cancel');
      await renderDetail(todo.id);

      await user.press(await screen.findByRole('button', { name: 'Delete task' }));

      expect(fetchCalls(fetchMock, 'DELETE')).toEqual([]);
      expect(mockRouter.back).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    it('sends PATCH with the edited title', async () => {
      const user = userEvent.setup();
      await renderDetail(todo.id);

      const titleField = await screen.findByLabelText('Title');
      await user.clear(titleField);
      await user.type(titleField, 'Renamed task');
      await user.press(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() => {
        expect(fetchCalls(fetchMock, 'PATCH')).toEqual([todoUrl]);
      });
      expect(fetchBodies(fetchMock, 'PATCH')).toEqual([{ title: 'Renamed task' }]);
      expect(screen.getByLabelText('Title')).toHaveDisplayValue('Renamed task');
    });

    it('sends DELETE after confirmation and navigates back', async () => {
      const user = userEvent.setup();
      answerAlertWith('destructive');
      await renderDetail(todo.id);

      await user.press(await screen.findByRole('button', { name: 'Delete task' }));

      await waitFor(() => {
        expect(mockRouter.back).toHaveBeenCalledTimes(1);
      });
      expect(fetchCalls(fetchMock, 'DELETE')).toEqual([todoUrl]);
    });
  });
});
