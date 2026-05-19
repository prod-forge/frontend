import type { PayloadAction } from '@reduxjs/toolkit';

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { logger } from 'logrock';

import type { TodosResponse } from '../../interfaces/todos';
import type { LimitValue, Order, SortBy, Todo, TodoFilters, TodosState } from './todos.types';

import { todosApi } from '../../api/todos.api';

const TEMP_ID_PREFIX = 'optimistic-';

const initialState: TodosState = {
  _pendingDeletes: {},
  _pendingUpdates: {},
  currentTodo: null,
  currentTodoStatus: 'idle',
  filters: {
    limit: 10,
    offset: 0,
    order: 'asc',
    query: '',
    sortBy: 'title',
  },
  items: [],
  status: 'idle',
  total: 0,
};

export const fetchTodos = createAsyncThunk<TodosResponse, TodoFilters>('todos/fetchAll', (filters) => {
  logger.debug(
    { limit: String(filters.limit), offset: String(filters.offset), order: filters.order, sortBy: filters.sortBy },
    'todos/fetchAll',
  );

  return todosApi.getAll(filters);
});

export const fetchTodoById = createAsyncThunk<
  Todo,
  string,
  { rejectValue: { kind: 'error' | 'not-found'; silent?: boolean } }
>('todos/fetchById', async (id, { rejectWithValue }) => {
  logger.debug(`Fetching todo ${id}`, 'todos/fetchById');
  try {
    return await todosApi.getOne(id);
  } catch (error) {
    const status = (error as { status?: number }).status;

    if (status === 404) {
      logger.info(`Todo not found: ${id}`, 'todos/fetchById');
    }

    return rejectWithValue(status === 404 ? { kind: 'not-found', silent: true } : { kind: 'error' });
  }
});

export const addTodo = createAsyncThunk<Todo, { description: string; title: string }>('todos/add', (payload) => {
  logger.info('Creating todo', 'todos/add');

  return todosApi.create(payload);
});

export const deleteTodo = createAsyncThunk<string, string, { rejectValue: { silent: boolean } }>(
  'todos/delete',
  async (id, { rejectWithValue }) => {
    if (id.startsWith(TEMP_ID_PREFIX)) {
      return rejectWithValue({ silent: true });
    }

    logger.info(`Deleting todo ${id}`, 'todos/delete');
    await todosApi.delete(id);

    return id;
  },
);

export const toggleTodo = createAsyncThunk<Todo, string, { rejectValue: { silent: boolean } }>(
  'todos/toggle',
  (id, { getState, rejectWithValue }) => {
    if (id.startsWith(TEMP_ID_PREFIX)) {
      return rejectWithValue({ silent: true });
    }

    // pending has already flipped todo.completed, so todo.completed is the new desired value
    const state = (getState() as { todos: TodosState }).todos;
    const todo = state.items.find((t) => t.id === id);

    if (!todo) {
      throw new Error('Todo not found');
    }

    logger.info({ completed: String(todo.completed), id }, 'todos/toggle');

    return todosApi.update(id, { completed: todo.completed });
  },
);

export const updateTodo = createAsyncThunk<
  Todo,
  { description?: string; id: string; title?: string },
  { rejectValue: { silent: boolean } }
>('todos/update', ({ id, ...data }, { rejectWithValue }) => {
  if (id.startsWith(TEMP_ID_PREFIX)) {
    return rejectWithValue({ silent: true });
  }

  logger.info({ fields: Object.keys(data).join(', '), id }, 'todos/update');

  return todosApi.update(id, data);
});

const resetPagination = (state: TodosState): void => {
  state.filters.offset = 0;
};

