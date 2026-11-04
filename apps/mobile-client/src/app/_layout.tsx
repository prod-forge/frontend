import type { ReactNode } from 'react';

import { dismissError, selectVisibleErrors, store } from '@prod-forge-todolist-frontend/core';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Provider } from 'react-redux';

import { ErrorBanner } from '../components/error-banner';
import { Preloader } from '../components/preloader';
import { useAppDispatch } from '../hooks/use-app-dispatch';
import { useAppSelector } from '../hooks/use-app-selector';
import { useThemeTokens } from '../hooks/use-theme-tokens';
import { useThemedStyles } from '../hooks/use-themed-styles';
import { createThemedStyles } from '../theme/create-themed-styles';

const createStyles = createThemedStyles(({ colors, space }) => ({
  banner: {
    bottom: space['8'],
    left: space['4'],
    position: 'absolute',
    right: space['4'],
  },
  root: {
    backgroundColor: colors.bg,
    flex: 1,
  },
}));

const LatestErrorBanner = (): ReactNode => {
  const dispatch = useAppDispatch();
  const styles = useThemedStyles(createStyles);
  const latest = useAppSelector(selectVisibleErrors).at(-1);

  if (!latest) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <ErrorBanner message={latest.message} onDismiss={() => dispatch(dismissError(latest.id))} />
    </View>
  );
};

// Auth is restored from SecureStore asynchronously (dispatched in bootstrap.ts); mounting routes earlier
// would flash the login screen for a signed-in user.
const RootNavigator = (): ReactNode => {
  const hydration = useAppSelector((state) => state.auth.hydration);
  const styles = useThemedStyles(createStyles);
  const { colors, isDark } = useThemeTokens();

  if (hydration !== 'done') {
    return (
      <View style={styles.root}>
        <Preloader />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.bg },
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Sign in' }} />
        <Stack.Screen name="register" options={{ title: 'Create account' }} />
        <Stack.Screen name="todos/index" options={{ title: 'My Tasks' }} />
        <Stack.Screen name="todos/[id]" options={{ title: 'Task' }} />
      </Stack>
      <LatestErrorBanner />
    </View>
  );
};

export default function RootLayout(): ReactNode {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}
