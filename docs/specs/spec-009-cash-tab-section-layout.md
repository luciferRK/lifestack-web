# Spec-009: Cash Tab Section Layout (bounded sections, consistent pagination)

**Created:** 2026-07-11
**Status:** Approved 2026-07-11 (owner: uniform pagination) — in progress
**Scope:** `lifestack-web` only — one web PR. No API changes: cash-balances and dividends are already server-paginated with an account filter; transfers pages client-side (see Details).
**Depends on:** spec-073 web UI (the Dividends section this fixes the reachability of).

---

## Problem

The Investing → Cash tab stacks three sections vertically — Cash Balances, Transfers, Dividends/Income — and renders each as an unbounded list (the queries fetch `limit=200` and display everything). Consequences:

1. **Unbounded page height.** A realistic account history (every order, transfer, and dividend appends a cash-balance row) makes the Cash Balances section alone hundreds of rows.
2. **The newest feature is the least reachable.** Dividends/Income (spec-073) sits at the bottom; reaching it means scrolling past everything else.
3. **Inconsistent with the rest of the app.** The Orders tab pages its list at 10 rows via the shared `Pagination` component; the Cash tab ignores the same server-side pagination it already receives.

## Goal

Every section on the Cash tab is **bounded to roughly one screen**, follows **one consistent pattern**, and no section's reachability depends on another section's data volume.

## Solution

### Pattern (applies uniformly to all three sections)

Each section becomes a consistent card with:

- **Header row**: title + total count badge (from the paginated response's `total`), plus the section's actions (Add balance / Record transfer / Record dividend / Bulk import).
- **Body**: the existing table/card list, but fed one server-side page at a time — **page size 10**, using the shared `Pagination` component exactly as the Orders tab does (`total`/`limit`/`offset`).
- **No collapsing, no popups.** Bounded pages keep every section header visible within a couple of screens, so section reachability no longer needs collapse state or modal detours; this is also the pattern the Orders tab already set.

### Section order (reachability fix)

Reorder to put actionable content before read-only context:

1. Cash Balances (primary content of the tab)
2. Dividends / Income (actionable, new)
3. Transfers (read-only context here; full CRUD lives in Spending) — header gains a **"Full history in Spending →"** link.

### Details

- Pagination state per section is independent (`useState` offset, like `ordersOffset`), reset to page 0 when the account/currency filter changes — a filter change on page 3 must never show an empty page.
- The dividends query drops `limit=200` for `(10, offset)`; same for cash balances and transfers.
- Transfers: `/finance/transfers` has no server-side `account_id` filter and this spec is web-only, so the section keeps its client-side account filter and pages **client-side** over the fetched window (filter first, then slice) — correct composition, acceptable for a read-only contextual list that links out to full history.
- Mobile card lists and desktop tables page together (one offset per section).

## Now vs. Proposed

| Aspect | Now | Proposed |
|---|---|---|
| Cash balances list | up to 200 rows rendered | 10/page + Pagination |
| Transfers list | up to 200 rows, client-filtered | 10/page (client-side over the fetched window), link to full history |
| Dividends list | up to 200 rows | 10/page + Pagination |
| Reaching Dividends | scroll past everything | ≤ 2 screens regardless of data volume |
| Consistency | Orders paginated, Cash tab not | one pattern everywhere |

## Testing & evidence

- Component tests: each section renders `Pagination` with the server `total`; page change refetches with the new offset; filter change resets offset to 0.
- Existing CashTab/DividendsSection tests updated for the new query signatures.
- `tsc -b`, `vite build`, lint, full vitest suite, coverage gate (70%) respected.

## Open question (for approval)

1. **Confirm the pattern**: uniform pagination at 10/page with section reorder (recommended), vs. collapsible sections (Orders-tab corporate-actions style), vs. "5 recent + View all dialog".
