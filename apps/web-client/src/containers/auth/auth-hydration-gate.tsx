import type { ReactNode } from 'react';

import { useAppSelector } from '../../hooks/redux/redux';

type AuthHydrationGateProps = {
  readonly children: ReactNode;
};

// Auth is restored from async storage; rendering routes earlier would redirect a signed-in user to the guest view.
export const AuthHydrationGate = ({ children }: AuthHydrationGateProps): ReactNode => {
  const hydration = useAppSelector((state) => state.auth.hydration);

  return hydration === 'done' ? children : null;
};
