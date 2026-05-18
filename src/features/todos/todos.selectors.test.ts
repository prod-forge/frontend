import { describe, expect, it } from 'vitest';

import type { RootState } from '../../store';
import type { Todo, TodoFilters, TodosState } from './todos.types';

import {
  selectCompletedTodos,
  selectFilters,
  selectItems,
  selectStatus,
  selectTotalTodos,
  selectVisibleTodos,
} from './todos.selectors';

const makeState = (overrides: { filters?: Partial<TodoFilters>; items?: Todo[]; total?: number } = {}): RootState => ({
  auth: { token: null, user: null },
  errors: { errors: [] },
  todos: {
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
      ...overrides.filters,
    },
    items: overrides.items ?? [],
    status: 'idle',
    total: overrides.total ?? 0,
  } satisfies TodosState,
});

const items: Todo[] = [
  { completed: false, description: 'desc-a', id: 'a', title: 'Apple' },
  { completed: true, description: 'desc-b', id: 'b', title: 'Banana' },
  { completed: false, description: 'desc-c', id: 'c', title: 'Cherry' },
];

describe('selectItems', () => {
  describe('positive cases', () => {
    it('returns the items list from state', () => {
      expect(selectItems(makeState({ items }))).toEqual(items);
    });
  });
});

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
    it('returns 0 when none are completed', () => {
      const open = items.map((t) => ({ ...t, completed: false }));
      expect(selectCompletedTodos(makeState({ items: open }))).toBe(0);
    });
  });

  describe('positive cases', () => {
    it('returns the number of completed items in the current page', () => {
      expect(selectCompletedTodos(makeState({ items }))).toBe(1);
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
