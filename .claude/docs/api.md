# API Description

All HTTP calls go through `packages/core/src/api/client.ts`. Never call `fetch` directly from components or pages.

Base URL: `import.meta.env.VITE_API_BASE_URL` (e.g. `http://localhost:3000/api/v1/`)

---

## HTTP Client

**Function:** `apiRequest<T>(path: string, options?: RequestInit): Promise<T>`

**Default headers on every request:**

```
Authorization: Bearer <FAKE_TOKEN>
Content-Type: application/json
x-trace-id: <uuid>
```

**Error handling:**

- Network failure → throws `NetworkError` ("Unable to connect to the server. Please check your connection.")
- Non-2xx response → tries to parse JSON body:
  - If body matches `BackendErrorResponse` → throws `BackendError` (with code, message, status, traceId)
  - Otherwise → throws `ApiError` (message: `HTTP {status}`, status: number)
- `204 No Content` → returns `undefined as T`

All errors propagate to the Redux `errorMiddleware`, which dispatches `pushError` and reports to Sentry.

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

### `logsApi.send(stack: Stack): Promise<void>`

```
POST /client-logs/web
Content-Type: application/json
```

Sends logrock `Stack` payload for client-side error reporting.

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
