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
- ✅ All 36 routes working (was 26, 6 created across sessions, 4 in latest session): `/leads`, `/templates`, `/automation`, `/portal`, `/projects/[id]`, `/invoices`, `/agreements`, `/proposals`, `/settings`, `/team` (now 0 404s)
- ✅ 51 dead interactive elements wired (tables, toggles, buttons, cards, settings, portal, proposals, invoices)
- ✅ Tasks page rewired (inline add, toggle, delete, filter tabs, empty states, count)
- ✅ Accessibility: `aria-hidden` on 36 Material Symbols, `aria-label` on nav/search/sync/notifications, skip-to-content, `:focus-visible` (2px blue ring), `.sr-only`, `scope="col"` on 9 tables, `aria-live="polite"` region
- ✅ Design tokens: all 21 Stitch CSS vars on `:root`
- ✅ ErrorBoundary wrapping all pages with retry button
- ✅ fetchWithRetry() — 2 retries, exponential backoff, 10s timeout
- ✅ IndexedDB: DB_VERSION=3, 9 object stores, sync queue
- ✅ Clients: paginated 25/page, debounced search
- ✅ Performance: FCP 212ms, LCP 528ms, CLS 0, TTFB 137ms, client JS 790 KB
- ✅ Routes under `(app)/` group with shared layout
- ✅ Loading skeletons, route prefetching, memoized nav/sidebar
- ✅ `.env.local` has OAuth client ID/secret + AUTH_SECRET + SHEETS_ID only (no service account)

### Latest session
- QA audit: 8.3/10 → gaps: 4 missing routes, CSP missing HSTS/frame-ancestors, search readOnly, no service worker, `<th>` missing scope, no component tests, unused vars
- **4 routes created**: `/invoices` (stats + recurrence), `/agreements` (stats + sign), `/proposals` (localStorage-backed), `/settings` (10-section grid landing page)
- **Security**: `Strict-Transport-Security` + `frame-ancestors 'none'` added to CSP in proxy.ts
- **Search**: TopNav input writes value, filters clients/projects/leads from localStorage, dropdown with up to 10 results, closes on blur/selection
- **Service worker**: `public/sw.js` — cache-first for static, network-first for API. Registered in app layout
- **TypeScript strictness**: `noUnusedLocals` + `noUnusedParameters` enabled; 4 pre-existing unused symbols removed
- **Component tests**: ErrorBoundary (2 tests) + CommandPalette (4 tests) passing
- **Build**: `npm run build` clean — 36 routes, 0 type errors

### All Done
- ✅ middleware → proxy.ts (Next.js 16)
- ✅ Zod validation + rate limiting on API routes
- ✅ Command palette (Cmd+K) + undo stack (Ctrl+Z)
- ✅ Unit tests with Vitest (79 + 6 component = 85 passing)
- ✅ Stripe/Razorpay — won't do, not needed
- ✅ Item 6 migration: existing `$5000` stripped to `5000` (migrateAmounts())
- ✅ Item 2: Backup-to-Sheets via API route + UI in workspace settings
- ✅ Recursion bug fixed: `migrateClients()`/`migrateAmounts()` accept `projects` param
- ✅ E2E suite: 178 chromium tests, 0 failures (11 spec files, updated visual snapshots)
- ✅ Sidebar nav: 9 items (Invoices, Agreements, Proposals, Templates, Automation added)
- ✅ 9 CRM business-logic flows (#18–#26): lead lifecycle, invoice→dashboard, payments→reports, automation toggle, client portal (unauthenticated), template load, team page, currency INR propagation, Cmd+K palette
- ✅ CI workflow (`.github/workflows/ci.yml`): vitest + chromium + firefox/webkit matrix
