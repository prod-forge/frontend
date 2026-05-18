import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TodosResponse } from '../../interfaces/todos';
import type { Todo, TodoFilters, TodosState } from './todos.types';

import {
  addTodo,
  deleteTodo,
  fetchTodoById,
  fetchTodos,
  setLimit,
  setOffset,
  setOrder,
  setSortBy,
  todosReducer,
  toggleTodo,
  updateFilters,
  updateTodo,
} from './todos.slices';

vi.mock('../../api/todos.api', () => ({
  todosApi: {
    create: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(),
    getOne: vi.fn(),
    update: vi.fn(),
  },
}));

import { todosApi } from '../../api/todos.api';

const todoA: Todo = { completed: false, description: 'desc-a', id: 'a', title: 'Apple' };
const todoB: Todo = { completed: true, description: 'desc-b', id: 'b', title: 'Banana' };

const defaultFilters: TodoFilters = { limit: 10, offset: 0, order: 'asc', query: '', sortBy: 'title' };

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const makeTodosStore = (preloadedItems: Todo[] = [], total = 0) =>
  configureStore({
    preloadedState: {
      todos: {
        _pendingDeletes: {},
        _pendingUpdates: {},
        currentTodo: null,
        currentTodoStatus: 'idle',
        filters: { limit: 10, offset: 0, order: 'asc', query: '', sortBy: 'title' } as TodoFilters,
        items: preloadedItems,
        status: 'idle',
        total,
      } satisfies TodosState,
    },
    reducer: { todos: todosReducer },
  });

beforeEach(() => {
  vi.resetAllMocks();
});

describe('todos slice — initial state', () => {
  describe('positive cases', () => {
    it('starts with empty items and idle status', () => {
      const store = makeTodosStore();
      const state = store.getState().todos;

      expect(state.items).toEqual([]);
      expect(state.status).toBe('idle');
      expect(state.total).toBe(0);
    });

    it('has the expected default filters', () => {
      const store = makeTodosStore();

      expect(store.getState().todos.filters).toEqual({
        limit: 10,
        offset: 0,
        order: 'asc',
        query: '',
        sortBy: 'title',
      });
    });
  });
});

describe('todos slice — fetchTodos', () => {
  const response: TodosResponse = {
    data: [todoA, todoB],
    meta: { limit: 10, offset: 0, total: 2 },
  };

  describe('negative cases', () => {
    it('sets status to error when rejected', async () => {
      vi.mocked(todosApi.getAll).mockRejectedValueOnce(new Error('Network error'));
      const store = makeTodosStore();

      await store.dispatch(fetchTodos(defaultFilters));

      expect(store.getState().todos.status).toBe('error');
    });
  });

  describe('positive cases', () => {
    it('sets status to loading on pending', () => {
      vi.mocked(todosApi.getAll).mockReturnValueOnce(
        new Promise(() => {
          return;
        }),
      );
      const store = makeTodosStore();

      void store.dispatch(fetchTodos(defaultFilters));

      expect(store.getState().todos.status).toBe('loading');
    });

    it('populates items and total on fulfilled', async () => {
      vi.mocked(todosApi.getAll).mockResolvedValueOnce(response);
      const store = makeTodosStore();

      await store.dispatch(fetchTodos(defaultFilters));

      const state = store.getState().todos;
      expect(state.items).toEqual([todoA, todoB]);
      expect(state.total).toBe(2);
      expect(state.status).toBe('idle');
    });
  });
});

