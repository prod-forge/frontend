import type { ReactNode } from 'react';

import { Text } from 'react-native';

import { useThemedStyles } from '../hooks/use-themed-styles';
import { createThemedStyles } from '../theme/create-themed-styles';

type EmptyStateProps = {
  readonly message: string;
};

const createStyles = createThemedStyles(({ colors, fontSize, space }) => ({
  message: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    paddingVertical: space['6'],
    textAlign: 'center',
  },
}));

export const EmptyState = ({ message }: EmptyStateProps): ReactNode => {
  const styles = useThemedStyles(createStyles);

  return <Text style={styles.message}>{message}</Text>;
};
