import type * as CoreModule from '@prod-forge-todolist-frontend/core';
import type { TodoFilters, TodosResponse } from '@prod-forge-todolist-frontend/core';

import {
  authReducer,
  filterTodos,
  login,
  sortTodos,
  todos,
  todosApi,
  todosReducer,
} from '@prod-forge-todolist-frontend/core';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Home } from './home';

vi.mock('@prod-forge-todolist-frontend/core', async (importActual) => {
  const actual = await importActual<typeof CoreModule>();

  return {
    ...actual,
    todosApi: {
      create: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn(),
      getOne: vi.fn(),
      update: vi.fn(),
    },
  };
});

const applyFilters = (filters: TodoFilters): Promise<TodosResponse> => {
  const filtered = filterTodos(todos.data, filters.query);
  const sorted = sortTodos(filtered, filters.sortBy, filters.order);
  const page = sorted.slice(filters.offset, filters.offset + filters.limit);

  return Promise.resolve({
    data: page,
    meta: { limit: filters.limit, offset: filters.offset, total: sorted.length },
  });
};

const renderHome = async (options: { authenticated?: boolean } = {}): Promise<ReturnType<typeof render>> => {
  const { authenticated = true } = options;
  const store = configureStore({ reducer: { auth: authReducer, todos: todosReducer } });

  if (authenticated) {
    store.dispatch(login({ email: 'a@b.com' }));
  }

  const result = render(
    <Provider store={store}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </Provider>,
  );

  if (authenticated) {
    await screen.findAllByRole('article');
  }

  return result;
};

const firstPage = sortTodos(todos.data, 'title', 'asc').slice(0, 10);
const completedCount = firstPage.filter((t) => t.completed).length;
const totalCount = todos.data.length;