describe('todos slice — fetchTodoById', () => {
  describe('negative cases', () => {
    it('sets currentTodoStatus to error for non-404 failures', async () => {
      vi.mocked(todosApi.getOne).mockRejectedValueOnce(new Error('Network error'));
      const store = makeTodosStore();

      await store.dispatch(fetchTodoById('any-id'));

      const state = store.getState().todos;
      expect(state.currentTodoStatus).toBe('error');
      expect(state.currentTodo).toBeNull();
    });

    it('sets currentTodoStatus to not-found for 404 failures', async () => {
      vi.mocked(todosApi.getOne).mockRejectedValueOnce(Object.assign(new Error('Not Found'), { status: 404 }));
      const store = makeTodosStore();

      await store.dispatch(fetchTodoById('missing'));

      const state = store.getState().todos;
      expect(state.currentTodoStatus).toBe('not-found');
      expect(state.currentTodo).toBeNull();
    });

    it('does not affect the items list on rejection', async () => {
      vi.mocked(todosApi.getOne).mockRejectedValueOnce(new Error('fail'));
      const store = makeTodosStore([todoA]);

      await store.dispatch(fetchTodoById('other'));

      expect(store.getState().todos.items).toEqual([todoA]);
    });
  });

  describe('positive cases', () => {
    it('sets currentTodo and currentTodoStatus to idle on fulfillment', async () => {
      vi.mocked(todosApi.getOne).mockResolvedValueOnce(todoA);
      const store = makeTodosStore();

      await store.dispatch(fetchTodoById(todoA.id));

      const state = store.getState().todos;
      expect(state.currentTodo).toEqual(todoA);
      expect(state.currentTodoStatus).toBe('idle');
    });

    it('sets currentTodoStatus to loading on pending', () => {
      vi.mocked(todosApi.getOne).mockReturnValueOnce(
        new Promise(() => {
          return;
        }),
      );
      const store = makeTodosStore();

      void store.dispatch(fetchTodoById(todoA.id));

      expect(store.getState().todos.currentTodoStatus).toBe('loading');
    });

    it('updates the matching item in the list on fulfillment', async () => {
      const updated = { ...todoA, title: 'Updated' };
      vi.mocked(todosApi.getOne).mockResolvedValueOnce(updated);
      const store = makeTodosStore([todoA]);

      await store.dispatch(fetchTodoById(todoA.id));

      expect(store.getState().todos.items[0].title).toBe('Updated');
    });

    it('does not add the fetched todo to items when not already in the list', async () => {
      vi.mocked(todosApi.getOne).mockResolvedValueOnce(todoA);
      const store = makeTodosStore();

      await store.dispatch(fetchTodoById(todoA.id));

      expect(store.getState().todos.items).toEqual([]);
    });
  });
});

describe('todos slice — addTodo', () => {
  describe('negative cases', () => {
    it('removes the optimistic item and decrements total on rejection', async () => {
      vi.mocked(todosApi.create).mockRejectedValueOnce(new Error('fail'));
      const store = makeTodosStore([todoA], 1);

      await store.dispatch(addTodo({ description: 'd', title: 't' }));

      const state = store.getState().todos;
      expect(state.items).toEqual([todoA]);
      expect(state.total).toBe(1);
    });
  });

  describe('positive cases', () => {
    it('prepends a temp item to items on pending', () => {
      vi.mocked(todosApi.create).mockReturnValueOnce(
        new Promise(() => {
          return;
        }),
      );
      const store = makeTodosStore([todoA], 1);

      void store.dispatch(addTodo({ description: 'd', title: 'New' }));

      const state = store.getState().todos;
      expect(state.items[0].title).toBe('New');
      expect(state.items[0].id).toMatch(/^optimistic-/);
      expect(state.total).toBe(2);
    });

    it('marks the optimistic item as not completed', () => {
      vi.mocked(todosApi.create).mockReturnValueOnce(
        new Promise(() => {
          return;
        }),
      );
      const store = makeTodosStore();

      void store.dispatch(addTodo({ description: '', title: 'New' }));

      expect(store.getState().todos.items[0].completed).toBe(false);
    });

    it('replaces the temp item with the API response on fulfilled', async () => {
      const created: Todo = { completed: false, description: 'd', id: 'real-id', title: 'New' };
      vi.mocked(todosApi.create).mockResolvedValueOnce(created);
      const store = makeTodosStore([todoA], 1);

      await store.dispatch(addTodo({ description: 'd', title: 'New' }));

      const state = store.getState().todos;
      expect(state.items.find((t) => t.id === 'real-id')).toBeDefined();
      expect(state.items.some((t) => t.id.startsWith('optimistic-'))).toBe(false);
    });

    it('preserves the optimistic title when the API response has an empty title', async () => {
      const created: Todo = { completed: false, description: 'd', id: 'real-id', title: '' };
      vi.mocked(todosApi.create).mockResolvedValueOnce(created);
      const store = makeTodosStore([todoA], 1);

      await store.dispatch(addTodo({ description: 'd', title: 'My Task' }));

      expect(store.getState().todos.items.find((t) => t.id === 'real-id')?.title).toBe('My Task');
    });
  });
});

