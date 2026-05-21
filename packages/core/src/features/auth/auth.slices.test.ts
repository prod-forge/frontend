import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { AuthState } from './auth.types';

import { FAKE_TOKEN, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './auth.constants';
import { authReducer, login, logout, register } from './auth.slices';

const init = (): AuthState => authReducer(undefined, { type: '@@init' });

describe('auth slice — initial state', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with no token and no user when storage is empty', () => {
    expect(init()).toEqual({ token: null, user: null });
  });
});

describe('auth slice — login', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('sets the fake token and the user email', () => {
    const next = authReducer(init(), login({ email: 'a@b.com' }));

    expect(next.token).toBe(FAKE_TOKEN);
    expect(next.user).toEqual({ email: 'a@b.com' });
  });

  it('persists the token and user to localStorage', () => {
    authReducer(init(), login({ email: 'a@b.com' }));

    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(FAKE_TOKEN);
    expect(JSON.parse(localStorage.getItem(USER_STORAGE_KEY)!)).toEqual({ email: 'a@b.com' });
  });
});

describe('auth slice — register', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('sets the token and user with email + name', () => {
    const next = authReducer(init(), register({ email: 'a@b.com', name: 'Anna' }));

    expect(next.token).toBe(FAKE_TOKEN);
    expect(next.user).toEqual({ email: 'a@b.com', name: 'Anna' });
  });

  it('omits the name when not provided', () => {
    const next = authReducer(init(), register({ email: 'a@b.com' }));

    expect(next.user).toEqual({ email: 'a@b.com' });
  });

  it('omits the name when an empty string is provided', () => {
    const next = authReducer(init(), register({ email: 'a@b.com', name: '' }));

    expect(next.user).toEqual({ email: 'a@b.com' });
  });

  it('persists the token and the user to localStorage', () => {
    authReducer(init(), register({ email: 'a@b.com', name: 'Anna' }));

    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(FAKE_TOKEN);
    expect(JSON.parse(localStorage.getItem(USER_STORAGE_KEY)!)).toEqual({ email: 'a@b.com', name: 'Anna' });
  });
});

describe('auth slice — logout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('clears token and user', () => {
    const loggedIn = authReducer(init(), login({ email: 'a@b.com' }));
    const next = authReducer(loggedIn, logout());

    expect(next).toEqual({ token: null, user: null });
  });

  it('clears token and user from localStorage', () => {
    const loggedIn = authReducer(init(), login({ email: 'a@b.com' }));
    authReducer(loggedIn, logout());

    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
  });
});
