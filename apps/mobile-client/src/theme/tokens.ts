import type { TextStyle } from 'react-native';

import { color, fontSize, fontWeight, radius, space } from '@prod-forge-todolist-frontend/design-tokens/js';

// Same source as tokens.css on web: design-tokens exports unitless numbers, which is what StyleSheet expects.
export type ThemeColors = typeof color.light;

export type ThemeTokens = {
  readonly colors: ThemeColors;
  readonly fontSize: typeof fontSize;
  readonly fontWeight: Readonly<Record<keyof typeof fontWeight, FontWeight>>;
  readonly isDark: boolean;
  readonly radius: typeof radius;
  readonly space: typeof space;
};

type FontWeight = NonNullable<TextStyle['fontWeight']>;

// design-tokens types weights as plain numbers; React Native accepts only the 100-900 literals, which these are.
const fontWeights: ThemeTokens['fontWeight'] = {
  bold: fontWeight.bold as FontWeight,
  medium: fontWeight.medium as FontWeight,
  normal: fontWeight.normal as FontWeight,
  semibold: fontWeight.semibold as FontWeight,
};

export const colorsLight: ThemeColors = color.light;

export const colorsDark: ThemeColors = color.dark;

const shared = { fontSize, fontWeight: fontWeights, radius, space };

export const lightTheme: ThemeTokens = { ...shared, colors: colorsLight, isDark: false };

export const darkTheme: ThemeTokens = { ...shared, colors: colorsDark, isDark: true };
