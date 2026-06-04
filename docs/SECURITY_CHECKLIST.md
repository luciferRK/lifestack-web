# Security Checklist (Frontend)

Checklist for `lifestack-web` release hardening.

## Auth and Session UX
- [ ] Protected routes redirect unauthenticated users.
- [ ] Login/logout transitions clear stale UI state.
- [ ] Frontend does not persist auth tokens in localStorage/sessionStorage.

## API Interaction Safety
- [ ] Client handles `401/403/404/409/422` consistently with user-safe messaging.
- [ ] No sensitive backend error internals shown directly in UI.
- [ ] Mutation flows invalidate dependent queries after success.

## Input and Form Safety
- [ ] Date, amount, and enum inputs are validated client-side before submit.
- [ ] Recurring/todo/capture forms reject obviously invalid values.
- [ ] UI defaults avoid ambiguous module routing where explicit intent is available.

## Dependency and Build Hygiene
- [x] `npm audit --audit-level=high` is available as `npm run security:audit` and runs in CI.
- [x] React Router dependency is patched past the high-severity advisory range found during Gate 0 hardening.
- [ ] Build warnings tracked (notably large chunks) and code-splitting backlog maintained.
- [ ] Environment-specific variables are read from env files, not hardcoded.

## Verification Log (2026-06-04)
- Gate 0 dependency audit checks passed:
  - `npm run security:audit` (0 vulnerabilities)
  - `npm run lint` (0 errors; existing coverage-report warnings only)
  - `npm run build`

## Verification Log (2026-05-28)
- Smoke checks passed:
  - `npm run test -- --run` (25 tests)
  - `npm run build`
