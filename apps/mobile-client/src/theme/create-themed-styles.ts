import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

import { StyleSheet } from 'react-native';

import type { ThemeTokens } from './tokens';

export type ThemedStyles<T> = (theme: ThemeTokens) => T;

type NamedStyles<T> = { [K in keyof T]: ImageStyle | TextStyle | ViewStyle };

// Declared once per component at module level, so useThemedStyles can memoize by theme.
export const createThemedStyles =
  <T extends NamedStyles<T>>(factory: (theme: ThemeTokens) => T): ThemedStyles<T> =>
  (theme) =>
    StyleSheet.create(factory(theme));
