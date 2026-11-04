import type { ReactNode } from 'react';

import { ActivityIndicator, View } from 'react-native';

import { useThemedStyles } from '../hooks/use-themed-styles';
import { createThemedStyles } from '../theme/create-themed-styles';

const createStyles = createThemedStyles(({ colors, space }) => ({
  indicator: {
    color: colors.accent,
  },
  root: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    padding: space['6'],
  },
}));

export const Preloader = (): ReactNode => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <ActivityIndicator accessibilityLabel="Loading" color={styles.indicator.color} size="large" />
    </View>
  );
};
