# Society Bazaar

A marketplace for home-based businesses in Indian apartment societies — residents can discover and contact local sellers (tiffin, bakery, tutors, yoga, tailors, beauty), and sellers can list their business with a Clerk-authenticated seller dashboard and WhatsApp lead tracking.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (`artifacts/api-server`)
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Auth: Replit-managed Clerk (`@clerk/express` on server, `@clerk/react` on frontend)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Frontend: React + Vite (`artifacts/society-bazaar`)

## Where things live

- `lib/db/src/schema/` — DB schema (societies, businesses, reviews, leads tables)
- `artifacts/api-server/src/routes/` — Express API routes (societies, businesses, leads, reviews, admin)
- `artifacts/api-server/src/middlewares/` — requireAuth, requireAdmin, clerkProxyMiddleware
- `artifacts/society-bazaar/src/lib/api.ts` — Typed frontend API client
- `artifacts/society-bazaar/src/pages/` — All UI pages

## Architecture decisions

- Auth is Replit-managed Clerk (no external dashboard — configure via Auth pane in workspace)
- Admin access controlled by `ADMIN_USER_IDS` env var (comma-separated Clerk user IDs)
- All businesses start with `pending` status; admin must approve/reject from `/admin`
- WhatsApp clicks tracked as leads in DB (businessId + optional clerkUserId + source)
- Clerk proxy middleware only activates in production — dev uses Clerk FAPI directly

## Product

- **Home** (`/`) — browse approved businesses, filter by society, track WhatsApp leads
- **Business Detail** (`/business/:id`) — full listing with reviews and sidebar CTA
- **List Business** (`/sell`) — authenticated form to submit a business (starts pending)
- **Seller Dashboard** (`/dashboard`) — authenticated; see own businesses, stats, status
- **Admin Dashboard** (`/admin`) — approve/reject businesses; protected by `ADMIN_USER_IDS`
- **Sign In / Sign Up** (`/sign-in`, `/sign-up`) — Clerk-hosted auth pages

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any DB schema change, run `pnpm --filter @workspace/db run push` (dev) or apply migration (prod)
- Clerk proxy is NOT active in development — do not set `VITE_CLERK_PROXY_URL` locally
- For production deploy, set `VITE_CLERK_PROXY_URL=https://<domain>/api/__clerk` in env
- API routes are prefixed with `/api` (e.g., `/api/societies`, `/api/businesses`)
- `ADMIN_USER_IDS` env var must be set (comma-separated Clerk user IDs) to restrict admin access
- Seed command: run `lib/db/seed.ts` or use the node snippet in admin docs to insert societies

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
