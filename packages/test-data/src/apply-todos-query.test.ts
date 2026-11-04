import type { Todo } from '@prod-forge-todolist-frontend/core';

import { describe, expect, it } from 'vitest';

import { applyTodosQuery } from './apply-todos-query';

const items: readonly Todo[] = [
  { completed: false, description: 'first', id: '1', title: 'Alpha' },
  { completed: true, description: 'second', id: '2', title: 'Bravo' },
  { completed: false, description: 'third', id: '3', title: 'Charlie' },
  { completed: true, description: 'fourth', id: '4', title: 'Delta' },
  { completed: false, description: 'fifth', id: '5', title: 'Echo' },
];

describe('applyTodosQuery', () => {
  describe('negative cases', () => {
    it('ignores an unknown sortBy and keeps the original order', () => {
      const result = applyTodosQuery(items, { sortBy: 'unknown' });

      expect(result.data.map((t) => t.id)).toEqual(['1', '2', '3', '4', '5']);
    });

    it('returns an empty page with the full filtered total when offset is past the end', () => {
      const result = applyTodosQuery(items, { offset: 10 });

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(5);
    });
  });

  describe('positive cases', () => {
    it('returns records 3 and 4 for limit=2 and offset=2', () => {
      const result = applyTodosQuery(items, { limit: 2, offset: 2 });

      expect(result.data.map((t) => t.id)).toEqual(['3', '4']);
      expect(result.meta).toEqual({ limit: 2, offset: 2, total: 5 });
    });

    it('keeps only completed records for completed=true', () => {
      const result = applyTodosQuery(items, { completed: true });

      expect(result.data.map((t) => t.id)).toEqual(['2', '4']);
      expect(result.meta.total).toBe(2);
    });

    it('searches title case-insensitively', () => {
      const result = applyTodosQuery(items, { search: 'cHaRlIe' });

      expect(result.data.map((t) => t.id)).toEqual(['3']);
    });

    it('sorts by title descending', () => {
      const result = applyTodosQuery(items, { order: 'desc', sortBy: 'title' });

      expect(result.data.map((t) => t.id)).toEqual(['5', '4', '3', '2', '1']);
    });
  });
});
