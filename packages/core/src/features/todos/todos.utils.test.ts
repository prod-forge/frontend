import { describe, expect, it } from 'vitest';

import type { Todo } from './todos.types';

import { filterTodos, sortTodos } from './todos.utils';

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  completed: false,
  description: '',
  id: '1',
  title: '',
  ...overrides,
});

const items: Todo[] = [
  makeTodo({ description: 'milk and bread', id: 'a', title: 'Buy groceries' }),
  makeTodo({ completed: true, description: 'state management library', id: 'b', title: 'Read about Redux' }),
  makeTodo({ description: 'gym session', id: 'c', title: 'Workout' }),
];

describe('filterTodos', () => {
  describe('negative cases', () => {
    it('returns the original list when query is empty', () => {
      expect(filterTodos(items, '')).toEqual(items);
    });

    it('returns the original list when query is whitespace only', () => {
      expect(filterTodos(items, '   ')).toEqual(items);
    });

    it('does not match on the description', () => {
      expect(filterTodos(items, 'milk')).toEqual([]);
    });

    it('returns an empty array when nothing matches', () => {
      expect(filterTodos(items, 'definitely-not-there')).toEqual([]);
    });

    it('does not mutate the input array', () => {
      const snapshot = [...items];
      filterTodos(items, 'a');
      expect(items).toEqual(snapshot);
    });
  });

  describe('positive cases', () => {
    it('filters by title (case-insensitive)', () => {
      expect(filterTodos(items, 'WORK')).toEqual([items[2]]);
    });

    it('trims surrounding whitespace from the query', () => {
      expect(filterTodos(items, '   work   ')).toEqual([items[2]]);
    });
  });
});

describe('sortTodos', () => {
  describe('negative cases', () => {
    it('returns a new array without mutating the input', () => {
      const snapshot = [...items];
      const result = sortTodos(items, 'title', 'desc');
      expect(items).toEqual(snapshot);
      expect(result).not.toBe(items);
    });
  });

  describe('positive cases', () => {
    it('sorts by title ascending', () => {
      const result = sortTodos(items, 'title', 'asc');
      expect(result.map((t) => t.id)).toEqual(['a', 'b', 'c']);
    });

    it('sorts by title descending', () => {
      const result = sortTodos(items, 'title', 'desc');
      expect(result.map((t) => t.id)).toEqual(['c', 'b', 'a']);
    });

    it('sorts by completion status ascending — incomplete first', () => {
      const result = sortTodos(items, 'completed', 'asc');
      expect(result[result.length - 1].id).toBe('b');
    });

    it('sorts by completion status descending — completed first', () => {
      const result = sortTodos(items, 'completed', 'desc');
      expect(result[0].id).toBe('b');
    });
  });
});
