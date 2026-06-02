# Data Schema

This document describes the frontend domain model: types, Redux state shape, and the purpose of each field.

---

## Domain Types

### `Todo`

```ts
interface Todo {
  id: string; // Server-assigned UUID. Optimistic items use "optimistic-{requestId}" prefix.
  title: string; // Short label. Max 50 chars. Required.
  description: string; // Extended details. Max 200 chars. Can be empty.
  completed: boolean; // Completion status. Toggled optimistically.
}
```

### `TodosResponse`

```ts
interface TodosResponse {
  data: Todo[];
  meta: TodosMeta;
}

interface TodosMeta {
  limit: number; // Page size used for this response.
  offset: number; // Number of items skipped.
  total: number; // Total matching items in the backend (used to compute page count).
}
```

### `TodoFilters`

```ts
interface TodoFilters {
  limit: LimitValue; // Items per page. One of: 10 | 20 | 50.
  offset: number; // Current page offset (limit * pageIndex).
  order: Order; // Sort direction: 'asc' | 'desc'.
  query: string; // Free-text search. Sent only when non-empty.
  sortBy: SortBy; // Sort field: 'title' | 'completed'.
}
```

### `AuthUser`

```ts
interface AuthUser {
  email: string; // User email. Used as display identity.
  name?: string; // Optional display name. Set on register.
}
```

### `SelectOption`

```ts
interface SelectOption<T extends string = string> {
  label: string; // Display text in dropdown.
  value: T; // Underlying value sent to API or stored in state.
}
```

---

## Redux State Shape

### `AuthState`

```ts
interface AuthState {
  token: string | null; // JWT or session token. null = unauthenticated.
  // Persisted in localStorage under key 'auth-token'.
  user: AuthUser | null; // Authenticated user info.
  // Persisted in localStorage under key 'auth-user'.
}
```

Auth is initialized from localStorage on app boot. `token !== null` is the authoritative check for authentication (`selectIsAuthenticated`).

> Note: `FAKE_TOKEN` is currently used as a placeholder. Real auth flow to be implemented.

---

### `TodosState`

```ts
interface TodosState {
  items: Todo[]; // Current page of todos shown in the list.
  total: number; // Total count from last getAll response (for pagination).
  status: AsyncStatus; // 'idle' | 'loading' | 'error' — for the list fetch.

  currentTodo: Todo | null; // Todo being viewed on the detail page.
  currentTodoStatus: DetailStatus; // 'idle' | 'loading' | 'error' | 'not-found' — for detail fetch.

  filters: TodoFilters; // Active filter/sort/pagination state.

  // Internal optimistic update bookkeeping — not rendered directly.
  _pendingDeletes: Record<string, { index: number; item: Todo }>;
  // Key: todo ID being deleted. Value: snapshot for rollback (item + original index).

  _pendingUpdates: Record<string, Pick<Todo, 'title' | 'description'>>;
  // Key: todo ID being updated. Value: previous title/description for rollback.
}
```

**`_pendingDeletes`** — when `deleteTodo` is dispatched, the item is removed from `items` immediately and stored here. On rejection, the item is re-inserted at its original index.

**`_pendingUpdates`** — when `updateTodo` or `toggleTodo` is dispatched, the original field values are stored here. On rejection, they are restored.

Fields prefixed with `_` are internal and must not be selected directly by UI components — use selectors.

---

### `ErrorsState`

```ts
interface ErrorsState {
  errors: AppError[]; // Queue of active error notifications.
}

interface AppError {
  id: string; // Auto-generated UUID. Used to dismiss individual errors.
  message: string; // User-facing error message.
  type: AppErrorType; // 'backend-error' | 'frontend-error'
  source: ErrorSource; // 'rtk' (middleware) | 'react' (ErrorBoundary) | 'manual'
  silent: boolean; // If true, error is not shown in UI (used for optimistic rollbacks).
  timestamp: number; // Unix ms timestamp of when the error was pushed.
}
```

**`silent`** — errors from optimistic rollbacks (e.g. deleting a temp item that fails) are marked silent. They are still logged and sent to Sentry but not shown as toasts. `selectVisibleErrors` filters them out.

---

## Validation Constraints

### Auth

| Field    | Rule                                                                |
| -------- | ------------------------------------------------------------------- |
| email    | Required. Must match `^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$`            |
| password | Min 3 chars (`PASSWORD_MIN_LENGTH`), max 20 (`PASSWORD_MAX_LENGTH`) |
| name     | Optional. Max 50 chars (`NAME_MAX_LENGTH`). Trimmed.                |

### Todos

| Field       | Rule                                                                 |
| ----------- | -------------------------------------------------------------------- |
| title       | Required (min 1 char after trim). Max 50 chars (`TITLE_MAX_LENGTH`). |
| description | Optional. Max 200 chars (`DESCRIPTION_MAX_LENGTH`).                  |

---

## Constants / Enums

```ts
type LimitValue = 10 | 20 | 50;
type Order = 'asc' | 'desc';
type SortBy = 'title' | 'completed';
type AppErrorType = 'backend-error' | 'frontend-error';
type ErrorSource = 'rtk' | 'react' | 'manual';
type AsyncStatus = 'idle' | 'loading' | 'error';
type DetailStatus = 'idle' | 'loading' | 'error' | 'not-found';
```
