import type { RootState } from '@prod-forge-todolist-frontend/core';
import type { TypedUseSelectorHook } from 'react-redux';

import { useSelector } from 'react-redux';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
