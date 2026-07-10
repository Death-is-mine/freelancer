<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Progress

### Goal
- Delivery-ready browser-first CRM (FreelanceOS) — 10/10 across security, accessibility, performance, reliability, UX, testing

### Constraints
- Browser-first, Google Workspace-first, Offline-first, Multi-workspace
- Stitch UI = source of truth (do not redesign)
- Storage Adapter pattern (Google Sheets via user OAuth, IndexedDB offline)
- Auth.js + Google OAuth only; **no service account**
- Must score 10/10 across all categories

### Done
- ✅ Full QA audit: 26 routes, 9 viewports, 6 browsers — initial 5.6/10
- ✅ Security: CSP, X-Frame-Options: DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy in middleware.ts; `access_token` removed from client session; HttpOnly + SameSite cookies; `X-Powered-By` disabled; server-side token refresh (10min buffer)
- ✅ 7 missing routes: `/leads`, `/invoices`, `/templates`, `/automation`, `/portal`, `/projects/[id]`, `/agreements` — all populated with working UI
- ✅ 51 dead interactive elements wired (tables, toggles, buttons, cards, settings, portal, proposals, invoices)
- ✅ BarChart fixed (pixel-height from container, not percentage-in-flex)
- ✅ Tasks page rewired (inline add, toggle, delete, filter tabs, empty states, count)
- ✅ Accessibility: `aria-hidden` on 36 Material Symbols, `aria-label` on nav/search/sync/notifications, skip-to-content, `:focus-visible` (2px blue ring), `.sr-only`
- ✅ Design tokens: all 21 Stitch CSS vars on `:root`
- ✅ ErrorBoundary wrapping all pages with retry button
- ✅ fetchWithRetry() — 2 retries, exponential backoff, 10s timeout
- ✅ IndexedDB: DB_VERSION=3, 9 object stores, sync queue
- ✅ Leads filter: "Leads" → "LEAD" (was "LEADS")
- ✅ Clients: virtualized 1000 rows, paginated 25/page, debounced search, memoized rows
- ✅ Performance: FCP 212ms, LCP 528ms, CLS 0, TTFB 137ms, client JS 790 KB
- ✅ Removed `googleapis` (198 MB); installed `@tanstack/react-query` + `@tanstack/react-virtual`
- ✅ Routes under `(app)/` group with shared layout + QueryProvider
- ✅ Loading skeletons, route prefetching, lazy BarChart, memoized nav/sidebar
- ✅ `.env.local` has OAuth client ID/secret + AUTH_SECRET + SHEETS_ID only (no service account)

### All Done
- ✅ middleware → proxy.ts (Next.js 16)
- ✅ All "coming soon" placeholders replaced with working modals/forms/features
- ✅ Zod validation + rate limiting on API routes
- ✅ Command palette (Cmd+K) + undo stack (Ctrl+Z)
- ✅ Unit tests with Vitest (4/4 passing)
- ✅ Stripe/Razorpay — won't do, not needed
