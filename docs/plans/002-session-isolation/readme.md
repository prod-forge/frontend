**Status:** ✅ approved · **Version:** 1.1.1 · **Date:** 2026-11-17 · **Modules:** core, web-client, mobile-client, docs

# 002 — Session isolation on the client

## Goal

When user A logs out and user B logs in on the same device, B never sees A's todos: not in the list, the summary, a
detail page, or a response to a request A started before logging out. Client counterpart of the backend
`002-ownership-tests`. Design: [00-design.md](./00-design.md).

## Plans

1. [01-account-switch](./01-account-switch/readme.md) — drop responses that belong to an ended session; unit and web
   e2e tests for an account switch.

## Conclusions

_Written when the plan is done._
