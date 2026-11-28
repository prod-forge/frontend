# State Management

<p align="center">
  <img alt="State Management" src="assets/state-management.jpg" width="701px" height="561px">
</p>

## Why Redux Toolkit Here

The client state of this application is small: a list of todos, filters, the signed-in user and a queue of errors. The choice of a state library was driven by three criteria rather than by the size of the state:

- **Shared with mobile.** The store lives in `packages/core`, which has no DOM and no browser API. `apps/web-client` and `apps/mobile-client` import the same store, thunks and selectors. A library that is tied to React DOM, or to a browser cache, would not fit.
- **Predictability.** Every change is an action, every action is visible in Redux DevTools, and every reducer is a pure function. This also matters when code is generated with AI assistance: a slice has a rigid shape (state, reducers, extra reducers), so the generated change is easy to review and hard to get subtly wrong.
- **Optimistic updates with an explicit rollback.** The pending and rejected phases of a thunk are first-class actions, so "apply now, revert on failure" is a few lines in a reducer instead of a cache-manipulation protocol.

Alternatives were considered:

| Option               | Why it was not chosen                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| React Query / SWR    | Strong for server cache, but the cache and its hooks live in the React layer. Sharing the logic with mobile needs adapters. |
| Zustand / Jotai      | Little ceremony, but no built-in convention for async lifecycle, so every team member invents their own.                     |
| `useReducer` + Context | Fine for one screen. Here the list, the detail page and the error toasts all read the same state.                         |

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

Each feature is a folder in `packages/core/src/features/<name>/` with one file per concern: `*.slices.ts` for state, `*.types.ts` for types, `*.selectors.ts` for selectors and `*.slices.test.ts` for tests. The same naming convention holds for `features/auth` and `features/errors`.

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
  _latestToggleRequestIds           // latest toggleTodo requestId per todo id; older toggle responses are ignored
}
```

Thunks are created with `createAsyncThunk` and call the API through `todosApi`, never through `fetch`. Thunks are the only place that touches the network; the UI dispatches thunks and reads selectors. Components never call `todosApi` directly.

Three details are worth knowing:

- `nextOffset` is the offset on the **server**, computed as `arg.offset + payload.length` when a page arrives. Optimistic adds do not move it, and a confirmed delete lowers it by 1 so the next page request does not skip a row. It is the value `fetchMoreTodos` passes as `offset`.
- The `logout` action resets the whole todos slice to its initial state, so the next session never sees the previous user's list.
- Filter changes (`setLimit`, `setOrder`, `setSortBy`, `updateFilters`) reset `filters.offset` through one helper (`resetPagination` in `todos.slices.ts`). `setOffset` does not reset, because it is the pagination action.

## Optimistic Updates and Rollback

Todo mutations are applied to the state before the server answers. The pattern is the same for all optimistic actions (`addTodo`, `deleteTodo`, `toggleTodo`, `updateTodo`):

1. **pending**: change the state immediately. Save what is needed to undo it.
2. **fulfilled**: replace the optimistic data with the server's response.
3. **rejected**: undo the optimistic change using the snapshot saved in pending.

For example, a todo's `completed` flag is flipped on `toggleTodo.pending`, and flipped back on `toggleTodo.rejected`. This keeps the UI responsive on slow networks, and the server remains the source of truth when it answers. The optimistic item id is `optimistic-{requestId}` (see `TEMP_ID_PREFIX` in `todos.slices.ts`), so an add that is still in flight is addressable by the toggle/delete handlers.

```ts
// toggleTodo
builder.addCase(toggleTodo.pending, (state, action) => {
  // flip the item immediately, so the checkbox answers at once
});
// The API returns the new item; replace the optimistic entry.
```

Two quick toggles of the same todo send two requests that can resolve in either order. `toggleTodo.pending` records the latest `requestId` for that todo in `_latestToggleRequestIds`, and `fulfilled`/`rejected` from an older toggle are ignored, so a late first response cannot overwrite the second toggle's state (and a late rejection cannot flip `completed` back).

A mutation that changes a field that other mutations read (toggle, update) must use the current state inside the thunk, not the arguments it was called with. In `toggleTodo`, the thunk reads `todo.completed` from the state and sends that value: `pending` has already flipped it, so it is the new value the user asked for.

**Known limit: undoing one optimistic mutation can restore an older value.** `updateTodo` keeps the title/description from before the first update in `_pendingUpdates`, and a second update can be undone to that earlier value by the first rejection. Rollback is keyed by requestId, but it is a plain value restore, not a full replay of the intent. The toggle case no longer has this limit: a rejection from an older toggle is ignored once a newer toggle exists (see `_latestToggleRequestIds` above).

## Selectors

`todos.selectors.ts` exposes the store's reads: `selectTodos`, `selectTodosStatus`, `selectTodosFilters`, `selectCompletedTodos`, `selectCurrentTodo`, `selectCurrentTodoStatus`. Components only import selectors from `packages/core`, so the exact shape of the state stays a core concern. `selectCompletedTodos` returns the server-computed `completed` count (the completed items among all items matching the filters, not only the loaded page).

## What the User Sees

On the web, the list page (`home.tsx`) fetches once on mount and when the filters change. The same store feeds the mobile list (`apps/mobile-client`), but mobile appends pages with `fetchMoreTodos` instead of replacing them.

## Tests

`todos.slices.test.ts` covers the reducers and thunks with a mocked `todosApi`, following the project conventions in `guide/testing.md`: `describe` blocks per thunk, then `describe('positive cases')` / `describe('negative cases')`, then `it('...')` for the behaviour. Optimistic behaviour is tested through `makeTodosStore`.

## When NOT to Use Redux

Not everything belongs in the store. Component-local state (dialog open/closed, form input while editing, a component's own loading indicator) stays in `useState` in the component. Put state in Redux only when it is shared between components, persisted, or needed by both clients.
