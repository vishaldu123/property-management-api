# Architecture

This document describes the high-level architecture of the Property Management platform.
It is intended for engineers who are onboarding or making structural changes.

## Overview

The system is a multi-tenant property management SaaS composed of two deployable units:

| Unit       | Stack                                             | Responsibility                          |
| ---------- | ------------------------------------------------- | --------------------------------------- |
| `api`      | Node.js, TypeScript, Express, Prisma, PostgreSQL  | REST API, business logic, persistence   |
| `frontend` | React 19, TypeScript, Vite, TanStack Query        | Single-page application (SPA)            |

```
┌────────────┐        HTTPS         ┌────────────┐      SQL       ┌────────────┐
│  Browser   │ ───────────────────▶ │   API      │ ─────────────▶ │ PostgreSQL │
│  (SPA)     │ ◀─────────────────── │  (Express) │ ◀───────────── │            │
└────────────┘   JSON (envelope)    └────────────┘                └────────────┘
```

## Backend architecture

The backend follows a layered (clean-ish) architecture with clear separation of concerns:

```
routes ──▶ controllers ──▶ services ──▶ repositories ──▶ Prisma ──▶ PostgreSQL
                │               │
             validators      shared/core (context, pagination, filtering, response)
```

- **Routes** (`src/routes`) — Express routers, wire HTTP verbs to controllers and attach
  middleware (auth, RBAC, rate limiting, validation).
- **Controllers** (`src/controllers`) — translate HTTP requests to service calls and shape
  the response envelope. No business logic.
- **Services** (`src/services`) — business rules, orchestration, transactions.
- **Repositories** (`src/repositories`) — data access via Prisma; extend a shared
  `BaseRepository` for common CRUD and pagination.
- **Middleware** (`src/middleware`) — auth (JWT), authorization (RBAC), CORS, Helmet,
  rate limiting, brute-force protection, error handling.
- **Shared core** (`src/shared`) — cross-cutting utilities: request context, pagination
  DTOs, filter builder, standard API response, exceptions, logger.

### Cross-cutting concerns

- **AuthN**: JWT access + refresh tokens. Access tokens are short-lived; refresh tokens
  rotate on use.
- **AuthZ**: Role-Based Access Control enforced by middleware and re-checked in the UI.
- **Multi-tenancy**: Requests are scoped to an organization via request context.
- **Validation**: Zod schemas per module (`src/validators`).
- **Errors**: Centralised `errorHandler` middleware returns a consistent error envelope.
- **Logging**: Winston-based structured logging with configurable `LOG_LEVEL`.
- **Security headers**: Helmet, CORS allow-list, rate limiting, brute-force lockout.

## Frontend architecture

The SPA is organised by **feature module** rather than by technical type:

```
src/
  app/            # bootstrap: providers, router, error boundary, global styles
  features/       # domain modules (property, unit, tenant, lease, payment,
                  #   maintenance, reports, administration, dashboard)
  pages/          # top-level routed pages (auth, home, dashboard, errors)
  shared/         # cross-feature components, hooks, services, utils
  types/          # global type definitions
  utils/          # low-level utilities (validation, cn, token)
```

Each feature module typically contains: `components/`, `hooks/`, `services/`,
`utils/`, `types.ts`, `constants.ts`, and `__tests__/`.

### Data flow

- **Server state** is managed by **TanStack Query**. Query hooks live inside feature
  modules or `shared/hooks`. Global defaults (`src/app/index.tsx`) set a 5-minute
  `staleTime`, disable refetch-on-focus, and skip retries for 4xx responses.
- **Auth state** is provided by `AuthProvider` (`src/app/providers`).
- **Client-only preferences** (theme, density, saved report filters, notification
  toggles) are persisted to `localStorage` via dedicated hooks/utilities.

### Routing & code splitting

Routing is centralised in `src/app/routes/index.tsx`. Every page is **lazy-loaded**
via `React.lazy` and rendered inside `Suspense`, so the initial bundle only contains
the shell. Vendor libraries (React, Radix UI, TanStack Query, forms, Recharts) are
split into dedicated chunks in `vite.config.ts`.

### API client

`src/shared/services/api-client.ts` wraps Axios with:

- request interceptor injecting the bearer token,
- response interceptor unwrapping the standard API envelope,
- automatic 401 handling with single-flight refresh-token rotation and request queueing,
- redirect to `/login` when refresh fails.

## Response envelope

All API responses share a consistent envelope, unwrapped by the client so components
receive plain data:

```json
{ "success": true, "data": { }, "message": "..." }
```

Errors use the same shape with `success: false` and an error `message`/`code`.

## Testing

- **Backend**: Jest (unit, service, controller, middleware, and E2E). A global setup
  resets a dedicated test database via Prisma migrations.
- **Frontend**: Vitest + Testing Library (unit, component, integration).

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md). The stack ships as two Docker images plus a
PostgreSQL container, orchestrated by `docker-compose.yml`.
