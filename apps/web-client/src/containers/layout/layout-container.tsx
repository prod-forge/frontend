import type { ReactNode } from 'react';

import { logout, selectAuthUser, selectIsAuthenticated } from '@prod-forge-todolist-frontend/core';
import { Layout } from '@prod-forge-todolist-frontend/ui-web';

import { useAppDispatch, useAppSelector } from '../../hooks/redux/redux';

export const LayoutContainer = (): ReactNode => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

  return <Layout isAuthenticated={isAuthenticated} onLogout={() => dispatch(logout())} user={user} />;
};
