import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTheme } from './use-theme';

const STORAGE_KEY = 'theme';

const setMatchMedia = (matches: boolean): void => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    addEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
  }));
};

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    setMatchMedia(false);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('reads "dark" from localStorage on initial render', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
  });

  it('reads "light" from localStorage on initial render', () => {
    localStorage.setItem(STORAGE_KEY, 'light');

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
  });

  it('falls back to "dark" when matchMedia matches and no stored value exists', () => {
    setMatchMedia(true);

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
  });

  it('falls back to "light" when matchMedia does not match and no stored value exists', () => {
    setMatchMedia(false);

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
  });

  it('ignores invalid values in localStorage and falls back to matchMedia', () => {
    localStorage.setItem(STORAGE_KEY, 'neon');
    setMatchMedia(true);

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
  });

  it('writes the current theme to data-theme on documentElement', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');

    renderHook(() => useTheme());

    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('persists the current theme to localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'light');

    renderHook(() => useTheme());

    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('toggle flips from light to dark', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('toggle flips from dark to light', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('toggling twice returns to the original theme', () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggle();
    });
    act(() => {
      result.current.toggle();
    });

    expect(result.current.theme).toBe('light');
  });
});
