import type { AppDispatch } from '@prod-forge-todolist-frontend/core';

import { useDispatch } from 'react-redux';

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
