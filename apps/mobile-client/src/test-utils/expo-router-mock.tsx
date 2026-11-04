import type { ReactNode } from 'react';

import { Text, View } from 'react-native';

// Screens are tested without a navigation container: navigation calls are spies and
// <Redirect> renders its target so a test can assert where the screen sent the user.
export const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

export const mockSearchParams: { current: Record<string, string> } = { current: {} };

/** @public Consumed through jest.mock('expo-router'). */
// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix -- mirrors the expo-router hook name
export const useRouter = (): typeof mockRouter => mockRouter;

/** @public Consumed through jest.mock('expo-router'). */
// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix -- mirrors the expo-router hook name
export const useLocalSearchParams = (): Record<string, string> => mockSearchParams.current;

/** @public Consumed through jest.mock('expo-router'). */
export const Redirect = ({ href }: { readonly href: string }): ReactNode => <Text testID="redirect">{href}</Text>;

const StackScreen = (): ReactNode => null;

const StackNavigator = ({ children }: { readonly children?: ReactNode }): ReactNode => (
  <View testID="stack">{children}</View>
);

/** @public Consumed through jest.mock('expo-router'). */
export const Stack = Object.assign(StackNavigator, { Screen: StackScreen });
