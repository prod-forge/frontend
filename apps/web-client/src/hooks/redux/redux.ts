import type { AppDispatch, RootState } from '@prod-forge-todolist-frontend/core';
import type { TypedUseSelectorHook } from 'react-redux';

import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
