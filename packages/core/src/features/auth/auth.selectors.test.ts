import { describe, expect, it } from 'vitest';

import type { RootState } from '../../store';

import { selectAuthToken, selectAuthUser, selectIsAuthenticated } from './auth.selectors';

const makeAuthState = (auth: RootState['auth']): RootState => ({
  auth,
  errors: { errors: [] },
  todos: {
    _pendingDeletes: {},
    _pendingUpdates: {},
    currentTodo: null,
    currentTodoStatus: 'idle',
    filters: { limit: 10, offset: 0, order: 'asc', query: '', sortBy: 'title' },
    items: [],
    nextOffset: 0,
    status: 'idle',
    total: 0,
  },
});

describe('selectAuthToken', () => {
  describe('negative cases', () => {
    it('returns null when there is no token', () => {
      expect(selectAuthToken(makeAuthState({ hydration: 'done', token: null, user: null }))).toBeNull();
    });
  });

  describe('positive cases', () => {
    it('returns the token from state', () => {
      expect(selectAuthToken(makeAuthState({ hydration: 'done', token: 'abc', user: null }))).toBe('abc');
    });
  });
});

describe('selectAuthUser', () => {
  describe('negative cases', () => {
    it('returns null when no user', () => {
      expect(selectAuthUser(makeAuthState({ hydration: 'done', token: null, user: null }))).toBeNull();
    });
  });

  describe('positive cases', () => {
    it('returns the user object', () => {
      const user = { email: 'a@b.com', name: 'A' };
      expect(selectAuthUser(makeAuthState({ hydration: 'done', token: 'tok', user }))).toEqual(user);
    });
  });
});

describe('selectIsAuthenticated', () => {
  describe('negative cases', () => {
    it('returns false when there is no token', () => {
      expect(selectIsAuthenticated(makeAuthState({ hydration: 'done', token: null, user: null }))).toBe(false);
    });
  });

  describe('positive cases', () => {
    it('returns true when there is a token', () => {
      expect(
        selectIsAuthenticated(makeAuthState({ hydration: 'done', token: 'tok', user: { email: 'a@b.com' } })),
      ).toBe(true);
    });
  });
});
