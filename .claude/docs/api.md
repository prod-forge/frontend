# API Description

All HTTP calls go through `packages/core/src/api/client.ts`. Never call `fetch` directly from components or pages.

Base URL: `getCoreConfig().apiBaseUrl`, set by the app through `configureCore` (web passes `VITE_API_BASE_URL`, e.g. `http://localhost:3000/api/v1/`). It must end with `/`; `configureCore` throws otherwise. If no app called `configureCore`, the first request throws `CoreNotConfiguredError`.

---

## HTTP Client

**Function:** `apiRequest<T>(path: string, options?: RequestInit): Promise<T>`

**Default headers on every request:**

```
Authorization: Bearer <token>   # only when getCoreConfig().getToken() returns a token
Content-Type: application/json
x-trace-id: <uuid>
```

`getToken` is called on every request, so login and logout take effect without reconfiguring core. Web reads `store.getState().auth.token`. A logged-out user sends no `Authorization` header.

**Error handling:**

- Network failure → throws `NetworkError` ("Unable to connect to the server. Please check your connection.")
- Non-2xx response → tries to parse JSON body:
  - If body matches `BackendErrorResponse` → throws `BackendError` (with code, message, status, traceId)
  - Otherwise → throws `ApiError` (message: `HTTP {status}`, status: number)
- `204 No Content` → returns `undefined as T`

All errors propagate to the Redux `errorMiddleware`, which logs them through `CoreLogger`, dispatches `pushError` and calls `getCoreConfig().reportError` (Sentry on web) unless the error carries a 4xx `status`. Todo thunks use `serializeError: serializeApiError` so `status` survives RTK's error serialization; errors without a status (network, frontend bugs) are always reported.

---

## Todos API

**Module:** `packages/core/src/api/todos.api.ts`

### `todosApi.getAll(filters: TodoFilters): Promise<TodosResponse>`

```
GET /todos?limit={n}&offset={n}&order={asc|desc}&sortBy={title|completed}&query={string}
```

Query param `query` is only included when non-empty after trim.

Response:

```ts
{
  data: Todo[];
  meta: { limit: number; offset: number; total: number };
}
```

---

### `todosApi.getOne(id: string): Promise<Todo>`

```
GET /todos/:id
```

Response wrapper: `{ data: Todo }` — returns extracted `Todo`.

Errors: 404 maps to `'not-found'` kind in `fetchTodoById` thunk.

---

### `todosApi.create(data: CreatePayload): Promise<Todo>`

```
POST /todos
Content-Type: application/json

{ "title": string, "description": string }
```

Response wrapper: `{ data: Todo }` — returns extracted `Todo`.

Called by `addTodo` thunk. Optimistic item (prefixed `optimistic-{requestId}`) is prepended before the request and replaced on success.

---

### `todosApi.update(id: string, data: UpdatePayload): Promise<Todo>`

```
PATCH /todos/:id
Content-Type: application/json

{ "title"?: string, "description"?: string, "completed"?: boolean }
```

Response wrapper: `{ data: Todo }` — returns extracted `Todo`.

---

### `todosApi.delete(id: string): Promise<void>`

```
DELETE /todos/:id
```

Returns void (204 No Content).

---

## Logs API

**Module:** `packages/core/src/api/logs.api.ts`

### `logsApi.send(stack: object): Promise<void>`

```
POST /client-logs/web
Content-Type: application/json
```

Sends a client log stack (on web, logrock's `Stack` from `LoggerContainer.onError`). Core types it as `object` so it does not depend on logrock.

---

## Backend Error Codes

Returned in `BackendError.code`. Frontend maps these to user-facing messages:

| Code                     | User message                                                  |
| ------------------------ | ------------------------------------------------------------- |
| `DATABASE_ERROR`         | A storage error occurred. Please try again later.             |
| `DTO_VALIDATION_ERROR`   | Your request contains invalid data. Please check your input.  |
| `FORBIDDEN`              | You do not have permission to perform this action.            |
| `HTTP_EXCEPTION`         | An unexpected request error occurred.                         |
| `INFRA_FAILURE`          | A service is temporarily unavailable. Please try again later. |
| `INTERNAL_ERROR`         | Something went wrong on our end. Please try again later.      |
| `REDIS_ERROR`            | A caching error occurred. Please try again later.             |
| `TODO_NOT_FOUND`         | The requested item could not be found.                        |
| `USER_IS_NOT_AUTHORIZED` | Please log in to continue.                                    |
| `USER_NOT_FOUND`         | The requested user could not be found.                        |
| _(fallback)_             | Something went wrong. Please try again later.                 |

---

## Async Thunks

Thunks are defined in `packages/core/src/features/todos/todos.slices.ts`. Each has optimistic update logic.

| Thunk           | Input                                                  | Output          | Optimistic |
| --------------- | ------------------------------------------------------ | --------------- | ---------- |
| `fetchTodos`    | `TodoFilters`                                          | `TodosResponse` | No         |
| `fetchTodoById` | `string` (id)                                          | `Todo`          | No         |
| `addTodo`       | `{ title: string; description: string }`               | `Todo`          | Yes        |
| `deleteTodo`    | `string` (id)                                          | `string` (id)   | Yes        |
| `toggleTodo`    | `string` (id)                                          | `Todo`          | Yes        |
| `updateTodo`    | `{ id: string; title?: string; description?: string }` | `Todo`          | Yes        |

**Optimistic pattern:**

- `pending` — apply change immediately to UI state
- `fulfilled` — replace with server response
- `rejected` — roll back to previous state; mark as `silent: true` if operating on a temp optimistic ID

Temp IDs use the prefix `optimistic-{requestId}`.

### Auth thunk

`hydrateAuth` (`packages/core/src/features/auth/auth.thunks.ts`), `AsyncThunk<AuthUser | null, void, { state: RootState }>`. Reads `TOKEN_STORAGE_KEY` and `USER_STORAGE_KEY` from `getCoreConfig().storage`. When both are present and the user parses with a string `email`, it restores `token` and `user` and resolves with the user; otherwise it resolves with `null`. A storage failure is logged through `logger.error(error, 'auth/hydrate')` and also resolves with `null`, so hydration always ends in `done` and never surfaces an error toast. Each app dispatches it once at startup, after `configureCore`. If `login` or `register` completes while hydration is still reading storage, the newer session wins: the restored session is applied only when no token is set yet.
