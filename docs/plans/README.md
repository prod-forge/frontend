# Plans

What is being implemented now. A plan contains sub-plans and tasks, their priorities, an overall status and a status per task, and the version it ships in. Before writing a plan, read [goal.md](../goal.md), [architecture/](../architecture/) and [restrictions/](../restrictions/). No plan is open at the moment.

## File name

`<version>-<topic>.md`, for example `1.1.0-notifications.md`. A sub-plan adds a suffix: `1.1.0-notifications-mobile.md`.

## Template

```markdown
# <Title>

Version: <target version>
Status: <todo | in progress (N/M tasks done) | done>

## Goal

<One or two sentences: what the user gets.>

## Tasks

| #   | Task   | Priority | Status |
| --- | ------ | -------- | ------ |
| 1   | <task> | P0       | todo   |

## Sub-plans

- `<version>-<topic>-<part>.md`: <what it covers>.

## Notes

- Restrictions, hacks or open issues the plan depends on, with links.
```

Priorities: P0 (required for the version), P1, P2. Task statuses: `todo`, `in work`, `done`.
