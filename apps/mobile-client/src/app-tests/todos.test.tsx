import { sessionRestored, store } from '@prod-forge-todolist-frontend/core';
import { applyTodosQuery, todos } from '@prod-forge-todolist-frontend/test-data';
import { screen, userEvent, waitFor } from '@testing-library/react-native';

import TodosScreen from '../app/todos/index';
import { mockRouter } from '../test-utils/expo-router-mock';
import { backendErrorResponse, fetchCalls, mockFakeBackend } from '../test-utils/fake-backend';
import { prepareStore, renderWithStore } from '../test-utils/render-with-store';

jest.mock('expo-router', () => jest.requireActual<Record<string, unknown>>('../test-utils/expo-router-mock'));

const firstPage = applyTodosQuery(todos, { order: 'asc', sortBy: 'title' }).data;
// First item of the second page: the one an offset that counts optimistic rows would skip.
const firstPageBoundaryTitle = applyTodosQuery(todos, { offset: firstPage.length, order: 'asc', sortBy: 'title' })
  .data[0].title;

const renderSignedIn = async (): Promise<void> => {
  store.dispatch(sessionRestored({ token: 'test-token', user: { email: 'a@b.com' } }));
  await renderWithStore(<TodosScreen />);
};

let fetchMock: ReturnType<typeof mockFakeBackend>;

beforeEach(() => {
  prepareStore();
  jest.clearAllMocks();
  fetchMock = mockFakeBackend();
});

afterEach(() => {
  fetchMock.mockRestore();
});

describe('<TodosScreen />', () => {
  describe('negative cases', () => {
    it('shows the error banner with a retry button when the list request fails with 500', async () => {
      fetchMock.mockResolvedValueOnce(backendErrorResponse(500, 'INTERNAL_ERROR'));
      await renderSignedIn();

      expect(await screen.findByRole('alert')).toHaveTextContent('Failed to load tasks.');
      expect(screen.getByRole('button', { name: 'Retry' })).toBeOnTheScreen();
    });

    it('loads the list again when retry is pressed', async () => {
      const user = userEvent.setup();
      fetchMock.mockResolvedValueOnce(backendErrorResponse(500, 'INTERNAL_ERROR'));
      await renderSignedIn();

      await user.press(await screen.findByRole('button', { name: 'Retry' }));

      expect(await screen.findAllByTestId('todo-row')).toHaveLength(firstPage.length);
      expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
    });

    it('shows the empty state when the backend has no todos', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [], meta: { limit: 10, offset: 0, total: 0 } }), { status: 200 }),
      );
      await renderSignedIn();

      expect(await screen.findByText('No tasks yet. Add the first one above.')).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeOnTheScreen();
    });

    it('redirects to /login when signed out', async () => {
      await renderWithStore(<TodosScreen />);

      expect(screen.getByTestId('redirect')).toHaveTextContent('/login');
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('positive cases', () => {
    it('renders the first page and loads all 16 todos from test-data with "Load more"', async () => {
      const user = userEvent.setup();
      await renderSignedIn();

      expect(await screen.findAllByTestId('todo-row')).toHaveLength(firstPage.length);

      await user.press(screen.getByRole('button', { name: 'Load more' }));

      await waitFor(() => {
        expect(screen.getAllByTestId('todo-row')).toHaveLength(todos.length);
      });
      expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeOnTheScreen();
    });

    it('sends PATCH when a todo is toggled', async () => {
      const user = userEvent.setup();
      await renderSignedIn();
      const openTodo = firstPage.find((todo) => !todo.completed);

      await user.press(await screen.findByLabelText(`Mark "${String(openTodo?.title)}" as done`));

      await waitFor(() => {
        expect(fetchCalls(fetchMock, 'PATCH')).toEqual([`http://localhost:3000/api/v1/todos/${String(openTodo?.id)}`]);
      });
      expect(screen.getByLabelText(`Mark "${String(openTodo?.title)}" as to do`)).toBeOnTheScreen();
    });

    it('sends POST and inserts the new todo optimistically', async () => {
      const user = userEvent.setup();
      await renderSignedIn();
      await screen.findAllByTestId('todo-row');

      await user.type(screen.getByLabelText('Title'), 'Brand new task');
      await user.press(screen.getByRole('button', { name: 'Add task' }));

      expect(screen.getByText('Brand new task')).toBeOnTheScreen();
      expect(screen.getAllByTestId('todo-row')).toHaveLength(firstPage.length + 1);
      await waitFor(() => {
        expect(fetchCalls(fetchMock, 'POST')).toEqual(['http://localhost:3000/api/v1/todos']);
      });
    });

    it('loads every server todo with "Load more" after adding one that sorts past the first page', async () => {
      const user = userEvent.setup();
      await renderSignedIn();
      await screen.findAllByTestId('todo-row');

      await user.type(screen.getByLabelText('Title'), 'ZZZ Last task');
      await user.press(screen.getByRole('button', { name: 'Add task' }));
      await waitFor(() => {
        expect(fetchCalls(fetchMock, 'POST')).toHaveLength(1);
      });
      await user.press(screen.getByRole('button', { name: 'Load more' }));

      await waitFor(() => {
        expect(screen.getAllByTestId('todo-row')).toHaveLength(todos.length + 1);
      });
      expect(screen.getByText(firstPageBoundaryTitle)).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeOnTheScreen();
    });

    it('opens the detail screen when a todo is pressed', async () => {
      const user = userEvent.setup();
      await renderSignedIn();

      await user.press(await screen.findByLabelText(`Open "${firstPage[0].title}"`));

      expect(mockRouter.push).toHaveBeenCalledWith(`/todos/${firstPage[0].id}`);
    });
  });
});
