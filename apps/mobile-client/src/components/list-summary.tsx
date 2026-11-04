import type { ReactNode } from 'react';

import { Text, View } from 'react-native';

import { useThemedStyles } from '../hooks/use-themed-styles';
import { createThemedStyles } from '../theme/create-themed-styles';
import { PrimaryButton } from './primary-button';

type ListSummaryProps = {
  readonly completed: number;
  readonly onLogout: () => void;
  readonly total: number;
  readonly userName?: string;
};

const createStyles = createThemedStyles(({ colors, fontSize, space }) => ({
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: space['3'],
    justifyContent: 'space-between',
  },
  summary: {
    color: colors.textSecondary,
    flexShrink: 1,
    fontSize: fontSize.md,
  },
}));

export const ListSummary = ({ completed, onLogout, total, userName }: ListSummaryProps): ReactNode => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <Text style={styles.summary}>
        {userName ? `${userName}: ` : ''}
        {completed} of {total} completed
      </Text>
      <PrimaryButton onPress={onLogout} title="Sign out" variant="secondary" />
    </View>
  );
};
