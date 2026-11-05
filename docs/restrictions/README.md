# Restrictions

Constraints of this project. Each entry gives the rule, the reason and where it is enforced. Read these before writing a plan.

- [ci-cd.md](ci-cd.md) — CI is disabled on purpose, nothing is deployed.
- [dependencies.md](dependencies.md) — one React version, no root overrides, no `--legacy-peer-deps`.
- [platform.md](platform.md) — platform-neutral core, mobile on iOS and Android only.
- [repository.md](repository.md) — English, commit messages, generated and protected files.