describe('todos slice — deleteTodo', () => {
  describe('negative cases', () => {
    it('does not call the API and restores the item when the id is optimistic', async () => {
      const optimisticTodo: Todo = { ...todoA, id: 'optimistic-abc' };
      const store = makeTodosStore([optimisticTodo], 1);

      const result = await store.dispatch(deleteTodo(optimisticTodo.id));

      expect(todosApi.delete).not.toHaveBeenCalled();
      expect(store.getState().todos.items).toEqual([optimisticTodo]);
      expect(store.getState().todos.total).toBe(1);
      expect(result.payload).toEqual({ silent: true });
    });

    it('restores the item and increments total on rejection', async () => {
      vi.mocked(todosApi.delete).mockRejectedValueOnce(new Error('fail'));
      const store = makeTodosStore([todoA, todoB], 2);

      await store.dispatch(deleteTodo(todoA.id));

      const state = store.getState().todos;
      expect(state.items).toEqual([todoA, todoB]);
      expect(state.total).toBe(2);
    });

    it('is a no-op when the id does not exist', async () => {
      vi.mocked(todosApi.delete).mockResolvedValueOnce();
      const store = makeTodosStore([todoA], 1);

      await store.dispatch(deleteTodo('does-not-exist'));

      expect(store.getState().todos.items).toEqual([todoA]);
      expect(store.getState().todos.total).toBe(1);
    });
  });

  describe('positive cases', () => {
    it('removes the item optimistically on pending', () => {
      vi.mocked(todosApi.delete).mockReturnValueOnce(
        new Promise(() => {
          return;
        }),
      );
      const store = makeTodosStore([todoA, todoB], 2);

      void store.dispatch(deleteTodo(todoA.id));

      const state = store.getState().todos;
      expect(state.items.find((t) => t.id === todoA.id)).toBeUndefined();
      expect(state.total).toBe(1);
    });

    it('removes the rollback snapshot on fulfilled', async () => {
      vi.mocked(todosApi.delete).mockResolvedValueOnce();
      const store = makeTodosStore([todoA], 1);

      await store.dispatch(deleteTodo(todoA.id));

      expect(store.getState().todos._pendingDeletes).toEqual({});
    });
  });
});

describe('todos slice — toggleTodo', () => {
  describe('negative cases', () => {
    it('does not call the API and restores the completed flag when the id is optimistic', async () => {
      const optimisticTodo: Todo = { ...todoA, id: 'optimistic-abc' };
      const store = makeTodosStore([optimisticTodo]);

      const result = await store.dispatch(toggleTodo(optimisticTodo.id));

      expect(todosApi.update).not.toHaveBeenCalled();
      expect(store.getState().todos.items.find((t) => t.id === optimisticTodo.id)?.completed).toBe(todoA.completed);
      expect(result.payload).toEqual({ silent: true });
    });

    it('restores the original completed value on rejection', async () => {
      vi.mocked(todosApi.update).mockRejectedValueOnce(new Error('fail'));
      const store = makeTodosStore([todoA]);

      await store.dispatch(toggleTodo(todoA.id));

      expect(store.getState().todos.items.find((t) => t.id === todoA.id)?.completed).toBe(todoA.completed);
    });

    it('is a no-op when the id does not exist', async () => {
      vi.mocked(todosApi.update).mockRejectedValueOnce(new Error('Not found'));
      const store = makeTodosStore([todoA]);

      await store.dispatch(toggleTodo('missing'));

      expect(store.getState().todos.items).toEqual([todoA]);
    });
  });

  describe('positive cases', () => {
    it('flips the completed flag optimistically on pending', () => {
      vi.mocked(todosApi.update).mockReturnValueOnce(
        new Promise(() => {
          return;
        }),
      );
      const store = makeTodosStore([todoA]);

      void store.dispatch(toggleTodo(todoA.id));

      expect(store.getState().todos.items.find((t) => t.id === todoA.id)?.completed).toBe(!todoA.completed);
    });

    it('updates the item with the API response on fulfilled', async () => {
      const updated = { ...todoA, completed: true };
      vi.mocked(todosApi.update).mockResolvedValueOnce(updated);
      const store = makeTodosStore([todoA]);

      await store.dispatch(toggleTodo(todoA.id));

      expect(store.getState().todos.items.find((t) => t.id === todoA.id)?.completed).toBe(true);
    });
  });
});

