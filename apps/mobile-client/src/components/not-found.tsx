import type { ReactNode } from 'react';

import { Text, View } from 'react-native';

import { useThemedStyles } from '../hooks/use-themed-styles';
import { createThemedStyles } from '../theme/create-themed-styles';
import { PrimaryButton } from './primary-button';

type NotFoundProps = {
  readonly message: string;
  readonly onBack: () => void;
};

const createStyles = createThemedStyles(({ colors, fontSize, fontWeight, space }) => ({
  message: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  root: {
    alignItems: 'center',
    flexGrow: 1,
    gap: space['3'],
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
  },
}));

export const NotFound = ({ message, onBack }: NotFoundProps): ReactNode => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <Text accessibilityRole="header" style={styles.title}>
        Not found
      </Text>
      <Text style={styles.message}>{message}</Text>
      <PrimaryButton onPress={onBack} title="Back to tasks" variant="secondary" />
    </View>
  );
};
