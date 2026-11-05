import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrefersDark = (matches: boolean): void => {
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches } as MediaQueryList);
};

// theme-init runs once on import, so every case imports a fresh copy.
const runThemeInit = async (): Promise<void> => {
  vi.resetModules();
  await import('./theme-init');
};

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('theme-init', () => {
  describe('negative cases', () => {
    it('ignores an unknown stored value and follows the system preference', async () => {
      localStorage.setItem('theme', 'sepia');
      mockPrefersDark(true);

      await runThemeInit();

      expect(document.documentElement.dataset.theme).toBe('dark');
    });

    it('falls back to light when nothing is stored and the system does not prefer dark', async () => {
      mockPrefersDark(false);

      await runThemeInit();

      expect(document.documentElement.dataset.theme).toBe('light');
    });
  });

  describe('positive cases', () => {
    it('uses the stored theme over the system preference', async () => {
      localStorage.setItem('theme', 'light');
      mockPrefersDark(true);

      await runThemeInit();

      expect(document.documentElement.dataset.theme).toBe('light');
    });

    it('uses dark when nothing is stored and the system prefers dark', async () => {
      mockPrefersDark(true);

      await runThemeInit();

      expect(document.documentElement.dataset.theme).toBe('dark');
    });
  });
});