describe('todos slice — updateTodo', () => {
  describe('negative cases', () => {
    it('does not call the API and restores the original values when the id is optimistic', async () => {
      const optimisticTodo: Todo = { ...todoA, id: 'optimistic-abc' };
      const store = makeTodosStore([optimisticTodo]);

      const result = await store.dispatch(updateTodo({ id: optimisticTodo.id, title: 'Changed' }));

      expect(todosApi.update).not.toHaveBeenCalled();
      expect(store.getState().todos.items.find((t) => t.id === optimisticTodo.id)?.title).toBe(todoA.title);
      expect(result.payload).toEqual({ silent: true });
    });

    it('restores the original title on rejection', async () => {
      vi.mocked(todosApi.update).mockRejectedValueOnce(new Error('fail'));
      const store = makeTodosStore([todoA]);

      await store.dispatch(updateTodo({ id: todoA.id, title: 'Changed' }));

      expect(store.getState().todos.items.find((t) => t.id === todoA.id)?.title).toBe(todoA.title);
    });

    it('restores the original description on rejection', async () => {
      vi.mocked(todosApi.update).mockRejectedValueOnce(new Error('fail'));
      const store = makeTodosStore([todoA]);

      await store.dispatch(updateTodo({ description: 'Changed', id: todoA.id }));

      expect(store.getState().todos.items.find((t) => t.id === todoA.id)?.description).toBe(todoA.description);
    });

    it('is a no-op when the id does not exist', async () => {
      vi.mocked(todosApi.update).mockRejectedValueOnce(new Error('fail'));
      const store = makeTodosStore([todoA]);

      await store.dispatch(updateTodo({ id: 'missing', title: 'x' }));

      expect(store.getState().todos.items).toEqual([todoA]);
    });
  });

  describe('positive cases', () => {
    it('applies the title change optimistically on pending', () => {
      vi.mocked(todosApi.update).mockReturnValueOnce(
        new Promise(() => {
          return;
        }),
      );
      const store = makeTodosStore([todoA]);

      void store.dispatch(updateTodo({ id: todoA.id, title: 'New title' }));

      expect(store.getState().todos.items.find((t) => t.id === todoA.id)?.title).toBe('New title');
    });

    it('applies the description change optimistically on pending', () => {
      vi.mocked(todosApi.update).mockReturnValueOnce(
        new Promise(() => {
          return;
        }),
      );
      const store = makeTodosStore([todoA]);

      void store.dispatch(updateTodo({ description: 'New desc', id: todoA.id }));

      expect(store.getState().todos.items.find((t) => t.id === todoA.id)?.description).toBe('New desc');
    });

    it('updates the item with the API response on fulfilled', async () => {
      const updated: Todo = { ...todoA, description: 'API desc', title: 'API title' };
      vi.mocked(todosApi.update).mockResolvedValueOnce(updated);
      const store = makeTodosStore([todoA]);

      await store.dispatch(updateTodo({ id: todoA.id, title: 'API title' }));

      const item = store.getState().todos.items.find((t) => t.id === todoA.id);
      expect(item?.title).toBe('API title');
      expect(item?.description).toBe('API desc');
    });

    it('clears the pending update snapshot on fulfilled', async () => {
      vi.mocked(todosApi.update).mockResolvedValueOnce({ ...todoA, title: 'New' });
      const store = makeTodosStore([todoA]);

      await store.dispatch(updateTodo({ id: todoA.id, title: 'New' }));

      expect(store.getState().todos._pendingUpdates).toEqual({});
    });
  });
});

