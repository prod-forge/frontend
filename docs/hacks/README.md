# Hacks

Every place where the code takes a shortcut or makes a non-obvious decision, and why. Without this list an agent "cleans up" exactly the code that must stay as it is. Before removing an `eslint-disable`, an override or an odd import order, check here.

- [web-client.md](web-client.md) — lazy route pages, console loggers.
- [mobile-client.md](mobile-client.md) — entry import order, crypto polyfill, Metro config, expo-router route files, test location.
- [core.md](core.md) — `void` thunk argument, `nextOffset`, register without a sign-up endpoint.
- [tooling.md](tooling.md) — ESLint config exceptions and test-only lint disables.

## Format

```markdown
## <Short name>

- **What:** the shortcut or decision.
- **Where:** file path(s).
- **Why:** the reason.
- **If cleaned up:** what breaks when someone "fixes" it.
```
