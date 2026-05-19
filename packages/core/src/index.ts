// API
export { apiRequest } from './api/client';
export { logsApi } from './api/logs.api';

export { todosApi } from './api/todos.api';
// Errors
export { BackendError, isBackendErrorResponse } from './errors/backend-error';

export { NETWORK_ERROR_MESSAGES, NetworkError } from './errors/network-error';
export { FAKE_TOKEN, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './features/auth/auth.constants';

export {
  forgotPasswordSchema,
  loginSchema,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  registerSchema,
} from './features/auth/auth.schemas';
export type { ForgotPasswordValues, LoginValues, RegisterValues } from './features/auth/auth.schemas';
export { selectAuthToken, selectAuthUser, selectIsAuthenticated } from './features/auth/auth.selectors';

export { authReducer, login, logout, register } from './features/auth/auth.slices';
// Auth feature
export type { AuthState, AuthUser } from './features/auth/auth.types';
export { errorMiddleware } from './features/errors/error-middleware';
export { selectVisibleErrors } from './features/errors/errors.selectors';
export { clearErrors, dismissError, errorsReducer, pushError } from './features/errors/errors.slice';
// Errors feature
export type { AppError, AppErrorType, ErrorSource, ErrorsState } from './features/errors/errors.types';

export { LIMIT_OPTIONS, ORDER_OPTIONS, SORT_BY_OPTIONS } from './features/todos/todos.constants';
export {
  DESCRIPTION_MAX_LENGTH,
  descriptionSchema,
  TITLE_MAX_LENGTH,
  titleSchema,
} from './features/todos/todos.schemas';
export {
  selectCompletedTodos,
  selectCurrentTodo,
  selectCurrentTodoStatus,
  selectFilters,
  selectItems,
  selectStatus,
  selectTotalTodos,
  selectVisibleTodos,
} from './features/todos/todos.selectors';
export {
  addTodo,
  clearCurrentTodo,
  deleteTodo,
  fetchTodoById,
  fetchTodos,
  setLimit,
  setOffset,
  setOrder,
  setSortBy,
  todosReducer,
  toggleTodo,
  updateFilters,
  updateTodo,
} from './features/todos/todos.slices';
// Todos feature
export type { LimitValue, Order, SortBy, TodoFilters, TodosState } from './features/todos/todos.types';
export { filterTodos, sortTodos } from './features/todos/todos.utils';

export type { SelectOption } from './interfaces/select-option';
// Interfaces
export type { Todo, TodosResponse } from './interfaces/todos';
// Services
export { consoleLogger } from './services/logger/console.logger';
export { loggerLimit } from './services/logger/logger.constants';

export { traceId } from './services/logger/trace-id';
export { captureException, initSentry } from './services/sentry/sentry';
// Store
export { store } from './store';
export type { AppDispatch, RootState, Store } from './store';

// Test data (for use in tests only)
export { todos } from './test/data/todos';
