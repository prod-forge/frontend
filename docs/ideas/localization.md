# Localization

## Problem

Both clients are English-only, and the strings are spread over several places: component and screen text in `packages/ui-web` and `apps/mobile-client/src/components/`, user messages in `packages/core` (the backend error code map, `NETWORK_ERROR_MESSAGES`, `UNKNOWN_EMAIL_MESSAGE`) and validation messages inside the Zod schemas (`todos.schemas.ts`, `auth.schemas.ts`). `index.html` has a fixed `lang="en"`. There is no way to add a second language without touching every one of these files.

## Direction

- One message catalog shared by web and mobile, the way the design tokens are: keys and English texts in a workspace package, translations next to them, types generated from the keys so a missing key fails the type check.
- `core` keeps returning codes, not texts: error codes from the backend and Zod issue codes are mapped to messages in the client, so `core` stays free of a translation library.
- A library that works on both React and React Native (for example `i18next` with `react-i18next`, or FormatJS); ICU plurals for counts such as "N of M completed".
- Locale choice: device or browser language with a manual switch, persisted through the existing `KeyValueStorage`; `lang` on `<html>` and dates and numbers through `Intl` with that locale.
- Checks: a test that every locale has every key, and a pseudo-locale in Storybook and visual tests to catch truncated or hard-coded text.
- Open questions: which second language proves it; whether the backend sends localized messages at all (see the backend idea `localization.md`) or only codes.
