import { describe, expect, it } from 'vitest';

import type { AuthState } from './auth.types';

import { FAKE_TOKEN } from './auth.constants';
import { authReducer, login, logout, register } from './auth.slices';

const init = (): AuthState => authReducer(undefined, { type: '@@init' });

describe('auth slice — initial state', () => {
  it('starts with no token, no user and hydration not started', () => {
    expect(init()).toEqual({ hydration: 'idle', token: null, user: null });
  });
});

describe('auth slice — login', () => {
  it('sets the fake token and the user email', () => {
    const next = authReducer(init(), login({ email: 'a@b.com' }));

    expect(next.token).toBe(FAKE_TOKEN);
    expect(next.user).toEqual({ email: 'a@b.com' });
  });
});

describe('auth slice — register', () => {
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
});

describe('auth slice — logout', () => {
  it('clears token and user', () => {
    const loggedIn = authReducer(init(), login({ email: 'a@b.com' }));
    const next = authReducer(loggedIn, logout());

    expect(next).toEqual({ hydration: 'idle', token: null, user: null });
  });
});
