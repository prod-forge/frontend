import { useColorScheme } from 'react-native';

import type { ThemeTokens } from '../theme/tokens';

import { darkTheme, lightTheme } from '../theme/tokens';

export const useThemeTokens = (): ThemeTokens => (useColorScheme() === 'dark' ? darkTheme : lightTheme);
