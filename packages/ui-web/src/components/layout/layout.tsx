import type { ReactNode } from 'react';

import { Outlet } from 'react-router-dom';

import { useTheme } from '../../hooks/theme/use-theme';
import { Header } from '../header/header';

export interface Props {
  isAuthenticated?: boolean;
  onLogout?: () => void;
  user?: null | { email: string; name?: string };
}

export const Layout = ({ isAuthenticated, onLogout, user }: Props): ReactNode => {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={isAuthenticated} onLogout={onLogout} onToggle={toggle} theme={theme} user={user} />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
