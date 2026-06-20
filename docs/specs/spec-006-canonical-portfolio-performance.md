# Spec 006: Canonical Portfolio Performance UI

**Status:** Implemented
**Approved:** 2026-06-20

## Scope

- Dashboard and Investing render the same backend portfolio performance contract.
- Portfolio value represents holdings market value and excludes investment-account cash.
- Investing shows current value, invested cost basis, total gain/loss, daily change, and cash.
- Dashboard shows the same current value with invested and gain/loss context, daily movement,
  valuation date/status, and separate cash.
- Positive values include a plus sign, negative values retain a minus sign, and unavailable
  comparisons render `N/A`.

## Acceptance Criteria

- Identical canonical portfolio values appear on Dashboard and Investing.
- Cash never appears as investment profit.
- Missing prior snapshots, prices, FX, or reporting currency do not render as zero performance.
- Unit and E2E tests cover positive, negative, unavailable, and cross-page consistency states.
