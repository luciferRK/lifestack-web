# Spec 005: Installable Lifestack PWA

**Status:** Implemented
**Approved:** 2026-06-20

## Scope

1. Set the browser and installed-application title to `Lifestack`.
2. Publish a standards-compliant web application manifest.
3. Provide 192px and 512px application icons, including a maskable icon.
4. Register an auto-updating service worker in production builds.
5. Cache the application shell and static assets for resilient startup.
6. Use standalone display mode and preserve normal authenticated API behavior.

## Manifest Contract

- `name`: `Lifestack`
- `short_name`: `Lifestack`
- `display`: `standalone`
- `start_url`: `/`
- dark theme and background colors matching the current UI
- portrait and landscape layouts remain supported

## Service Worker Contract

- Copied into the production build from the frontend's versioned public assets.
- Updates activate without requiring users to manually clear browser storage.
- Navigation requests fall back to the application shell.
- API calls are not served from a stale cache.

## Acceptance Criteria

- Browser title is exactly `Lifestack`.
- Production build emits a manifest and service worker.
- Manifest contains install icons at 192px and 512px.
- Existing unit tests, lint, and production build remain green.
