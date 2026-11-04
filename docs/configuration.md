# Configuration

## GitHub Variables and Secrets

The CD workflow (`.github/workflows/cd.yml`) reads its configuration from the `prod` environment. The build step fails without `VITE_API_BASE_URL`, so a bundle never ships with an empty API URL.

| Name                         | Kind     | Consumer | Example                                                     |
| ---------------------------- | -------- | -------- | ----------------------------------------------------------- |
| `VITE_API_BASE_URL`          | variable | build    | `https://api.example.com/api/v1/` (trailing slash required) |
| `CLOUDFRONT_URL`             | variable | build    | `https://d111111abcdef8.cloudfront.net`                     |
| `VITE_SENTRY_DSN`            | variable | build    | `https://key@o0.ingest.sentry.io/0`                         |
| `SENTRY_ORG`                 | variable | build    | `my-org`                                                    |
| `SENTRY_PROJECT`             | variable | build    | `prod-forge-web`                                            |
| `SENTRY_AUTH_TOKEN`          | secret   | build    | `sntrys_...`                                                |
| `USER_ID`                    | variable | deploy   | `123456789012` (AWS account ID)                             |
| `S3_WEB_CLIENT_BUCKET`       | variable | deploy   | `my-web-client-bucket`                                      |
| `S3_ASSETS_BUCKET`           | variable | deploy   | `my-assets-bucket`                                          |
| `CLOUDFRONT_DISTRIBUTION_ID` | secret   | deploy   | `E1ABCDEFGHIJKL`                                            |
| `KEEP`                       | variable | deploy   | `10` (releases kept in S3, default 10)                      |
