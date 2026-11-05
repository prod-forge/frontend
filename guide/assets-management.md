# Assets Management

Most frontend projects bundle static media — icons, images, videos, audio — directly into the application build. This is convenient but has a real cost: replacing any asset requires a full rebuild and redeploy. For web applications this is an inconvenience. For mobile applications it is a much bigger problem, because a new release also means going through the app store review process.

The alternative is to treat media assets as infrastructure: store them on S3, deploy them independently from the application code, and have the app reference them by URL. The application ships once; the assets can change at any time without touching the build.

## When this matters

A designer wants to update an icon. With assets on S3, they upload the new file and the change is live immediately — no build, no deployment, no review cycle.

A seasonal banner needs to change. Swap the image on S3. Done.

An A/B test needs a different hero image for a subset of users. Upload both variants, toggle the URL in configuration.

The same principle extends beyond images. A JSON config file on S3 can hold feature flags, remote configuration, or localization strings. Changing product behavior or copy becomes a file upload rather than a software release. This is particularly valuable when the pace of business change is faster than the pace of software deployments.

## How it works

Assets live in a dedicated `assets/` directory at the root of the monorepo. On a release, the `Deploy assets` step of `.github/workflows/cd.yml` syncs this directory to the assets bucket, separately from the application build. The application references assets by their S3 URL rather than bundling them as imports.

```
assets/
  completed.svg
  todo.svg
```

Today it holds the two status icons of a todo item. `todo-item` builds the URL from the base URL and the status (`${VITE_ASSETS_BASE_URL}/todo.svg`). Folders such as `images/` or a `config/` JSON file would follow the same rule; they are examples, not part of this repository.

In production, the application fetches assets from S3 via CloudFront. The release workflow runs `aws s3 sync ./assets` with an immutable `Cache-Control` header; a manual upload to the bucket works for non-engineers, but a changed file under a cached name needs a new name or a CloudFront invalidation.

## Local development

In local development, a lightweight static server replicates the S3 behavior:

```bash
npm run dev:assets   # serves assets/ at http://localhost:4000
```

The application reads the base URL from `VITE_ASSETS_BASE_URL` at build time. In development `.env.example` points it to `http://localhost:4000`. In the release build `cd.yml` sets it to `<CLOUDFRONT_URL>/assets`, the CloudFront distribution. Storybook serves the same folder from its own origin and sets the variable to an empty string. No code changes are needed between environments.

## What belongs in assets

Not everything should be externalized. The rule is straightforward: if an asset is referenced by content or configuration, it belongs on S3. If it is tightly coupled to a specific component or UI state, it belongs in the bundle.

Good candidates for S3: marketing images, banners, illustrations, icons that a designer might update, localization files, remote configuration, feature flags.

Poor candidates: component-level SVG icons used in code, loading spinners, error state illustrations tied to specific error codes. The status icons above are on S3 on purpose, as the example of an asset a designer can replace without a release.
