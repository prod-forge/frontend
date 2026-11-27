import { describe, expect, it } from 'vitest';

import type { RootState } from '../../store';
import type { Todo, TodoFilters, TodosState } from './todos.types';

import {
  selectCompletedTodos,
  selectFilters,
  selectStatus,
  selectTotalTodos,
  selectVisibleTodos,
} from './todos.selectors';

const makeState = (
  overrides: { completed?: number; filters?: Partial<TodoFilters>; items?: Todo[]; total?: number } = {},
): RootState => ({
  auth: { hydration: 'done', token: null, user: null },
  errors: { errors: [] },
  todos: {
    _pendingDeletes: {},
    _pendingUpdates: {},
    completed: overrides.completed ?? 0,
    currentTodo: null,
    currentTodoStatus: 'idle',
    filters: {
      limit: 10,
      offset: 0,
      order: 'asc',
      query: '',
      sortBy: 'title',
      ...overrides.filters,
    },
    items: overrides.items ?? [],
    nextOffset: 0,
    status: 'idle',
    total: overrides.total ?? 0,
  } satisfies TodosState,
});

const items: Todo[] = [
  { completed: false, description: 'desc-a', id: 'a', title: 'Apple' },
  { completed: true, description: 'desc-b', id: 'b', title: 'Banana' },
  { completed: false, description: 'desc-c', id: 'c', title: 'Cherry' },
];

describe('selectFilters', () => {
  describe('positive cases', () => {
    it('returns the filters object from state', () => {
      expect(selectFilters(makeState({ filters: { query: 'q' }, items })).query).toBe('q');
    });
  });
});

describe('selectStatus', () => {
  describe('positive cases', () => {
    it('returns the current status', () => {
      expect(selectStatus(makeState())).toBe('idle');
    });
  });
});

describe('selectTotalTodos', () => {
  describe('positive cases', () => {
    it('returns the total from API meta (not item count)', () => {
      expect(selectTotalTodos(makeState({ items, total: 42 }))).toBe(42);
    });

    it('returns 0 when total is not set', () => {
      expect(selectTotalTodos(makeState())).toBe(0);
    });
  });
});

describe('selectCompletedTodos', () => {
  describe('negative cases', () => {
    it('does not count the completed items of the loaded page', () => {
      expect(selectCompletedTodos(makeState({ completed: 0, items }))).toBe(0);
    });
  });

  describe('positive cases', () => {
    it('returns the server count of completed todos across all pages', () => {
      expect(selectCompletedTodos(makeState({ completed: 30, items, total: 47 }))).toBe(30);
    });
  });
});

describe('selectVisibleTodos', () => {
  describe('positive cases', () => {
    it('returns all items in state (server already paginates)', () => {
      expect(selectVisibleTodos(makeState({ items }))).toEqual(items);
    });

    it('returns an empty array when there are no items', () => {
      expect(selectVisibleTodos(makeState())).toEqual([]);
    });
  });
});
