import { selectIsAuthenticated } from '@prod-forge-todolist-frontend/core';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useAppSelector } from './use-app-selector';

// Login and register leave the auth stack as soon as a session exists (fresh sign-in or restored one).
export const useRedirectWhenAuthenticated = (): void => {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/todos');
    }
  }, [isAuthenticated, router]);
};
