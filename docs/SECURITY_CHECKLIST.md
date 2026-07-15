# Security Checklist (Frontend)

Checklist for `lifestack-web` release hardening.

## Auth and Session UX

- [x] Protected routes redirect unauthenticated users.
- [x] Login/logout transitions clear stale UI state.
- [x] Frontend does not persist auth tokens in localStorage/sessionStorage.

## API Interaction Safety

- [x] Client handles `401/403/404/409/422` consistently with user-safe messaging.
- [x] No sensitive backend error internals shown directly in UI.
- [x] Mutation flows invalidate dependent queries after success.
- [x] Cookie-authenticated mutations mirror the readable `csrf_token` cookie into `X-CSRF-Token`.

## Verification Log (2026-06-04)

- Gate 0 CSRF client checks passed:
  - `npm run test -- src/services/api.test.ts --run`
  - `npm run lint` (0 errors; existing coverage-report warnings only)
  - `npm run build`

## Input and Form Safety

- [x] Date, amount, and enum inputs are validated client-side before submit.
- [x] Recurring/todo/capture forms reject obviously invalid values.
- [x] UI defaults avoid ambiguous module routing where explicit intent is available.

## Dependency and Build Hygiene

- [x] `npm audit --audit-level=high` is available as `npm run security:audit` and runs in CI.
- [x] Build warnings tracked (notably large chunks) and code-splitting backlog maintained.
- [x] Environment-specific variables are read from env files, not hardcoded.

## Verification Log (2026-06-04)

- Gate 0 dependency audit checks passed:
  - `npm run security:audit` (0 vulnerabilities)
  - `npm run lint` (0 errors; existing coverage-report warnings only)
  - `npm run build`
  - React Router dependency patched past the high-severity advisory range found during Gate 0 hardening.

## Verification Log (2026-05-28)

- Smoke checks passed:
  - `npm run test -- --run` (25 tests)
  - `npm run build`