describe('todos slice — setLimit', () => {
  describe('positive cases', () => {
    it('updates the limit', () => {
      const store = makeTodosStore();
      store.dispatch(setLimit(20));

      expect(store.getState().todos.filters.limit).toBe(20);
    });

    it('resets offset back to 0', () => {
      const store = configureStore({
        preloadedState: {
          todos: {
            _pendingDeletes: {},
            _pendingUpdates: {},
            currentTodo: null,
            currentTodoStatus: 'idle',
            filters: { ...defaultFilters, offset: 30 },
            items: [],
            status: 'idle',
            total: 0,
          } satisfies TodosState,
        },
        reducer: { todos: todosReducer },
      });

      store.dispatch(setLimit(20));

      expect(store.getState().todos.filters.offset).toBe(0);
    });
  });
});

describe('todos slice — setOffset', () => {
  describe('positive cases', () => {
    it('updates the offset', () => {
      const store = makeTodosStore();
      store.dispatch(setOffset(10));

      expect(store.getState().todos.filters.offset).toBe(10);
    });

    it('does not touch other filter fields', () => {
      const store = configureStore({
        preloadedState: {
          todos: {
            _pendingDeletes: {},
            _pendingUpdates: {},
            currentTodo: null,
            currentTodoStatus: 'idle',
            filters: { ...defaultFilters, query: 'hi' },
            items: [],
            status: 'idle',
            total: 0,
          } satisfies TodosState,
        },
        reducer: { todos: todosReducer },
      });

      store.dispatch(setOffset(5));

      expect(store.getState().todos.filters.query).toBe('hi');
    });
  });
});

describe('todos slice — setOrder', () => {
  describe('positive cases', () => {
    it('updates the order', () => {
      const store = makeTodosStore();
      store.dispatch(setOrder('desc'));

      expect(store.getState().todos.filters.order).toBe('desc');
    });

    it('resets offset back to 0', () => {
      const store = configureStore({
        preloadedState: {
          todos: {
            _pendingDeletes: {},
            _pendingUpdates: {},
            currentTodo: null,
            currentTodoStatus: 'idle',
            filters: { ...defaultFilters, offset: 10 },
            items: [],
            status: 'idle',
            total: 0,
          } satisfies TodosState,
        },
        reducer: { todos: todosReducer },
      });

      store.dispatch(setOrder('desc'));

      expect(store.getState().todos.filters.offset).toBe(0);
    });
  });
});

describe('todos slice — setSortBy', () => {
  describe('positive cases', () => {
    it('updates the sortBy', () => {
      const store = makeTodosStore();
      store.dispatch(setSortBy('completed'));

      expect(store.getState().todos.filters.sortBy).toBe('completed');
    });

    it('resets offset back to 0', () => {
      const store = configureStore({
        preloadedState: {
          todos: {
            _pendingDeletes: {},
            _pendingUpdates: {},
            currentTodo: null,
            currentTodoStatus: 'idle',
            filters: { ...defaultFilters, offset: 10 },
            items: [],
            status: 'idle',
            total: 0,
          } satisfies TodosState,
        },
        reducer: { todos: todosReducer },
      });

      store.dispatch(setSortBy('completed'));

      expect(store.getState().todos.filters.offset).toBe(0);
    });
  });
});

describe('todos slice — updateFilters', () => {
  describe('positive cases', () => {
    it('merges partial filters', () => {
      const store = makeTodosStore();
      store.dispatch(updateFilters({ query: 'hello' }));

      const { filters } = store.getState().todos;
      expect(filters.query).toBe('hello');
      expect(filters.limit).toBe(10);
    });

    it('resets offset back to 0', () => {
      const store = configureStore({
        preloadedState: {
          todos: {
            _pendingDeletes: {},
            _pendingUpdates: {},
            currentTodo: null,
            currentTodoStatus: 'idle',
            filters: { ...defaultFilters, offset: 10 },
            items: [],
            status: 'idle',
            total: 0,
          } satisfies TodosState,
        },
        reducer: { todos: todosReducer },
      });

      store.dispatch(updateFilters({ query: 'hi' }));

      expect(store.getState().todos.filters.offset).toBe(0);
    });
  });
});
