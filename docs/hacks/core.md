# Core hacks

## `void` as the thunk argument type

- **What:** `createAsyncThunk<AuthUser | null, void, { state: RootState }>` with `// eslint-disable-next-line @typescript-eslint/no-invalid-void-type`.
- **Where:** `packages/core/src/features/auth/auth.thunks.ts` (`hydrateAuth`).
- **Why:** `void` is RTK's convention for a thunk dispatched without an argument, `dispatch(hydrateAuth())` (comment in the file).
- **If cleaned up:** removing the disable fails lint; keep `void` and the disable together.

## `nextOffset` instead of `items.length`

- **What:** `fetchTodos` and `fetchMoreTodos` set `nextOffset` to `offset + data.length`; callers pass `nextOffset` as the next offset; a fulfilled delete decrements it, because re-reading one item (deduped) is safer than skipping one (comment in the file).
- **Where:** `packages/core/src/features/todos/todos.slices.ts`; described in `docs/architecture/api.md`.
- **Why:** optimistic inserts are in `items` but not yet at a known server position.
- **If cleaned up:** using `items.length` skips or repeats todos on the next page after an optimistic insert.

## register logs an existing user in

- **What:** the `register` thunk calls login and keeps the name in the client only.
- **Where:** `packages/core/src/features/auth/auth.thunks.ts`; described in `docs/architecture/api.md`.
- **Why:** the backend has no sign-up endpoint.
- **If cleaned up:** a call to a sign-up endpoint fails, because the backend does not have one.
