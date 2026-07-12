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
- ✅ 5 missing routes populated: `/leads`, `/templates`, `/automation`, `/portal`, `/projects/[id]` — all with working UI (`/invoices` and `/agreements` still absent)
- ✅ 51 dead interactive elements wired (tables, toggles, buttons, cards, settings, portal, proposals, invoices)
- ✅ Tasks page rewired (inline add, toggle, delete, filter tabs, empty states, count)
- ✅ Accessibility: `aria-hidden` on 36 Material Symbols, `aria-label` on nav/search/sync/notifications, skip-to-content, `:focus-visible` (2px blue ring), `.sr-only`
- ✅ Design tokens: all 21 Stitch CSS vars on `:root`
- ✅ ErrorBoundary wrapping all pages with retry button
- ✅ fetchWithRetry() — 2 retries, exponential backoff, 10s timeout
- ✅ IndexedDB: DB_VERSION=3, 9 object stores, sync queue
- ✅ Clients: paginated 25/page, debounced search
- ✅ Performance: FCP 212ms, LCP 528ms, CLS 0, TTFB 137ms, client JS 790 KB
- ✅ Routes under `(app)/` group with shared layout
- ✅ Loading skeletons, route prefetching, memoized nav/sidebar
- ✅ `.env.local` has OAuth client ID/secret + AUTH_SECRET + SHEETS_ID only (no service account)

### All Done
- ✅ middleware → proxy.ts (Next.js 16)
- ✅ Zod validation + rate limiting on API routes
- ✅ Command palette (Cmd+K) + undo stack (Ctrl+Z)
- ✅ Unit tests with Vitest (4/4 passing)
- ✅ Stripe/Razorpay — won't do, not needed
- ✅ Item 6 migration: existing `$5000` stripped to `5000` (migrateAmounts())
- ✅ Item 2: Backup-to-Sheets via API route + UI in workspace settings
