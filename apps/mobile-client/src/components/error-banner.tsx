import type { ReactNode } from 'react';

import { Text, View } from 'react-native';

import { useThemedStyles } from '../hooks/use-themed-styles';
import { createThemedStyles } from '../theme/create-themed-styles';
import { PrimaryButton } from './primary-button';

type ErrorBannerProps = {
  readonly message: string;
  readonly onDismiss?: () => void;
  readonly onRetry?: () => void;
};

const createStyles = createThemedStyles(({ colors, fontSize, radius, space }) => ({
  actions: {
    flexDirection: 'row',
    gap: space['2'],
  },
  message: {
    color: colors.danger,
    fontSize: fontSize.md,
  },
  root: {
    backgroundColor: colors.dangerSubtle,
    borderColor: colors.danger,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: space['3'],
    padding: space['3'],
  },
}));

export const ErrorBanner = ({ message, onDismiss, onRetry }: ErrorBannerProps): ReactNode => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <Text accessibilityRole="alert" style={styles.message}>
        {message}
      </Text>
      {onRetry || onDismiss ? (
        <View style={styles.actions}>
          {onRetry ? <PrimaryButton onPress={onRetry} title="Retry" /> : null}
          {onDismiss ? <PrimaryButton onPress={onDismiss} title="Dismiss" variant="secondary" /> : null}
        </View>
      ) : null}
    </View>
  );
};
