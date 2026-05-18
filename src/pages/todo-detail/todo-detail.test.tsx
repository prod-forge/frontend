import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { todosApi } from '../../api/todos.api';
import { FAKE_TOKEN } from '../../features/auth/auth.constants';
import { authReducer, login } from '../../features/auth/auth.slices';
import { errorMiddleware } from '../../features/errors/error-middleware';
import { errorsReducer } from '../../features/errors/errors.slice';
import { TITLE_MAX_LENGTH } from '../../features/todos/todos.schemas';
import { todosReducer } from '../../features/todos/todos.slices';
import { todos } from '../../test/data/todos';
import { TodoDetail } from './todo-detail';

vi.mock('../../api/todos.api', () => ({
  todosApi: {
    create: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(),
    getOne: vi.fn(),
    update: vi.fn(),
  },
}));

const openTodo = todos.data.find((t) => !t.completed)!;
const completedTodo = todos.data.find((t) => t.completed)!;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const renderAt = (path: string, options: { authenticated?: boolean } = {}) => {
  const { authenticated = true } = options;
  const store = configureStore({
    middleware: (getDefault) => getDefault().concat(errorMiddleware),
    reducer: { auth: authReducer, errors: errorsReducer, todos: todosReducer },
  });

  if (authenticated) {
    store.dispatch(login({ email: 'a@b.com' }));
  }

  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<TodoDetail />} path="/todo/:id" />
          <Route element={<div data-testid="home">Home</div>} path="/" />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  return { store, ...result };
};

