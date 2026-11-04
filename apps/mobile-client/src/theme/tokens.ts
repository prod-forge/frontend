import { color, fontSize, fontWeight, radius, space } from '@prod-forge-todolist-frontend/design-tokens/js';

// Same source as tokens.css on web: design-tokens exports unitless numbers, which is what StyleSheet expects.
export type ThemeColors = typeof color.light;

export type ThemeTokens = {
  readonly colors: ThemeColors;
  readonly fontSize: typeof fontSize;
  readonly fontWeight: typeof fontWeight;
  readonly isDark: boolean;
  readonly radius: typeof radius;
  readonly space: typeof space;
};

export const colorsLight: ThemeColors = color.light;

export const colorsDark: ThemeColors = color.dark;

export const lightTheme: ThemeTokens = { colors: colorsLight, fontSize, fontWeight, isDark: false, radius, space };

export const darkTheme: ThemeTokens = { colors: colorsDark, fontSize, fontWeight, isDark: true, radius, space };
