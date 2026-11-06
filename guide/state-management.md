# State Management

<p align="center">
  <img alt="State Management" src="assets/state-management.jpg" width="701px" height="561px">
</p>

## Why Redux Toolkit Here

The client state of this application is small: a list of todos, filters, the signed-in user and a queue of errors. The choice of a state library was driven by three criteria rather than by the size of the state:

- **Shared with mobile.** The store lives in `packages/core`, which has no DOM and no browser API. `apps/web-client` and `apps/mobile-client` import the same store, thunks and selectors. A library that is tied to React DOM, or to a browser cache, would not fit.
- **Predictability.** Every change is an action, every action is visible in Redux DevTools, and every reducer is a pure function. This also matters when code is generated with AI assistance: a slice has a rigid shape (state, reducers, extra reducers), so a generated change is easy to review and hard to get subtly wrong.
- **Optimistic updates with an explicit rollback.** The pending and rejected phases of a thunk are first-class actions, so "apply now, revert on failure" is a few lines in a reducer instead of a cache-manipulation protocol.

Alternatives were considered:

| Option                 | Why it was not chosen                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| React Query / SWR      | Strong for server cache, but the cache and its hooks live in the React layer. Sharing the logic with mobile needs adapters. |
| Zustand / Jotai        | Little ceremony, but no built-in convention for async lifecycle, so every team member invents their own.                    |
| `useReducer` + Context | Fine for one screen. Here the list, the detail page and the error toasts all read the same state.                           |

Redux is not free: it is more code than a query hook for a plain fetch-and-show screen. For an application where the same state is read by two clients, and where rollback matters, the explicitness pays for itself.

## Slices and Thunks

The store is assembled in `packages/core/src/store.ts` from three slices:

```ts
export const store = configureStore({
  middleware: (getDefault) => getDefault().prepend(authListenerMiddleware.middleware).concat(errorMiddleware),
  reducer: {
    auth: authReducer,
    errors: errorsReducer,
    todos: todosReducer,
  },
});
```

Each feature is a folder in `packages/core/src/features/<name>/` with one file per concern: `*.slices.ts`, `*.thunks.ts` or thunks inside the slice file, `*.selectors.ts`, `*.types.ts`, `*.schemas.ts`.

The todos slice (`todos.slices.ts`) keeps this state:

```ts
{
  items: Todo[];            // the loaded list, including optimistic items
  total: number;            // total on the server for the current query
  nextOffset: number;       // server offset to request next
  filters: TodoFilters;     // limit, offset, order, query, sortBy
  status: 'idle' | 'loading' | 'error';
  currentTodo: Todo | null; // the detail page
  currentTodoStatus: ...;   // idle | loading | error | not-found
  _pendingDeletes, _pendingUpdates  // rollback snapshots, keyed by requestId
}
```

Thunks are created with `createAsyncThunk` and call the API through `todosApi`, never through `fetch`. The slice reacts to the three lifecycle actions of every thunk in `extraReducers`.

Three details are worth knowing:

- `nextOffset` is the offset on the **server**, computed as `arg.offset + payload.length` when a page arrives. It is deliberately independent of `items.length`, because optimistic inserts make the local list longer than what the server has. `fetchMoreTodos` (used by the mobile "load more" list) appends the next page (skipping ids that are already loaded) and uses `nextOffset`; `fetchTodos` replaces the list.
- The `logout` action resets the whole todos slice to its initial state, so the next session never sees the previous user's list.
- Filter changes (`setLimit`, `setOrder`, `setSortBy`, `updateFilters`) reset `filters.offset` through one helper, `resetPagination`, so a new sort never keeps a stale page.

## Optimistic Updates and Rollback

Todo mutations are applied to the state before the server answers. The pattern is the same for all of them:

1. **pending**: change the state immediately. Save what is needed to undo it.
2. **fulfilled**: replace the optimistic data with the server's response.
3. **rejected**: undo the change from the saved snapshot.

`toggleTodo` is the smallest example:

```ts
.addCase(toggleTodo.pending, (state, action) => {
  const todo = state.items.find((t) => t.id === action.meta.arg);
  if (todo) {
    todo.completed = !todo.completed;
  }
})
.addCase(toggleTodo.rejected, (state, action) => {
  const todo = state.items.find((t) => t.id === action.meta.arg);
  if (todo) {
    todo.completed = !todo.completed;
  }
})
```

A toggle is its own inverse, so no snapshot is needed. The payload function reads the already flipped value, so the request carries the new desired state.

The other mutations need a snapshot:

| Thunk        | pending                                          | rejected                                        |
| ------------ | ------------------------------------------------ | ----------------------------------------------- |
| `addTodo`    | prepend an item with id `optimistic-<requestId>` | remove the item with that id, decrement `total` |
| `deleteTodo` | remove the item, store `{ index, item }`         | insert the item back at its old index           |
| `updateTodo` | apply new title/description, store the old       | restore the stored title/description            |

Snapshots are keyed by `action.meta.requestId`, which is unique per dispatch. Two quick edits of the same todo therefore cannot overwrite each other's snapshot.

The `optimistic-` prefix has a second use. A thunk that receives such an id (`toggleTodo`, `updateTodo`, `deleteTodo`) returns `rejectWithValue({ silent: true })` without calling the API: the todo does not exist on the server yet. The error middleware sees `silent` and keeps this rejection out of the toast list.

Known limit: rollback restores the value that was current when the request started. If a second, later change to the same field succeeded in the meantime, a failure of the first one can restore an older value. For a single-user todo list this is acceptable; for collaborative data a version number or server-side merge would be needed.

## Selectors and Memoization

