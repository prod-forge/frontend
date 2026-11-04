import type { ReactNode } from 'react';

import { selectIsAuthenticated } from '@prod-forge-todolist-frontend/core';
import { Redirect } from 'expo-router';

import { useAppSelector } from '../hooks/use-app-selector';

// Rendered only after auth hydration (see _layout), so a restored session goes straight to the list.
export default function Index(): ReactNode {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return <Redirect href={isAuthenticated ? '/todos' : '/login'} />;
}
