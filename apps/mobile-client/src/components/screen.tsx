import type { ReactNode } from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemedStyles } from '../hooks/use-themed-styles';
import { createThemedStyles } from '../theme/create-themed-styles';

type ScreenProps = {
  readonly children: ReactNode;
};

const createStyles = createThemedStyles(({ colors, space }) => ({
  root: {
    backgroundColor: colors.bg,
    flex: 1,
    gap: space['4'],
    padding: space['4'],
  },
}));

// The stack header already covers the top inset.
export const Screen = ({ children }: ScreenProps): ReactNode => {
  const styles = useThemedStyles(createStyles);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      {children}
    </SafeAreaView>
  );
};
