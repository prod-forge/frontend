import { describe, expect, it } from 'vitest';

import type { RootState } from '../../store';
import type { AppError } from './errors.types';

import { selectVisibleErrors } from './errors.selectors';

const makeError = (overrides: Partial<AppError> = {}): AppError => ({
  id: 'e1',
  message: 'test error',
  silent: false,
  source: 'rtk',
  timestamp: 0,
  type: 'frontend-error',
  ...overrides,
});

const makeState = (errors: AppError[]): RootState => ({
  auth: { token: null, user: null },
  errors: { errors },
  todos: {
    _pendingDeletes: {},
    _pendingUpdates: {},
    currentTodo: null,
    currentTodoStatus: 'idle',
    filters: { limit: 10, offset: 0, order: 'asc', query: '', sortBy: 'title' },
    items: [],
    status: 'idle',
    total: 0,
  },
});

describe('selectVisibleErrors', () => {
  describe('negative cases', () => {
    it('returns an empty array when there are no errors', () => {
      expect(selectVisibleErrors(makeState([]))).toHaveLength(0);
    });

    it('excludes a single silent error', () => {
      expect(selectVisibleErrors(makeState([makeError({ silent: true })]))).toHaveLength(0);
    });

    it('returns empty when all errors are silent', () => {
      const errors = [
        makeError({ id: 'e1', silent: true }),
        makeError({ id: 'e2', silent: true }),
        makeError({ id: 'e3', silent: true }),
      ];

      expect(selectVisibleErrors(makeState(errors))).toEqual([]);
    });
  });

  describe('positive cases', () => {
    it('returns a single non-silent error', () => {
      const error = makeError({ id: 'e1', silent: false });

      expect(selectVisibleErrors(makeState([error]))).toHaveLength(1);
    });

    it('returns only non-silent errors from a mixed list', () => {
      const errors = [
        makeError({ id: 'e1', silent: true }),
        makeError({ id: 'e2', silent: false }),
        makeError({ id: 'e3', silent: true }),
      ];

      const result = selectVisibleErrors(makeState(errors));
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('e2');
    });

    it('returns all errors when none are silent', () => {
      const errors = [makeError({ id: 'e1', silent: false }), makeError({ id: 'e2', silent: false })];

      expect(selectVisibleErrors(makeState(errors))).toHaveLength(2);
    });

    it('preserves the original order of visible errors', () => {
      const errors = [
        makeError({ id: 'a', silent: false }),
        makeError({ id: 'b', silent: true }),
        makeError({ id: 'c', silent: false }),
      ];

      expect(selectVisibleErrors(makeState(errors)).map((e) => e.id)).toEqual(['a', 'c']);
    });
  });
});
