# Release and Deployment

The release process of the backend (versioning, the checklist, migrations, revisions) is described in [Release Management](https://github.com/prod-forge/backend/blob/main/docs/release-management.md). A web client is simpler in one respect and harder in another. There is no database and no running process to restart: a release is a set of static files. But the files are cached by browsers and by a CDN, so the order of the steps and the cache headers decide whether users see a working application. The infrastructure behind this chapter (buckets, CloudFront, the IAM role) is in [Frontend Deployment](https://github.com/prod-forge/terraform/blob/main/docs/frontend.md) in the Terraform guide.

**Status.** The pipeline described here is written and complete, but nothing is deployed. That is an owner decision for this reference repository, see [Why Not Deploy on Every Merge](#why-not-deploy-on-every-merge).

## Release Flow

A release is made from `main` with one command:

```shell
npm run release
```

The script is `tsx release/before-release.ts && npx release-it`. The first half shows a checklist (all changes committed, tasks closed, changelog will be generated, breaking changes documented) and asks for a typed `yes`. If any box is unchecked, the script exits with code 1 and release-it never starts.

Then `.release-it.json` takes over:

1. `before:init` runs `npm run lint`. A release does not start from a broken tree.
2. The git check requires a clean working directory and the `main` branch.
3. `@release-it/conventional-changelog` (preset `angular`) reads the commits since the last tag, decides the next version (`fix` is a patch, `feat` is a minor, a breaking change is a major) and writes `CHANGELOG.md`. This is why commit messages are validated by commitlint: the history is the input of the release. See [Development Workflow](development-workflow.md).
4. `@release-it/bumper` writes the new version into `apps/*/package.json`. `VITE_APP_VERSION` and the Sentry release name are read from the `web-client` one (`vite.config.ts`), so the version in the bundle, in Sentry and in the git tag is the same.
5. `after:bump` runs `npm run build`, which is `nx run-many -t build`. The web build needs `VITE_API_BASE_URL` (see [Configuration](configuration.md)), so a local release needs it in the shell or in an `.env` file, or the build guard stops the release.
6. release-it commits `chore(release): v<version>`, creates the annotated tag `v<version>`, pushes both and creates a GitHub release. `npm.publish` is `false`: the packages are internal.

The push of a tag that matches `v*` is what starts deployment. Nothing else does.

**Mobile.** `apps/*/package.json` includes `apps/mobile-client/package.json`, so its version is bumped. `app.json`, which Expo uses as the app version for the stores, is not touched by release-it. Releasing the mobile app is not covered, see [Mobile Client](mobile-client.md).

## What CD Does

`.github/workflows/cd.yml` is named "Release Frontend". It runs on `push` of tags `v*`, in the `prod` environment, on Node 24.21.0, and authenticates to AWS through OIDC (`id-token: write`, `role-to-assume: ${{ vars.AWS_DEPLOY_ROLE_ARN }}`, the `<project>-prod-github-frontend-role` from Terraform), so there are no long-lived AWS keys in GitHub. It first fails when a deploy variable (role, buckets, distribution id, CloudFront URL) is empty; they are filled from `terraform output`, see [Configuration](configuration.md#github-variables-and-secrets). The steps in order:

| Step                     | Command (short)                                             | Why it is in this place                                              |
| ------------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| Build                    | `npm run build:web-client`                                  | `VITE_*` values and the Sentry upload are part of the build          |
| Deploy assets            | `s3 sync ./assets` to the assets bucket, immutable cache    | media must exist before the new HTML that references it              |
| Deploy versioned archive | `s3 sync dist` to `releases/<tag>/`                         | an exact copy of this release, kept for rollback                     |
| Deploy to root           | `s3 sync dist` to the root, `--exclude "releases/*"`        | the active version; `--delete` removes files of the previous release |
| `index.html`             | `s3 cp` with `no-cache, no-store, must-revalidate`          | replaces the immutable header that the sync gave to `index.html`     |
| Invalidate CloudFront    | `create-invalidation --paths "/*"`                          | edges stop serving the old `index.html`                              |
| Cleanup old versions     | list `releases/`, `sort -V`, remove all but the last `KEEP` | the archive does not grow without bound                              |

Three details are worth knowing.

- **The switch is not atomic.** The root sync uploads the new files and, because of `--delete`, removes the old hashed files. It also uploads the new `index.html` with the immutable header, and the next `s3 cp` replaces it with the no-cache one within seconds. During that window, and until the invalidation finishes, a visitor can get an old `index.html` that points to chunks that are already gone. The failure is one failed chunk load, fixed by a page reload; the `ErrorBoundary` catches it. For a site with real traffic, upload without `--delete` and let the cleanup remove old hashed files later.
- **`KEEP`** is `${{ vars.KEEP || 10 }}`: a GitHub Variable, ten by default. It is the number of releases that can be rolled back to.
- **Build variables** come from GitHub Variables (`VITE_API_BASE_URL`, `VITE_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, and the CloudFront URL, which becomes `VITE_ASSETS_BASE_URL`) and one Secret (`SENTRY_AUTH_TOKEN`). The full table is in [Configuration](configuration.md#github-variables-and-secrets).

CD does not run lint or tests. It assumes the tagged commit already passed the checks (`npm run release` runs lint, and `npm run full-check` is the quality gate while CI is disabled, see [Testing Strategy](testing-strategy.md)). This is the weakest link of the pipeline: with `ci.yml` disabled, nothing in GitHub stops a tag from being created on an untested commit.

## Rollback

Rollback does not rebuild anything. The previous build already sits in `releases/<tag>/`; it only has to be put back at the root. Two manual workflows (`workflow_dispatch`) do it.

**`show-web-client-versions.yml`** ("Show Web Client Versions") lists the folders in `releases/`, newest first. Run it to see what can be rolled back to.

**`rollback.yml`** ("Rollback Frontend") takes one input, `version` (for example `v1.0.0`), and does:

1. Validates the input: it must match `^v[0-9]+\.[0-9]+\.[0-9]+$`, otherwise the job fails with `Invalid version` before any bucket path is built from it.
2. `aws s3 ls releases/<version>/`. If the folder does not exist, the job fails with `Version ... not found in releases`.
3. `s3 sync releases/<version>/` to the root with `--delete` and without `releases/*`.
4. `s3 cp` of that `index.html` to the root with the no-cache header.
5. CloudFront invalidation for `/*`.

An invalidation is eventually consistent, so some edges can serve the previous version for up to a minute (see the Terraform chapter). The Sentry release stays: errors reported by the restored version carry its own `VITE_APP_VERSION`, so they are not mixed with the failed release.

The same limits apply as for the backend: rollback is only as old as `KEEP`, and it restores the files, not the data. An API change that is incompatible with the old client is a separate problem, which is why backward-compatible API changes come first, as described in the backend release chapter.

## Why Not Deploy on Every Merge

A static site is cheap to deploy, so continuous deployment from `main` is a reasonable choice for many teams. This repository uses tags for three reasons:

- **A release is a decision.** A tag is a visible, named point (`v1.4.0`) that matches a changelog entry, a Sentry release and a rollback target. Every merge being a release would make 30 releases a day with no names.
- **The pipeline is shared with the backend model.** The backend also releases by tag. One mental model for both repositories is cheaper than two.
- **It is a reference, not a product.** The owner decided that nothing is deployed from this repository. `cd.yml` is correct and complete, but it is not triggered, and `ci.yml` is disabled for the reasons in [Testing Strategy](testing-strategy.md).

The trade-off is that a fix waits for someone to run `npm run release`. For a team that ships many times a day, move to deploy-on-merge to a staging environment and keep tags for production.

## Storybook Deployment

**Not done.** Storybook is the contract of the design system (see [Design System](design-system.md)), and it is only run locally. Publishing it would let designers and product people review a component without a setup. What it would take:

1. A job that runs `nx build-storybook ui-web` and uploads `storybook-static` to S3 under a prefix such as `storybook/` of the web-client bucket, or to a separate bucket.
2. A CloudFront path or distribution for it, with access control if the components should not be public.
3. A step in `cd.yml`, or a separate workflow that builds a preview per pull request, which is the more useful form for design review.
4. A link from the pull request template to the preview.

None of this changes the application deployment, which is why it was left out.
