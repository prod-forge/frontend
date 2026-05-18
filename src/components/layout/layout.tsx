import type { ReactNode } from 'react';

import { Outlet } from 'react-router-dom';

import { selectAuthUser, selectIsAuthenticated } from '../../features/auth/auth.selectors';
import { logout } from '../../features/auth/auth.slices';
import { useAppDispatch, useAppSelector } from '../../hooks/redux/redux';
import { useTheme } from '../../hooks/theme/use-theme';
import { Header } from '../header/header';

export const Layout = (): ReactNode => {
  const { theme, toggle } = useTheme();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        isAuthenticated={isAuthenticated}
        onLogout={() => dispatch(logout())}
        onToggle={toggle}
        theme={theme}
        user={user}
      />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
