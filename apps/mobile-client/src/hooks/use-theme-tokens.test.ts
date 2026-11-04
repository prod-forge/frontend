import { renderHook } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';

import { colorsDark, colorsLight } from '../theme/tokens';
import { useThemeTokens } from './use-theme-tokens';

// The React Native Jest preset replaces useColorScheme with a jest.fn that returns 'light'.
const mockColorScheme = (scheme: 'dark' | 'light' | null): void => {
  jest.mocked(useColorScheme).mockReturnValue(scheme);
};

describe('useThemeTokens', () => {
  afterEach(() => {
    jest.mocked(useColorScheme).mockReset();
  });

  describe('negative cases', () => {
    it('falls back to the light palette when the system scheme is unknown', async () => {
      mockColorScheme(null);

      const { result } = await renderHook(() => useThemeTokens());

      expect(result.current.colors).toBe(colorsLight);
    });
  });

  describe('positive cases', () => {
    it('returns the dark palette when the system scheme is dark', async () => {
      mockColorScheme('dark');

      const { result } = await renderHook(() => useThemeTokens());

      expect(result.current.colors).toBe(colorsDark);
      expect(result.current.isDark).toBe(true);
    });

    it('returns the light palette when the system scheme is light', async () => {
      mockColorScheme('light');

      const { result } = await renderHook(() => useThemeTokens());

      expect(result.current.colors).toBe(colorsLight);
    });
  });
});
