import type { ReactNode } from 'react';

import { Text, View } from 'react-native';

import { useThemedStyles } from '../hooks/use-themed-styles';
import { createThemedStyles } from '../theme/create-themed-styles';

type AuthHeaderProps = {
  readonly subtitle: string;
  readonly title: string;
};

const createStyles = createThemedStyles(({ colors, fontSize, fontWeight, space }) => ({
  root: {
    gap: space['2'],
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.semibold,
  },
}));

export const AuthHeader = ({ subtitle, title }: AuthHeaderProps): ReactNode => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};
