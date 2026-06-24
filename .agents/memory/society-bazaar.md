---
name: Society Bazaar architecture
description: Key decisions for the Society Bazaar home-business marketplace app — auth, DB, routing, approval workflow.
---

## Auth
- Replit-managed Clerk. Configure via Auth pane in workspace toolbar — NO external Clerk dashboard.
- `@clerk/express` on the API server; `@clerk/react` + `@clerk/themes` (shadcn theme) on the frontend.
- Clerk proxy middleware (`clerkProxyMiddleware.ts`) is bypassed in development (`NODE_ENV !== 'production'`). Do NOT set `VITE_CLERK_PROXY_URL` locally.
- For production, `VITE_CLERK_PROXY_URL` must be `https://<domain>/api/__clerk`.

**Why:** Replit-managed Clerk runs as a dev instance locally; proxy is only needed for production custom domains.

## Admin access
- `ADMIN_USER_IDS` env var (comma-separated Clerk user IDs) controls `requireAdmin` middleware.
- If the env var is empty, ALL authenticated users can access admin routes (dev convenience).

**How to apply:** Set `ADMIN_USER_IDS` in secrets before going to production.

## Business approval workflow
- All new businesses start with `status: "pending"`.
- Admin approves/rejects from `/admin` → PATCH `/api/admin/businesses/:id/status`.
- Home page only shows `status = 'approved'` businesses.

## DB seeding
- Societies must be seeded manually (no migration seed file yet). Use the inline node snippet in replit.md or run the DB push script. Five default societies: Sunshine Residency, Green Valley Apartments, Lake View Towers, Silver Heights, Palm Residency.

## Frontend API client
- `artifacts/society-bazaar/src/lib/api.ts` is the typed API client — all fetch calls go here with `credentials: "include"`.

## Tailwind + Clerk CSS layers
- `@layer theme, base, clerk, components, utilities;` must appear BEFORE `@import "tailwindcss"` in `index.css`.
- Vite config: `tailwindcss({ optimize: false })` (disables lightningcss which breaks Clerk @layer imports).
