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
    status: 'idle',
    total: 0,
  },
});

describe('selectAuthToken', () => {
  it('returns the token from state', () => {
    expect(selectAuthToken(makeAuthState({ token: 'abc', user: null }))).toBe('abc');
  });

  it('returns null when there is no token', () => {
    expect(selectAuthToken(makeAuthState({ token: null, user: null }))).toBeNull();
  });
});

describe('selectAuthUser', () => {
  it('returns the user object', () => {
    const user = { email: 'a@b.com', name: 'A' };
    expect(selectAuthUser(makeAuthState({ token: 'tok', user }))).toEqual(user);
  });

  it('returns null when no user', () => {
    expect(selectAuthUser(makeAuthState({ token: null, user: null }))).toBeNull();
  });
});

describe('selectIsAuthenticated', () => {
  it('returns true when there is a token', () => {
    expect(selectIsAuthenticated(makeAuthState({ token: 'tok', user: { email: 'a@b.com' } }))).toBe(true);
  });

  it('returns false when there is no token', () => {
    expect(selectIsAuthenticated(makeAuthState({ token: null, user: null }))).toBe(false);
  });
});