const todosSlice = createSlice({
  extraReducers: (builder) => {
    builder
      // fetchTodos
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload.data;
        state.total = action.payload.meta.total;
      })
      .addCase(fetchTodos.rejected, (state) => {
        state.status = 'error';
      })

      // fetchTodoById
      .addCase(fetchTodoById.pending, (state) => {
        state.currentTodo = null;
        state.currentTodoStatus = 'loading';
      })
      .addCase(fetchTodoById.fulfilled, (state, action) => {
        state.currentTodo = action.payload;
        state.currentTodoStatus = 'idle';
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(fetchTodoById.rejected, (state, action) => {
        state.currentTodo = null;
        state.currentTodoStatus = action.payload?.kind === 'not-found' ? 'not-found' : 'error';
      })

      // addTodo — optimistic: prepend temp item on pending, replace on fulfilled, remove on rejected
      .addCase(addTodo.pending, (state, action) => {
        state.items.unshift({
          completed: false,
          description: action.meta.arg.description,
          id: `${TEMP_ID_PREFIX}${action.meta.requestId}`,
          title: action.meta.arg.title,
        });
        state.total += 1;
      })
      .addCase(addTodo.fulfilled, (state, action) => {
        const tempId = `${TEMP_ID_PREFIX}${action.meta.requestId}`;
        const idx = state.items.findIndex((t) => t.id === tempId);

        if (idx !== -1) {
          const optimistic = state.items[idx];
          state.items[idx] = {
            ...optimistic,
            ...action.payload,
            // API may omit fields on creation; keep optimistic values as fallback
            description: action.payload.description ?? optimistic.description,
            title: action.payload.title || optimistic.title,
          };
        }
      })
      .addCase(addTodo.rejected, (state, action) => {
        const tempId = `${TEMP_ID_PREFIX}${action.meta.requestId}`;
        state.items = state.items.filter((t) => t.id !== tempId);
        state.total -= 1;
      })

      // deleteTodo — optimistic: remove on pending, restore on rejected
      .addCase(deleteTodo.pending, (state, action) => {
        const id = action.meta.arg;
        const index = state.items.findIndex((t) => t.id === id);

        if (index !== -1) {
          state._pendingDeletes[action.meta.requestId] = { index, item: state.items[index] };
          state.items.splice(index, 1);
          state.total -= 1;
        }
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        delete state._pendingDeletes[action.meta.requestId];
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        const snapshot = state._pendingDeletes[action.meta.requestId];

        if (snapshot) {
          state.items.splice(snapshot.index, 0, snapshot.item);
          state.total += 1;
          delete state._pendingDeletes[action.meta.requestId];
        }
      })

      // toggleTodo — optimistic: flip on pending, confirm on fulfilled, flip back on rejected
      .addCase(toggleTodo.pending, (state, action) => {
        const todo = state.items.find((t) => t.id === action.meta.arg);

        if (todo) {
          todo.completed = !todo.completed;
        }
      })
      .addCase(toggleTodo.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);

        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(toggleTodo.rejected, (state, action) => {
        const todo = state.items.find((t) => t.id === action.meta.arg);

        if (todo) {
          todo.completed = !todo.completed;
        }
      })

      // updateTodo — optimistic: apply on pending, confirm on fulfilled, restore on rejected
      .addCase(updateTodo.pending, (state, action) => {
        const inList = state.items.find((t) => t.id === action.meta.arg.id);
        const isCurrent = state.currentTodo?.id === action.meta.arg.id;
        const source = inList ?? (isCurrent ? state.currentTodo : undefined);

        if (!source) return;

        state._pendingUpdates[action.meta.requestId] = {
          description: source.description,
          title: source.title,
        };

        if (inList) {
          if (action.meta.arg.title !== undefined) inList.title = action.meta.arg.title;
          if (action.meta.arg.description !== undefined) inList.description = action.meta.arg.description;
        }

        if (isCurrent && state.currentTodo) {
          if (action.meta.arg.title !== undefined) state.currentTodo.title = action.meta.arg.title;
          if (action.meta.arg.description !== undefined) state.currentTodo.description = action.meta.arg.description;
        }
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
        if (state.currentTodo?.id === action.payload.id) {
          state.currentTodo = action.payload;
        }
        delete state._pendingUpdates[action.meta.requestId];
      })
      .addCase(updateTodo.rejected, (state, action) => {
        const original = state._pendingUpdates[action.meta.requestId];

        if (original) {
          const inList = state.items.find((t) => t.id === action.meta.arg.id);
          if (inList) {
            inList.title = original.title;
            inList.description = original.description;
          }
          if (state.currentTodo?.id === action.meta.arg.id) {
            state.currentTodo.title = original.title;
            state.currentTodo.description = original.description;
          }
          delete state._pendingUpdates[action.meta.requestId];
        }
      });
  },

  initialState,

  name: 'todos',

  reducers: {
    clearCurrentTodo(state) {
      state.currentTodo = null;
      state.currentTodoStatus = 'loading';
    },

    setLimit(state, action: PayloadAction<LimitValue>) {
      state.filters.limit = action.payload;
      resetPagination(state);
    },

    setOffset(state, action: PayloadAction<number>) {
      state.filters.offset = action.payload;
    },

    setOrder(state, action: PayloadAction<Order>) {
      state.filters.order = action.payload;
      resetPagination(state);
    },

    setSortBy(state, action: PayloadAction<SortBy>) {
      state.filters.sortBy = action.payload;
      resetPagination(state);
    },

    updateFilters(state, action: PayloadAction<Partial<TodoFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
      resetPagination(state);
    },
  },
});

export const { clearCurrentTodo, setLimit, setOffset, setOrder, setSortBy, updateFilters } = todosSlice.actions;

export const todosReducer = todosSlice.reducer;
