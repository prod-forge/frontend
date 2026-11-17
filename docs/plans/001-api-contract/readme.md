**Status:** ⏸ hold · **Version:** 1.2.0 · **Date:** 2026-11-17 · **Modules:** core, test-data, web-client, mobile-client, docs

# 001 — API contract and test adapters

## Goal

Core ships in-memory adapters for its injected services, and every API response is parsed with a Zod schema at the
API client boundary, so a backend response of the wrong shape fails loudly where it enters the app. Design:
[00-design.md](./00-design.md).

## Plans

1. [01-test-adapters](./01-test-adapters/readme.md) — `core/testing`: memory storage, memory logger, test config.
2. [02-response-contract](./02-response-contract/readme.md) — response schemas, `apiRequest` with a schema,
   `ResponseShapeError`, fixtures checked against the schemas.

## Conclusions

_Written when the plan is done._