beforeEach(() => {
  vi.mocked(todosApi.getOne).mockResolvedValue(openTodo);
  vi.mocked(todosApi.update).mockImplementation((id, data) =>
    Promise.resolve({ completed: false, description: '', id, title: '', ...data }),
  );
  vi.mocked(todosApi.delete).mockResolvedValue();
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('<TodoDetail /> page', () => {
  describe('negative cases', () => {
    it('redirects to home when the user is not authenticated', () => {
      renderAt(`/todo/${openTodo.id}`, { authenticated: false });

      expect(screen.getByTestId('home')).toBeInTheDocument();
      expect(screen.queryByRole('status', { name: /loading/i })).not.toBeInTheDocument();
    });

    it('shows an error message with retry button when the fetch fails', async () => {
      vi.mocked(todosApi.getOne).mockRejectedValue(new Error('Network error'));
      renderAt(`/todo/${openTodo.id}`);

      expect(await screen.findByText(/failed to load task/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('does not render the card in the error state', async () => {
      vi.mocked(todosApi.getOne).mockRejectedValue(new Error('Network error'));
      renderAt(`/todo/${openTodo.id}`);

      await screen.findByText(/failed to load task/i);

      expect(screen.queryByRole('button', { name: /delete task/i })).not.toBeInTheDocument();
    });

    it('shows empty state with a link when the todo is not found (404)', async () => {
      vi.mocked(todosApi.getOne).mockRejectedValue(Object.assign(new Error('Not Found'), { status: 404 }));
      renderAt(`/todo/missing-id`);

      expect(await screen.findByText(/task not found/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /go back to home/i })).toHaveAttribute('href', '/');
    });

    it('does not render the back-arrow link in the not-found state', async () => {
      vi.mocked(todosApi.getOne).mockRejectedValue(Object.assign(new Error('Not Found'), { status: 404 }));
      renderAt(`/todo/missing-id`);

      await screen.findByText(/task not found/i);

      expect(screen.queryByRole('link', { name: /^back to home$/i })).not.toBeInTheDocument();
    });

    it('does not render the card in the not-found state', async () => {
      vi.mocked(todosApi.getOne).mockRejectedValue(Object.assign(new Error('Not Found'), { status: 404 }));
      renderAt(`/todo/missing-id`);

      await screen.findByText(/task not found/i);

      expect(screen.queryByRole('button', { name: /delete task/i })).not.toBeInTheDocument();
    });

    it('does not push a visible error to the store when the todo is not found (404)', async () => {
      vi.mocked(todosApi.getOne).mockRejectedValue(Object.assign(new Error('Not Found'), { status: 404 }));
      const { store } = renderAt(`/todo/missing-id`);

      await screen.findByText(/task not found/i);

      const { errors } = store.getState().errors;
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.every((e) => e.silent)).toBe(true);
    });

    it('pushes a visible error to the store when the fetch fails with a non-404 error', async () => {
      vi.mocked(todosApi.getOne).mockRejectedValue(new Error('Network error'));
      const { store } = renderAt(`/todo/${openTodo.id}`);

      await screen.findByText(/failed to load task/i);

      const { errors } = store.getState().errors;
      expect(errors.some((e) => !e.silent)).toBe(true);
    });

    it('keeps the original title when validation fails', async () => {
      const user = userEvent.setup();
      renderAt(`/todo/${openTodo.id}`);
      await screen.findByRole('heading', { level: 1, name: openTodo.title });

      await user.click(screen.getByRole('button', { name: /edit title/i }));
      const input = screen.getByRole('textbox', { name: /title/i });
      await user.clear(input);
      await user.type(input, 'a'.repeat(TITLE_MAX_LENGTH + 1));
      await user.keyboard('{Enter}');

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('positive cases', () => {
    it('shows the preloader while the fetch is pending', () => {
      vi.mocked(todosApi.getOne).mockReturnValue(
        new Promise(() => {
          return;
        }),
      );
      renderAt(`/todo/${openTodo.id}`);

      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
    });

    it('renders the todo title and description after a successful fetch', async () => {
      renderAt(`/todo/${openTodo.id}`);

      expect(await screen.findByRole('heading', { level: 1, name: openTodo.title })).toBeInTheDocument();
      expect(screen.getByText(openTodo.description)).toBeInTheDocument();
    });

    it('shows "Done" status for a completed todo', async () => {
      vi.mocked(todosApi.getOne).mockResolvedValue(completedTodo);
      renderAt(`/todo/${completedTodo.id}`);

      await screen.findByRole('heading', { level: 1, name: completedTodo.title });

      expect(screen.getByText('Done')).toBeInTheDocument();
      expect(screen.queryByText('To Do')).not.toBeInTheDocument();
    });

    it('shows "To Do" status for an open todo', async () => {
      renderAt(`/todo/${openTodo.id}`);

      await screen.findByRole('heading', { level: 1, name: openTodo.title });

      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.queryByText('Done')).not.toBeInTheDocument();
    });

    it('renders a "Back to Home" link pointing to /', async () => {
      renderAt(`/todo/${openTodo.id}`);

      await screen.findByRole('heading', { level: 1, name: openTodo.title });

      expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
    });

    it('persists the auth token in localStorage on login', async () => {
      renderAt(`/todo/${openTodo.id}`);
      await screen.findByRole('heading', { level: 1, name: openTodo.title });

      expect(localStorage.getItem('auth-token')).toBe(FAKE_TOKEN);
    });

    it('lets the user edit the title and reflects it in the heading', async () => {
      const user = userEvent.setup();
      renderAt(`/todo/${openTodo.id}`);
      await screen.findByRole('heading', { level: 1, name: openTodo.title });

      await user.click(screen.getByRole('button', { name: /edit title/i }));
      const input = screen.getByRole('textbox', { name: /title/i });
      await user.clear(input);
      await user.type(input, 'Updated title{Enter}');

      expect(screen.getByRole('heading', { level: 1, name: 'Updated title' })).toBeInTheDocument();
    });

    it('lets the user edit the description and reflects it on the page', async () => {
      const user = userEvent.setup();
      renderAt(`/todo/${openTodo.id}`);
      await screen.findByRole('heading', { level: 1, name: openTodo.title });

      await user.click(screen.getByRole('button', { name: /edit description/i }));
      const textarea = screen.getByRole('textbox', { name: /description/i });
      await user.clear(textarea);
      await user.type(textarea, 'Updated description{Enter}');

      expect(screen.getByText('Updated description')).toBeInTheDocument();
    });

    it('renders a delete button in the top-right of the card', async () => {
      renderAt(`/todo/${openTodo.id}`);
      await screen.findByRole('heading', { level: 1, name: openTodo.title });

      expect(screen.getByRole('button', { name: /delete task/i })).toBeInTheDocument();
    });

    it('opens the confirmation modal when the delete button is clicked', async () => {
      const user = userEvent.setup();
      renderAt(`/todo/${openTodo.id}`);
      await screen.findByRole('heading', { level: 1, name: openTodo.title });

      await user.click(screen.getByRole('button', { name: /delete task/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /are you sure you want to delete\?/i })).toBeInTheDocument();
    });

    it('closes the modal without deleting when clicking outside', async () => {
      const user = userEvent.setup();
      renderAt(`/todo/${openTodo.id}`);
      await screen.findByRole('heading', { level: 1, name: openTodo.title });

      await user.click(screen.getByRole('button', { name: /delete task/i }));
      await user.click(screen.getByTestId('modal-overlay'));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: openTodo.title })).toBeInTheDocument();
    });

    it('closes the modal without deleting when clicking Cancel', async () => {
      const user = userEvent.setup();
      renderAt(`/todo/${openTodo.id}`);
      await screen.findByRole('heading', { level: 1, name: openTodo.title });

      await user.click(screen.getByRole('button', { name: /delete task/i }));
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: openTodo.title })).toBeInTheDocument();
    });

    it('deletes the todo and navigates to home when Delete is confirmed', async () => {
      const user = userEvent.setup();
      renderAt(`/todo/${openTodo.id}`);
      await screen.findByRole('heading', { level: 1, name: openTodo.title });

      await user.click(screen.getByRole('button', { name: /delete task/i }));
      await user.click(screen.getByRole('button', { name: /^delete$/i }));

      expect(screen.getByTestId('home')).toBeInTheDocument();
    });

    it('dispatches clearErrors and re-fetches when the retry button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(todosApi.getOne).mockRejectedValue(new Error('Network error'));
      const { store } = renderAt(`/todo/${openTodo.id}`);
      const dispatchSpy = vi.spyOn(store, 'dispatch');

      await screen.findByRole('button', { name: /retry/i });

      const getOneCallsBefore = vi.mocked(todosApi.getOne).mock.calls.length;

      await user.click(screen.getByRole('button', { name: /retry/i }));

      const dispatchedTypes = dispatchSpy.mock.calls.flatMap(([action]) =>
        typeof action === 'object' && action !== null && 'type' in action ? [(action as { type: string }).type] : [],
      );

      expect(dispatchedTypes).toContain('errors/clearErrors');
      expect(vi.mocked(todosApi.getOne).mock.calls.length).toBeGreaterThan(getOneCallsBefore);
    });

    it('shows the todo after a successful retry', async () => {
      const user = userEvent.setup();
      vi.mocked(todosApi.getOne).mockRejectedValueOnce(new Error('Network error')).mockResolvedValue(openTodo);
      renderAt(`/todo/${openTodo.id}`);

      await screen.findByRole('button', { name: /retry/i });

      await user.click(screen.getByRole('button', { name: /retry/i }));

      await screen.findByRole('heading', { level: 1, name: openTodo.title });
      expect(screen.queryByText(/failed to load task/i)).not.toBeInTheDocument();
    });
  });
});
