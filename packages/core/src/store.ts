import { configureStore } from '@reduxjs/toolkit';

import { authListenerMiddleware } from './features/auth/auth.listeners';
import { authReducer } from './features/auth/auth.slices';
import { errorMiddleware } from './features/errors/error-middleware';
import { errorsReducer } from './features/errors/errors.slice';
import { todosReducer } from './features/todos/todos.slices';

export const store = configureStore({
  middleware: (getDefault) => getDefault().prepend(authListenerMiddleware.middleware).concat(errorMiddleware),
  reducer: {
    auth: authReducer,
    errors: errorsReducer,
    todos: todosReducer,
  },
});

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;

export type Store = typeof store;
