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
- Explicit return types are required for exported functions (ESLint warns on missing ones).
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

| Content   | Pattern               | Example                  |
| --------- | --------------------- | ------------------------ |
| Component | `{name}.tsx`          | `login-form.tsx`         |
| Hook      | `use-{name}.ts`       | `use-theme.ts`           |
| Slice     | `{name}.slices.ts`    | `todos.slices.ts`        |
| Selectors | `{name}.selectors.ts` | `todos.selectors.ts`     |
| API       | `{name}.api.ts`       | `todos.api.ts`           |
| Types     | `{name}.types.ts`     | `todos.types.ts`         |
| Schemas   | `{name}.schemas.ts`   | `auth.schemas.ts`        |
| Utils     | `{name}.utils.ts`     | `todos.utils.ts`         |
| Constants | `{name}.constants.ts` | `todos.constants.ts`     |
| Unit test | `{name}.test.ts(x)`   | `login-form.test.tsx`    |
| Story     | `{name}.stories.tsx`  | `login-form.stories.tsx` |

Each component lives in its own folder with the same name as the file:

```
button/
  button.tsx
  button.test.tsx
  button.stories.tsx
```

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

When a component extends an HTML element, use `extends`:

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
  theme: 'light' | 'dark';
  toggle: () => void;
};

export function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
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
export const deleteTodo = createAsyncThunk<string, string>('todos/delete', (id) => {
  return todosApi.delete(id).then(() => id);
});
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
- API modules export plain objects with typed methods (`todosApi`, `authApi`).
- API modules live in `core` — never import fetch or make HTTP calls from components.
- Error handling is centralized: `ApiError`, `BackendError`, `NetworkError` are thrown from the client and caught by the Redux error middleware.

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

1. `type` imports from external packages
2. Value imports from external packages
3. `type` imports from internal packages (`@prod-forge-todolist-frontend/*`)
4. Value imports from internal packages
5. Relative imports

```ts
import type { ReactNode } from 'react';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import type { LoginValues } from '@prod-forge-todolist-frontend/core';

import { loginSchema } from '@prod-forge-todolist-frontend/core';

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

- Shared mocks (Sentry, logger) are configured in `vitest.setup.ts` — do not repeat them in individual test files.
- `beforeEach` resets state (localStorage, mocks). `afterEach` calls `cleanup()` and `vi.restoreAllMocks()`.
- Render helpers are defined per test file as a typed function (e.g., `renderHome(options)`).
- Use `userEvent.setup()` for simulating user interactions, not `fireEvent`.

**Assertions:**

- Prefer role-based queries (`getByRole`, `findAllByRole`) over `getByTestId`.
- Avoid snapshot tests for behavioral assertions.
- Run only the affected test file when possible — do not run the full suite for isolated changes.

---

## Reviewer Checklist

Use this when reviewing a pull request. Items marked with ⚙️ are enforced by CI — flag them only if CI is not yet
passing.

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

### Imports

- [ ] Import order follows the convention: external types → external values → internal types → internal values →
      relative ⚙️
- [ ] No unused imports ⚙️

### Tests

- [ ] New logic has corresponding tests
- [ ] Negative cases come before positive cases
- [ ] Negative and positive cases are in separate `describe` blocks
- [ ] Test names describe behavior, not implementation
- [ ] `userEvent.setup()` is used for interactions, not `fireEvent`
- [ ] Queries prefer roles (`getByRole`, `findAllByRole`) over `getByTestId`
- [ ] No `.only` left in test files ⚙️
