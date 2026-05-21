import type { ReactNode } from 'react';

import { dismissError, selectVisibleErrors } from '@prod-forge-todolist-frontend/core';
import { ErrorNotifier } from '@prod-forge-todolist-frontend/ui-web';

import { useAppDispatch, useAppSelector } from '../../hooks/redux/redux';

export const ErrorNotifierContainer = (): ReactNode => {
  const dispatch = useAppDispatch();
  const errors = useAppSelector(selectVisibleErrors);

  return <ErrorNotifier errors={errors} onDismiss={(id) => dispatch(dismissError(id))} />;
};
