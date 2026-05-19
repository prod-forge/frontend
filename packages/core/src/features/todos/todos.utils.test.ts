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
  it('returns the original list when query is empty', () => {
    expect(filterTodos(items, '')).toEqual(items);
  });

  it('returns the original list when query is whitespace only', () => {
    expect(filterTodos(items, '   ')).toEqual(items);
  });

  it('filters by title (case-insensitive)', () => {
    expect(filterTodos(items, 'WORK')).toEqual([items[2]]);
  });

  it('filters by description (case-insensitive)', () => {
    expect(filterTodos(items, 'redux')).toEqual([items[1]]);
  });

  it('matches against either title or description', () => {
    expect(filterTodos(items, 'gym')).toEqual([items[2]]);
  });

  it('trims surrounding whitespace from the query', () => {
    expect(filterTodos(items, '   gym   ')).toEqual([items[2]]);
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

describe('sortTodos', () => {
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

  it('returns a new array without mutating the input', () => {
    const snapshot = [...items];
    const result = sortTodos(items, 'title', 'desc');
    expect(items).toEqual(snapshot);
    expect(result).not.toBe(items);
  });
});
