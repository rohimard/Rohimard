# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Pulpo** — an MVP web app for ecommerce order management. It unifies orders from
multiple sales channels (Shopify, WooCommerce, Amazon, Mercado Libre, Instagram)
into a single inbox and layers on proactive tracking, returns management, and a
rule-based automation engine. It is a functional demo with realistic seed data
and local file persistence — no external services, auth, or real channel
connectors.

> Note: this Git repository contains several unrelated projects on separate
> branches. `claude/ecommerce-order-weakpoints-*` is the Pulpo app documented
> here and is the repository's default branch. Other branches hold different apps.

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server at http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm run lint       # next lint
```

- **No test framework** is configured — there are no tests to run.
- `npm run seed` is defined in `package.json` but is **broken**: it points at
  `scripts/reseed.mjs`, which does not exist, and requires `tsx`, which is not a
  dependency. To reset demo data, use the reset endpoint instead:
  `curl -X POST http://localhost:3000/api/reset` (calls `resetDb()`).

## Conventions

- **Language is Spanish.** All UI copy, code comments, and — critically — the
  **domain vocabulary** are in Spanish. Order statuses, return statuses,
  channels, and carriers are Spanish (or brand) string literals used directly as
  TypeScript discriminated-union types (e.g. `"pendiente"`, `"en_transito"`,
  `"reembolsada"`). These literals are the wire format, the persisted format, and
  the type — changing one requires updating the union in `lib/types.ts`, every
  `switch`/map that enumerates it, and any seed/persisted data. Keep them exact.
- **Path alias:** `@/*` maps to the repository root (see `tsconfig.json`). Import
  as `@/lib/db`, `@/components/badges`, etc.
- TypeScript `strict` mode is on. Next.js 14 App Router with `reactStrictMode`.
- Money is EUR; `Order.total` is computed from items.

## Architecture

Next.js 14 (App Router) + TypeScript + Tailwind. The whole app is a thin UI over
an in-process domain model. Understanding it means understanding two things: how
state lives, and how mutations flow.

### State: a single in-memory JSON database

`lib/db.ts` is the entire persistence layer. The `Database` object (orders,
returns, automations — see `lib/types.ts`) is cached as a **singleton on
`globalThis.__pulpoDb`** and mirrored to `.data/db.json` on disk.

- `getDb()` lazily loads from disk (or seeds via `buildSeed()` in `lib/seed.ts`
  on first run / corrupt file) and returns the shared object.
- `saveDb(db)` updates the singleton and writes to disk. Writes silently fall
  back to memory-only in read-only environments (e.g. during build).
- `resetDb()` re-seeds and saves.

Because the DB is a mutable shared object, **read paths mutate it in place** and
then call `saveDb`. There is no ORM, migrations, or transactions.

### Mutation flow: pages read, API routes write

- **Pages** (`app/**/page.tsx`) are Server Components that call `getDb()`
  directly to render. They set `export const dynamic = "force-dynamic"` so each
  request reflects the current singleton state rather than a cached render.
- **Client components** (`components/*.tsx` with `"use client"`, e.g.
  `OrderActions`, `ReturnActions`, `AutomationToggle`) never mutate state
  locally. They `POST` to an API route and then trigger a refresh.
- **API routes** (`app/api/**/route.ts`) are the only writers. Each one:
  `getDb()` → find entity by id (404 if missing) → mutate via a `lib/` function
  → `saveDb(db)` → return JSON. This is the pattern to follow for any new
  mutation; keep business logic in `lib/`, not in the route.

### Domain logic lives in `lib/`

- `lib/types.ts` — the domain model. `Order` is the central entity; it carries a
  `timeline` of `TrackingEvent`s and `flags` applied by automations.
- `lib/orderFlow.ts` — the order lifecycle. `NEXT` maps each status to its single
  next "happy-path" status. `advanceOrder(order, rules)` advances the status,
  auto-assigns a carrier + tracking number on first ship, appends a timeline
  event, **then runs the automation engine**, and returns what was applied.
  `notifyCustomer()` records a proactive customer notification.
- `lib/automations.ts` — the rule engine. Each `AutomationRule` is a
  `when` (field/op/value condition over an order) → `then` (assign_carrier /
  add_flag / notify_customer / set_status) pair. `applyAutomations(order, rules)`
  mutates the order for every enabled matching rule and increments each rule's
  `timesTriggered`. It is invoked from `advanceOrder`, so advancing an order is
  what triggers automations.
- `lib/metrics.ts` — `computeMetrics(db)` derives all dashboard KPIs (revenue,
  incidents, proactive-tracking rate, per-channel/per-status breakdowns) purely
  from the DB. `sortByRecent()` sorts orders newest-first.
- `lib/format.ts` — Spanish display formatters and label maps (`eur`,
  `haceCuanto`, `canalLabel`, `estadoLabel`, …) used across pages/components.

### Routes at a glance

- `app/page.tsx` — dashboard (KPIs, incidents, channel split, recent orders).
- `app/pedidos/` — unified order inbox (filter by channel/status/query) + order
  detail with timeline and actions.
- `app/devoluciones/` — returns management.
- `app/automatizaciones/` — enable/disable automation rules.
- `app/api/orders/[id]/advance` — advance order status (runs automations).
- `app/api/orders/[id]/notify` — send a proactive customer notification.
- `app/api/returns/[id]` — set return status.
- `app/api/automations/[id]` — toggle a rule's `enabled`.
- `app/api/reset` — reset to seed data.

## Deployment

Zero-config deploy to Vercel (see `DEPLOY.md`). Note that file persistence
(`.data/db.json`) is ephemeral on serverless hosts — the in-memory singleton
resets between cold starts, which is acceptable for the demo.
