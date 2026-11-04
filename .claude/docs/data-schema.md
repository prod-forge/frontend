# Data Schema

This document describes the frontend domain model: types, Redux state shape, and the purpose of each field.

---

## Domain Types

### `Todo`

```ts
type Todo = {
  id: string; // Server-assigned UUID. Optimistic items use "optimistic-{requestId}" prefix.
  title: string; // Short label. Max 200 chars. Required.
  description: string; // Extended details. Max 2000 chars. Can be empty.
  completed: boolean; // Completion status. Toggled optimistically.
};
```

The backend column is nullable (`description String?`), so a todo created by another client can come back with `description: null` although the type says `string`. The client always sends a string, and the UI treats a falsy description as empty.

### `TodosResponse`

```ts
type TodosResponse = {
  data: Todo[];
  meta: TodosMeta;
};

type TodosMeta = {
  limit: number; // Page size used for this response.
  offset: number; // 0-based row offset: number of items skipped.
  total: number; // Total matching items in the backend (used to compute page count).
};
```

### `TodoFilters`

```ts
type TodoFilters = {
  limit: LimitValue; // Items per page. One of: 10 | 20 | 50.
  offset: number; // 0-based row offset, (page - 1) * limit; the first page is 0.
  order: Order; // Sort direction: 'asc' | 'desc'.
  query: string; // Free-text search, sent as the `search` param (max 100 chars). Only when non-empty.
  sortBy: SortBy; // Sort field: 'title' | 'completed'.
};

Initial value in `todos.filters`: `{ limit: 10, offset: 0, order: 'asc', query: '', sortBy: 'title' }`.
```

### `AuthUser`

```ts
type AuthUser = {
  email: string; // User email. Used as display identity.
  name?: string; // Optional display name. Set on register.
};
```

### `AuthSession`

```ts
type AuthSession = {
  token: string; // accessToken from POST /auth/login.
  user: AuthUser;
};
```

Result of the `login` and `register` thunks and payload of `sessionRestored` (hydration).

### `SelectOption`

```ts
type SelectOption<T extends string = string> = {
  label: string; // Display text in dropdown.
  value: T; // Underlying value sent to API or stored in state.
};
```

---

## Redux State Shape

### `AuthState`

```ts
type AuthState = {
  hydration: 'idle' | 'hydrating' | 'done'; // Progress of restoring auth from storage.
  token: string | null; // HS256 JWT issued by POST /auth/login. null = unauthenticated.
  // Persisted in KeyValueStorage under key 'auth-token'.
  user: AuthUser | null; // Authenticated user info.
  // Persisted in KeyValueStorage under key 'auth-user'.
};
```

The initial state is always `{ hydration: 'idle', token: null, user: null }`. Storage is asynchronous (localStorage on web, SecureStore on mobile), so the app dispatches `hydrateAuth()` on boot: `pending` sets `hydrating`; when storage holds a valid session the thunk dispatches `sessionRestored`, which sets `token` and `user` (unless a token is already set); `fulfilled` and `rejected` both set `done`. UI that redirects on auth must wait for `done` (web: `AuthHydrationGate`). `token !== null` is the authoritative check for authentication (`selectIsAuthenticated`).

Persistence is a side effect in `auth.listeners.ts`: `login.fulfilled`/`register.fulfilled` write both keys, `logout` removes them. Reducers do not touch storage. A rejected thunk with a 401 status while a token is set dispatches `logout()` (expired session).

`token` is the HS256 JWT returned by `POST /auth/login`; its lifetime (`expiresIn`, seconds) is not stored, expiry is detected by the backend's 401.

---

### `TodosState`

```ts
type TodosState = {
  items: Todo[]; // Current page of todos shown in the list.
  total: number; // Total count from last getAll response (for pagination).
  status: TodosStatus; // 'idle' | 'loading' | 'error' — for the list fetch (fetchTodos and fetchMoreTodos).
  nextOffset: number; // Server offset after the last loaded page (fetchTodos/fetchMoreTodos); optimistic adds do not move it, a confirmed delete lowers it by 1. Mobile "Load more" requests from here.

  currentTodo: Todo | null; // Todo being viewed on the detail page.
  currentTodoStatus: CurrentTodoStatus; // 'idle' | 'loading' | 'error' | 'not-found' — for detail fetch.

  filters: TodoFilters; // Active filter/sort/pagination state.

  // Internal optimistic update bookkeeping — not rendered directly.
  _pendingDeletes: Partial<Record<string, { index: number; item: Todo }>>;
  // Key: requestId of the in-flight deleteTodo. Value: snapshot for rollback (item + original index).

  _pendingUpdates: Partial<Record<string, Pick<Todo, 'title' | 'description'>>>;
  // Key: requestId of the in-flight updateTodo. Value: previous title/description for rollback.
};
```

**`_pendingDeletes`** — when `deleteTodo` is dispatched, the item is removed from `items` immediately and stored here. On rejection, the item is re-inserted at its original index.

**`_pendingUpdates`** — when `updateTodo` is dispatched, the original title and description are stored here. On rejection, they are restored. `toggleTodo` keeps no snapshot: a rejection flips `completed` back.

Fields prefixed with `_` are internal and must not be selected directly by UI components — use selectors.

---

### `ErrorsState`

```ts
type ErrorsState = {
  errors: AppError[]; // Queue of active error notifications.
};

type AppError = {
  id: string; // Auto-generated (nanoid). Used to dismiss individual errors.
  message: string; // User-facing error message.
  type: AppErrorType; // 'backend-error' | 'frontend-error'
  source: ErrorSource; // 'rtk' (error middleware, the only source dispatched today) | 'react' | 'manual' (reserved)
  silent: boolean; // If true, error is not shown in UI (used for optimistic rollbacks).
  timestamp: number; // Unix ms timestamp of when the error was pushed.
};
```

**`silent`** — errors from optimistic rollbacks (e.g. deleting a temp item that fails) are marked silent. They are still logged, but neither reported (`reportError`) nor shown as toasts. `selectVisibleErrors` filters them out.

---

## Validation Constraints

### Auth

| Field    | Rule                                                                |
| -------- | ------------------------------------------------------------------- |
| email    | Required. Must match `^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$`            |
| password | Min 3 chars (`PASSWORD_MIN_LENGTH`), max 20 (`PASSWORD_MAX_LENGTH`) |
| name     | Optional. Max 50 chars (`NAME_MAX_LENGTH`). Trimmed.                |

### Todos

| Field       | Rule                                                                             |
| ----------- | -------------------------------------------------------------------------------- |
| title       | Required (min 1 char after trim). Max 200 chars (`TITLE_MAX_LENGTH`).            |
| description | Optional. Max 2000 chars (`DESCRIPTION_MAX_LENGTH`).                             |
| search      | Optional. Max 100 chars (`SEARCH_MAX_LENGTH`), enforced by the web search input. |

---

## Constants / Enums

```ts
type LimitValue = 10 | 20 | 50;
type Order = 'asc' | 'desc';
type SortBy = 'title' | 'completed';
type AppErrorType = 'backend-error' | 'frontend-error';
type ErrorSource = 'rtk' | 'react' | 'manual';
type TodosStatus = 'idle' | 'loading' | 'error';
type CurrentTodoStatus = 'idle' | 'loading' | 'error' | 'not-found';
```
