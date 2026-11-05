# Code Style Review

A reference for contributors. Covers conventions enforced by tooling and conventions that are followed by agreement.

---

## Formatting

Enforced by Prettier. Non-negotiable — run `npm run format` before committing.

```
singleQuote: true
trailingComma: all
semi: true
printWidth: 120
useTabs: false
endOfLine: lf
```

---

## TypeScript

- Strict mode is enabled across all packages.
- Avoid `any`. Use `unknown` when the type is genuinely unknown and narrow it explicitly.
- Prefer `type` over `interface`.
- Prefer `readonly` where mutation is not needed.
- Explicit return types are required on functions (`@typescript-eslint/explicit-function-return-type`).
- Avoid unnecessary generics. Only parameterize when the type parameter is actually useful.

```ts
// correct
export function formatDate(date: Date): string { ... }

// incorrect — missing return type
export function formatDate(date: Date) { ... }
```

---

## File Naming

All files and folders in `src/` use `kebab-case`. Enforced by `eslint-plugin-check-file`.

| Content   | Pattern                 | Example                  |
| --------- | ----------------------- | ------------------------ |
| Component | `{name}.tsx`            | `login-form.tsx`         |
| Hook      | `use-{name}.ts`         | `use-theme.ts`           |
| Slice     | `{name}.slices.ts`      | `todos.slices.ts`        |
| Selectors | `{name}.selectors.ts`   | `todos.selectors.ts`     |
| API       | `{name}.api.ts`         | `todos.api.ts`           |
| Types     | `{name}.types.ts`       | `todos.types.ts`         |
| Schemas   | `{name}.schemas.ts`     | `auth.schemas.ts`        |
| Utils     | `{name}.utils.ts`       | `todos.utils.ts`         |
| Constants | `{name}.constants.ts`   | `todos.constants.ts`     |
| Unit test | `{name}.test.ts(x)`     | `login-form.test.tsx`    |
| Story     | `{name}.stories.tsx`    | `login-form.stories.tsx` |
| A11y spec | `{name}.a11y-spec.ts`   | `button.a11y-spec.ts`    |
| Visual    | `{name}.visual-spec.ts` | `button.visual-spec.ts`  |

Each component lives in its own folder with the same name as the file:

```
button/
  button.tsx
  button.test.tsx
  button.stories.tsx
  button.a11y-spec.ts
  button.visual-spec.ts
```

In `packages/ui-web`, every component and widget folder has these five files: the a11y and visual specs run against each story, so a new story adds a line to both.

---

## Exports

Default exports are forbidden (`eslint-plugin-import-lite`). Always use named exports.

```ts
// correct
export const Button = (...): ReactNode => { ... };

// incorrect
export default function Button() { ... }
```

---

## React Components

- Functional components only.
- Return type is always `ReactNode`.
- Props are defined as a `type` named `Props` in the same file.
- `displayName` is set on every exported component.
- Components do not contain other component definitions.

```tsx
type Props = {
  label: string;
  disabled?: boolean;
};

export const Input = ({ label, disabled = false }: Props): ReactNode => (
  <input aria-label={label} disabled={disabled} />
);

Input.displayName = 'Input';
```

When a component wraps an HTML element, intersect its attributes with the own props:

```tsx
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>;
  variant?: 'primary' | 'secondary';
};
```

---

## Custom Hooks

- Named with the `use` prefix.
- Export the return type explicitly.
- Keep side effects inside `useEffect`, not at the top level of the hook.
- Avoid returning arrays — return objects with named properties.

```ts
type UseThemeReturn = {
  theme: Theme;
  toggle: () => void;
};

export function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  ...
  return { theme, toggle };
}
```

---

## Redux / RTK

**Slices** — each feature has its own slice file (`{name}.slices.ts`):

- Use `createSlice` for synchronous reducers.
- Use `createAsyncThunk` for async operations.
- `extraReducers` handles async thunk lifecycle (`pending`, `fulfilled`, `rejected`).
- Optimistic updates are applied in `pending` and rolled back in `rejected`.

