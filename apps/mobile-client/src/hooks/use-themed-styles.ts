import { useMemo } from 'react';

import type { ThemedStyles } from '../theme/create-themed-styles';

import { useThemeTokens } from './use-theme-tokens';

export const useThemedStyles = <T>(styles: ThemedStyles<T>): T => {
  const theme = useThemeTokens();

  return useMemo(() => styles(theme), [styles, theme]);
};