`todos.selectors.ts` defines every read of the todos state with `createSelector`:

```ts
const selectTodosState = (state: RootState): RootState['todos'] => state.todos;

export const selectItems = createSelector(selectTodosState, (state) => state.items);
export const selectCompletedTodos = createSelector(selectItems, (items) => items.filter((t) => t.completed).length);
```

Components never reach into `state.todos` themselves. The reasons:

- The shape of the state can change (see the next sections) without touching a component.
- Derived values such as `selectCompletedTodos` are computed once per change of `items`, not on every render.
- Selectors are plain functions and are tested without React (`todos.selectors.test.ts`).

Not every selector earns its memoization. `selectItems` returns an existing reference and would be fine as a plain function; it is wrapped for consistency, so that the whole feature is read the same way. The memoization that matters is on derived values: a filter or a count that creates a new array or number on every call.

On web, components read the store through the typed hooks `useAppSelector` and `useAppDispatch` in `apps/web-client/src/hooks/redux/`. Containers (`containers/`) connect the store to the stateless components of `ui-web`, which is what keeps those components usable in Storybook without a provider.

## Error Middleware

Errors are handled once, in `errorMiddleware` (`features/errors/error-middleware.ts`), not in each thunk. For every rejected action it does three things:

```text
rejected action
   |
   +--> logger.error(...)                      always
   +--> reportError(...)                       only if status is missing or >= 500,
   |                                           and the rejected value is not silent / not-found
   +--> dispatch(pushError({ message, silent })) always; UI reads selectVisibleErrors
```

The `reportError` rule is `error.status === undefined || error.status >= 500`. A 4xx is an expected outcome: an unknown email at login, validation failure, an item that was deleted elsewhere. It is shown to the user, but it is not a defect, and sending it to Sentry would bury the real ones.

For the middleware to see the status, thunks are created with `serializeError: serializeApiError` (`errors/serialize-api-error.ts`). RTK's default serializer keeps only `name`, `message` and `stack`, so without this the status would be lost before the middleware runs.

The errors slice (`errors.slice.ts`) stores `AppError` records (`id`, `message`, `silent`, `source`, `timestamp`, `type`). `selectVisibleErrors` filters out `silent` ones. How these become toasts is described in [API Client and Errors](api-client-and-errors.md).

Thunks that use `rejectWithValue` for expected outcomes are not reported either. `fetchTodoById` rejects with `{ kind: 'not-found', silent: true }` on a 404, and the optimistic thunks reject with `{ silent: true }` for temp ids that never reached the server. Such a rejection has no `status` on `action.error`, so `shouldReport` alone would treat it as status-less; the middleware therefore also skips any rejected value that is `silent` or of kind `not-found`. A different `rejectWithValue` payload (for example `{ kind: 'error' }`) is still reported.

## Normalization or Not

`items` is a plain array and lookups are `items.find(...)` or `findIndex(...)`. This is a deliberate choice:

- The list is one page of at most 10 to 50 items on web, and a few pages on mobile. A linear search over that is not measurable.
- Order matters and comes from the server (sort, search, pagination). An array already is the order; an entity adapter would need a separate `ids` array to keep it, and every server response would have to be merged into it.
- The same todo exists in two places: in `items` and in `currentTodo`. Both are updated by `updateTodo`, explicitly, in one reducer. It is a small amount of duplication that stays readable.

When to switch to `createEntityAdapter`:

- The list grows to hundreds of items held at once (for example an infinite list that is never reset).
- Several slices need to read the same entity by id (comments, tags, assignees).
- Updates arrive from outside the request/response cycle (WebSocket, polling) and must be merged by id.

At that point the first step is to replace `items` with an adapter state and keep the selectors as the only public read API. Because components use selectors, the change would stay inside `packages/core`.

## Sharing the Store With Mobile

`packages/core` must not know what platform it runs on. Everything platform-specific is injected once, at startup, through `configureCore` (`config/core-config.ts`):

```ts
type CoreConfig = {
  readonly apiBaseUrl: string;
  readonly getToken: () => null | string;
  readonly logger: CoreLogger;
  readonly reportError: (error: unknown, context?: Record<string, unknown>) => void;
  readonly storage: KeyValueStorage;
};
```

| Need            | Web (`apps/web-client/src/services/core-setup.ts`) | Mobile (`apps/mobile-client/src/services/core-setup.ts`) |
| --------------- | -------------------------------------------------- | -------------------------------------------------------- |
| Persistence     | `localStorage` adapter                             | `expo-secure-store` adapter                              |
| Logger          | `logrock`                                          | console logger                                           |
| Error reporting | `@sentry/react`                                    | `@sentry/react-native`                                   |
| Base URL        | `VITE_API_BASE_URL`                                | `EXPO_PUBLIC_API_BASE_URL`                               |

If the entry point forgets to call it, the first request throws `CoreNotConfiguredError` with a message that says what to do, instead of a `TypeError` from an undefined config. `configureCore` also rejects an empty base URL or one without a trailing slash.

Storage is asynchronous on purpose (`KeyValueStorage` returns promises), because SecureStore is. Auth persistence is therefore not done in reducers. It is a listener (`auth.listeners.ts`) that writes the token and user after `login` or `register`, and removes them after `logout`. A second listener dispatches `logout()` when any request is rejected with a 401 while a token exists (see [Security](security.md#authentication)). On startup the `hydrateAuth` thunk reads the storage and `auth.hydration` moves `idle -> hydrating -> done`. On web, `AuthHydrationGate` renders nothing until hydration is done, so the UI does not flash a signed-out state for a user who is signed in.

More about the mobile side is in the [Mobile Client](mobile-client.md) chapter.