```ts
export const deleteTodo = createAsyncThunk<string, string, { rejectValue: { silent: boolean } }>(
  'todos/delete',
  async (id, { rejectWithValue }) => {
    if (id.startsWith(TEMP_ID_PREFIX)) {
      return rejectWithValue({ silent: true });
    }

    await todosApi.delete(id);

    return id;
  },
  { serializeError: serializeApiError },
);
```

**Selectors** — each feature has its own selectors file (`{name}.selectors.ts`):

- Use `createSelector` for derived state.
- Always start from a root selector that returns the feature slice.

```ts
const selectTodosState = (state: RootState): RootState['todos'] => state.todos;

export const selectItems = createSelector(selectTodosState, (s) => s.items);
export const selectStatus = createSelector(selectTodosState, (s) => s.status);
```

**Typed hooks** — never use raw `useDispatch` or `useSelector` in components:

```ts
// apps/web-client/src/hooks/redux/redux.ts
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## API Layer

- All HTTP calls go through `apiRequest` in `core/src/api/client.ts`.
- API modules export plain objects with typed methods (`todosApi`).
- API modules live in `core` — never import fetch or make HTTP calls from components.
- Error handling is centralized: `ApiError`, `BackendError`, `NetworkError` are thrown from the client and caught by the Redux error middleware.
- Thunks that call the API keep the HTTP status (`serializeError: serializeApiError`, or rethrow it from a `rejectWithValue` thunk): the error middleware needs it to skip 4xx, and the auth listener ends the session on a 401.

```ts
export const todosApi = {
  getAll: (filters: TodoFilters): Promise<TodosResponse> => {
    const params = new URLSearchParams({ ... });
    return apiRequest<TodosResponse>(`todos?${params.toString()}`);
  },
  create: (data: CreatePayload): Promise<Todo> =>
    apiRequest<{ data: Todo }>('todos', { body: JSON.stringify(data), method: 'POST' }).then((r) => r.data),
};
```

---

## Styling

Tailwind CSS v4 with design tokens from `packages/design-tokens`.

- No inline `style` attributes.
- Use `cn()` (classnames) when class names are conditional.
- Variant/size mappings use `Record<Variant, string>` — not inline ternaries.
- Token-based color names (`bg-brand`, `text-fg`, `border-line`, etc.) instead of raw Tailwind palette classes.

```tsx
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-brand-fg hover:bg-brand-hover',
  secondary: 'border border-line bg-card text-fg hover:border-fg-muted',
  danger: 'bg-err text-white hover:opacity-90',
  ghost: 'bg-transparent text-fg-soft hover:bg-page-soft',
};

