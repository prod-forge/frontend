import type { ReactNode } from 'react';

import { Pressable, Text } from 'react-native';

import { useThemedStyles } from '../hooks/use-themed-styles';
import { createThemedStyles } from '../theme/create-themed-styles';

type ButtonVariant = 'danger' | 'primary' | 'secondary';

type PrimaryButtonProps = {
  readonly disabled?: boolean;
  readonly onPress: () => void;
  readonly title: string;
  readonly variant?: ButtonVariant;
};

const createStyles = createThemedStyles(({ colors, fontSize, fontWeight, radius, space }) => ({
  base: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: space['4'],
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  dangerLabel: {
    color: colors.accentForeground,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  pressed: {
    opacity: 0.8,
  },
  primary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  primaryLabel: {
    color: colors.accentForeground,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  secondaryLabel: {
    color: colors.textPrimary,
  },
}));

export const PrimaryButton = ({
  disabled = false,
  onPress,
  title,
  variant = 'primary',
}: PrimaryButtonProps): ReactNode => {
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={[styles.label, styles[`${variant}Label`]]}>{title}</Text>
    </Pressable>
  );
};