beforeEach(() => {
  vi.mocked(todosApi.getAll).mockImplementation(applyFilters);
  vi.mocked(todosApi.create).mockResolvedValue({
    completed: false,
    description: '',
    id: 'new-id',
    title: '',
  });
  vi.mocked(todosApi.update).mockImplementation((id, data) =>
    Promise.resolve({
      completed: false,
      description: '',
      id,
      title: '',
      ...data,
    }),
  );
  vi.mocked(todosApi.delete).mockResolvedValue();
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('<Home /> page — unauthenticated', () => {
  describe('positive cases', () => {
    it('shows the welcome heading and asks the user to sign in or create an account', async () => {
      await renderHome({ authenticated: false });

      expect(screen.getByRole('heading', { level: 1, name: /welcome to todoai/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
      expect(screen.getByRole('link', { name: /create account/i })).toHaveAttribute('href', '/register');
    });

    it('does not render the todo list when unauthenticated', async () => {
      await renderHome({ authenticated: false });

      expect(screen.queryByRole('article')).not.toBeInTheDocument();
      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    });
  });
});

describe('<Home /> page — authenticated', () => {
  describe('positive cases', () => {
    it('renders the heading and the "X of Y completed" summary', async () => {
      await renderHome();

      expect(screen.getByRole('heading', { level: 1, name: /my tasks/i })).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`${completedCount} of ${totalCount} completed`))).toBeInTheDocument();
    });

    it('renders the first page of todos (default limit = 10)', async () => {
      await renderHome();

      expect(screen.getAllByRole('article')).toHaveLength(10);
    });

    it('filters todos by title via the search field', async () => {
      const user = userEvent.setup();
      await renderHome();

      await user.type(screen.getByRole('searchbox'), 'storybook');
      const cards = await screen.findAllByRole('article');

      expect(cards).toHaveLength(1);
      expect(within(cards[0]).getByRole('link', { name: 'Storybook integration' })).toBeInTheDocument();
    });

    it('also filters by todo description', async () => {
      const user = userEvent.setup();
      await renderHome();

      await user.type(screen.getByRole('searchbox'), 'zustand');
      const cards = await screen.findAllByRole('article');

      expect(cards).toHaveLength(1);
      expect(within(cards[0]).getByRole('link', { name: 'State management' })).toBeInTheDocument();
    });

    it('shows the empty state when no todos match the search', async () => {
      const user = userEvent.setup();
      await renderHome();

      await user.type(screen.getByRole('searchbox'), 'definitely-no-match-zzz');
      await waitFor(() => expect(screen.queryAllByRole('article')).toHaveLength(0));

      expect(screen.getByText(/no tasks match your search/i)).toBeInTheDocument();
    });

    it('paginates: page 2 shows the remaining todos', async () => {
      const user = userEvent.setup();
      await renderHome();

      await user.click(screen.getByRole('button', { name: 'Page 2' }));
      const remaining = await screen.findAllByRole('article');

      expect(remaining).toHaveLength(totalCount - 10);
    });

    it('hides pagination once "Per page" is large enough to fit everything', async () => {
      const user = userEvent.setup();
      await renderHome();

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.selectOptions(screen.getByLabelText('Per page'), '50');

      const all = await screen.findAllByRole('article');
      expect(all).toHaveLength(totalCount);
      expect(screen.queryByRole('navigation', { name: /pagination/i })).not.toBeInTheDocument();
    });

    it('starts with the filters accordion collapsed and opens it on click', async () => {
      const user = userEvent.setup();
      await renderHome();

      const trigger = screen.getByRole('button', { name: /filters/i });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
      expect(screen.getByLabelText('Order')).toBeInTheDocument();
      expect(screen.getByLabelText('Per page')).toBeInTheDocument();
    });

    it('reorders the list when order changes to desc', async () => {
      const user = userEvent.setup();
      await renderHome();

      await user.click(screen.getByRole('button', { name: /filters/i }));
      await user.selectOptions(screen.getByLabelText('Order'), 'desc');

      const descFirstTitle = sortTodos(todos.data, 'title', 'desc')[0].title;
      const cards = await screen.findAllByRole('article');

      expect(within(cards[0]).getByRole('link', { name: descFirstTitle })).toBeInTheDocument();
    });

    it('resets to the first page when the search query changes', async () => {
      const user = userEvent.setup();
      await renderHome();

      await user.click(screen.getByRole('button', { name: 'Page 2' }));
      await screen.findAllByRole('article');

      await user.type(screen.getByRole('searchbox'), 'a');
      await screen.findAllByRole('article');

      expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    });

    it('every visible todo card has links pointing to its detail page', async () => {
      await renderHome();

      screen.getAllByRole('article').forEach((card) => {
        const titleLink = within(card).getAllByRole('link')[0];
        expect(titleLink.getAttribute('href')).toMatch(/^\/todo\/[\w-]+$/);
      });
    });

    it('toggling a todo status updates the completion summary', async () => {
      const user = userEvent.setup();
      await renderHome();

      const openCard = screen
        .getAllByRole('article')
        .find((card) => within(card).queryByRole('button', { name: /mark as done/i }))!;

      await user.click(within(openCard).getByRole('button', { name: /mark as done/i }));

      expect(screen.getByText(new RegExp(`${completedCount + 1} of ${totalCount} completed`))).toBeInTheDocument();
      expect(within(openCard).getByRole('button', { name: /mark as to do/i })).toBeInTheDocument();
    });

    it('toggling the same todo twice restores the original completion summary', async () => {
      const user = userEvent.setup();
      await renderHome();

      const openCard = screen
        .getAllByRole('article')
        .find((card) => within(card).queryByRole('button', { name: /mark as done/i }))!;

      await user.click(within(openCard).getByRole('button', { name: /mark as done/i }));
      await user.click(within(openCard).getByRole('button', { name: /mark as to do/i }));

      expect(screen.getByText(new RegExp(`${completedCount} of ${totalCount} completed`))).toBeInTheDocument();
    });

    it('renders the "Add a task" form at the top with title and description fields', async () => {
      await renderHome();

      expect(screen.getByRole('heading', { level: 2, name: /add a task/i })).toBeInTheDocument();
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
    });

    it('adds a new todo optimistically and shows it in the list', async () => {
      const user = userEvent.setup();
      vi.mocked(todosApi.create).mockResolvedValue({
        completed: false,
        description: 'fresh todo',
        id: 'new-real-id',
        title: 'AAA Brand new task',
      });
      await renderHome();

      await user.type(screen.getByLabelText('Title'), 'AAA Brand new task');
      await user.type(screen.getByLabelText('Description'), 'fresh todo');
      await user.click(screen.getByRole('button', { name: /add task/i }));

      expect(screen.getByText(new RegExp(`${completedCount} of ${totalCount + 1} completed`))).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'AAA Brand new task' })).toBeInTheDocument();
    });

    it('preserves the typed title when the API response returns an empty title', async () => {
      const user = userEvent.setup();
      vi.mocked(todosApi.create).mockResolvedValue({
        completed: false,
        description: '',
        id: 'new-real-id',
        title: '',
      });
      await renderHome();

      await user.type(screen.getByLabelText('Title'), 'AAA Preserved title');
      await user.click(screen.getByRole('button', { name: /add task/i }));

      expect(await screen.findByRole('link', { name: 'AAA Preserved title' })).toBeInTheDocument();
    });

    it('clears the form fields after a successful submit', async () => {
      const user = userEvent.setup();
      await renderHome();

      await user.type(screen.getByLabelText('Title'), 'AAA Cleared after submit');
      await user.click(screen.getByRole('button', { name: /add task/i }));

      expect(screen.getByLabelText('Title')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
    });

    it('shows the preloader while the initial fetch is pending', () => {
      vi.mocked(todosApi.getAll).mockReturnValue(
        new Promise(() => {
          return;
        }),
      );
      const store = configureStore({ reducer: { auth: authReducer, todos: todosReducer } });
      store.dispatch(login({ email: 'a@b.com' }));

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </Provider>,
      );

      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
    });

    it('dispatches clearErrors and re-fetches todos when the retry button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(todosApi.getAll).mockRejectedValue(new Error('Network error'));
      const store = configureStore({ reducer: { auth: authReducer, todos: todosReducer } });
      store.dispatch(login({ email: 'a@b.com' }));
      const dispatchSpy = vi.spyOn(store, 'dispatch');

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      const getAllCallsBefore = vi.mocked(todosApi.getAll).mock.calls.length;

      await user.click(screen.getByRole('button', { name: /retry/i }));

      const dispatchedTypes = dispatchSpy.mock.calls.flatMap(([action]) =>
        typeof action === 'object' && action !== null && 'type' in action ? [(action as { type: string }).type] : [],
      );

      expect(dispatchedTypes).toContain('errors/clearErrors');
      expect(vi.mocked(todosApi.getAll).mock.calls.length).toBeGreaterThan(getAllCallsBefore);
    });

    it('hides the error block and shows todos after a successful retry', async () => {
      const user = userEvent.setup();
      vi.mocked(todosApi.getAll).mockRejectedValueOnce(new Error('Network error')).mockImplementation(applyFilters);
      const store = configureStore({ reducer: { auth: authReducer, todos: todosReducer } });
      store.dispatch(login({ email: 'a@b.com' }));

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /retry/i }));

      await screen.findAllByRole('article');
      expect(screen.queryByText(/Please refresh the page/i)).not.toBeInTheDocument();
    });
  });

  describe('negative cases', () => {
    it('rejects an empty title and does not add a todo', async () => {
      const user = userEvent.setup();
      await renderHome();

      await user.click(screen.getByRole('button', { name: /add task/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/title is required/i);
      expect(screen.getByText(new RegExp(`${completedCount} of ${totalCount} completed`))).toBeInTheDocument();
    });

    it('shows an error message when fetching fails', async () => {
      vi.mocked(todosApi.getAll).mockRejectedValue(new Error('Network error'));
      const store = configureStore({ reducer: { auth: authReducer, todos: todosReducer } });
      store.dispatch(login({ email: 'a@b.com' }));

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/Please refresh the page/i)).toBeInTheDocument();
      });
    });

    it('shows the retry button in the error block when fetching fails', async () => {
      vi.mocked(todosApi.getAll).mockRejectedValue(new Error('Network error'));
      const store = configureStore({ reducer: { auth: authReducer, todos: todosReducer } });
      store.dispatch(login({ email: 'a@b.com' }));

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </Provider>,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });
  });
});