<button className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}>
```

---

## Import Order

Enforced by `eslint-plugin-perfectionist`. Order within a file:

1. `type` imports from packages (external and `@prod-forge-todolist-frontend/*`), sorted naturally by path
2. Value imports from packages (external and `@prod-forge-todolist-frontend/*`), sorted naturally by path
3. Relative imports

The workspace scope is treated like any other package, so `@prod-forge-todolist-frontend/core` sorts among the externals.

```ts
import type { LoginValues } from '@prod-forge-todolist-frontend/core';
import type { ReactNode } from 'react';

import { loginSchema } from '@prod-forge-todolist-frontend/core';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '../button/button';
import { Input } from '../input/input';
```

---

## Tests

Testing stack: Vitest + React Testing Library + `@testing-library/user-event`.

**Structure:**

- Negative cases come first, inside their own `describe('negative cases')` block.
- Positive cases follow, inside `describe('positive cases')`.
- Separate the two blocks with a blank line.
- Test names are full sentences that describe behavior, not implementation.

```ts
describe('useTheme', () => {
  describe('negative cases', () => {
    it('falls back to light when localStorage contains an invalid value', () => { ... });
  });

  describe('positive cases', () => {
    it('reads the saved theme from localStorage on initial render', () => { ... });
    it('toggle flips from light to dark and persists to localStorage', () => { ... });
  });
});
```

**Setup:**

- Shared mocks are configured in each project's `vitest.setup.ts` (in `apps/web-client`: Sentry and the logger) — do not repeat them in individual test files; a test that needs a different mock overrides it with its own `vi.mock` and says why.
- `vitest.setup.ts` also calls `cleanup()` and `vi.clearAllMocks()` after each test; a test file resets its own state (localStorage, spies) in `beforeEach` / `afterEach`.
- Render helpers are defined per test file as a typed function (e.g., `renderHome(options)`).
- Use `userEvent.setup()` for simulating user interactions, not `fireEvent`.

**Assertions:**

- Prefer role-based queries (`getByRole`, `findAllByRole`) over `getByTestId`.
- Avoid snapshot tests for behavioral assertions.
- Run only the affected test file when possible — do not run the full suite for isolated changes.

---

## Reviewer Checklist

Use this when reviewing a pull request. Items marked with ⚙️ are enforced by lint and the git hooks (CI is disabled, see
[Code Quality](guide/code-quality.md#layer-5-continuous-integration)) — flag them only if `npm run lint` is not
clean.

### General

- [ ] The change solves the stated problem and nothing more
- [ ] No unrelated refactoring or formatting changes are included
- [ ] No `TODO`, `FIXME`, or debug artifacts left in the code
- [ ] No `console.log` or other logging left in production code ⚙️

### TypeScript

- [ ] No `any` — use `unknown` and narrow explicitly if needed ⚙️
- [ ] Exported functions have explicit return types ⚙️
- [ ] `type` is used instead of `interface` where there is no reason to extend
- [ ] No unnecessary generics

### Files & Exports

- [ ] File and folder names are `kebab-case` ⚙️
- [ ] No default exports ⚙️
- [ ] Each component lives in its own folder with a matching file name
- [ ] A `ui-web` component or widget has all five files (`.tsx`, `.test.tsx`, `.stories.tsx`, `.a11y-spec.ts`, `.visual-spec.ts`), and a new story is listed in both specs
- [ ] New files follow the naming pattern for their role (`.slices.ts`, `.selectors.ts`, `.api.ts`, etc.)

### React Components

- [ ] Functional component, returns `ReactNode`
- [ ] Props defined as a `type Props` in the same file
- [ ] `displayName` is set
- [ ] No component definitions inside another component
- [ ] No inline `style` attributes — Tailwind classes only
- [ ] Conditional classes use `cn()`, not string concatenation
- [ ] Variant/size maps use `Record<Variant, string>`, not inline ternaries

### Hooks

- [ ] Named with `use` prefix
- [ ] Return type is explicit and uses an object (not an array) for multiple values
- [ ] Side effects are inside `useEffect`, not at the top level

### Redux / RTK

- [ ] Async operations use `createAsyncThunk`
- [ ] Components use `useAppDispatch` and `useAppSelector`, not raw hooks
- [ ] Derived state is computed in selectors with `createSelector`, not inside components
- [ ] New selectors are in the feature's `.selectors.ts` file

### API Layer

- [ ] No `fetch` calls outside `core/src/api/`
- [ ] New endpoints are added to the relevant `*.api.ts` module
- [ ] No API calls inside JSX or directly inside components
- [ ] A new authenticated thunk lets a 401 reach the auth listener with its `status` (no swallowed `rejectWithValue`)

### Imports

- [ ] Import order follows the convention: package types → package values → relative ⚙️
- [ ] No unused imports ⚙️

### Tests

- [ ] New logic has corresponding tests
- [ ] Negative cases come before positive cases
- [ ] Negative and positive cases are in separate `describe` blocks
- [ ] Test names describe behavior, not implementation
- [ ] `userEvent.setup()` is used for interactions, not `fireEvent`
- [ ] Queries prefer roles (`getByRole`, `findAllByRole`) over `getByTestId`
- [ ] No `.only` left in test files ⚙️
