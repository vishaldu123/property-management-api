# Deployment Guide

This guide covers building and running the Property Management platform in a
production-like environment.

## Components

| Service | Image                     | Port (host) | Notes                          |
| ------- | ------------------------- | ----------- | ------------------------------ |
| db      | `postgres:16-alpine`      | 5432        | Persistent volume `db-data`    |
| api     | built from root `Dockerfile` | 5000     | Express API, runs migrations   |
| web     | built from `frontend/Dockerfile` | 8080 | React SPA served by nginx      |

## Prerequisites

- Docker 24+ and Docker Compose v2
- A PostgreSQL database (the compose file provides one)
- Secrets for JWT, email, and payment providers

## Quick start (Docker Compose)

1. Copy and edit environment variables:

   ```bash
   cp .env.example .env
   # Edit .env: set JWT_SECRET, DATABASE credentials, CORS_ORIGIN, provider keys
   ```

2. Build and start the full stack:

   ```bash
   docker compose up --build
   ```

3. The services will be available at:
   - Frontend: <http://localhost:8080>
   - API: <http://localhost:5000/api/v1>
   - Health: <http://localhost:5000/health>

The `api` service runs `prisma migrate deploy` on start, so the schema is applied
automatically before the server boots.

## Environment variables

### Backend (`.env`)

| Variable                     | Required | Description                                        |
| ---------------------------- | -------- | -------------------------------------------------- |
| `NODE_ENV`                   | yes      | `production` in deployed environments              |
| `PORT`                       | no       | Defaults to `5000`                                 |
| `DATABASE_URL`               | yes      | PostgreSQL connection string                       |
| `JWT_SECRET`                 | yes      | **Change from the default.** Signing secret        |
| `JWT_EXPIRES_IN`             | no       | Access token lifetime (e.g. `8h`)                  |
| `JWT_REFRESH_EXPIRES_IN`     | no       | Refresh token lifetime (e.g. `7d`)                 |
| `CORS_ORIGIN`                | yes      | Comma-separated allow-list of frontend origins     |
| `CORS_CREDENTIALS`           | no       | `true` to allow credentialed requests              |
| `BCRYPT_ROUNDS`              | no       | Password hashing cost (default `12`)               |
| `RATE_LIMIT_*`               | no       | API rate limiting windows/limits                   |
| `AUTH_RATE_LIMIT_*`          | no       | Stricter limits for auth endpoints                 |
| `BRUTE_FORCE_*`              | no       | Login lockout thresholds                           |
| `FRONTEND_URL`               | yes      | Used for links in emails                           |
| `EMAIL_PROVIDER` / keys      | no       | Email delivery configuration                       |
| `PAYMENT_PROVIDER` / keys    | no       | Payment gateway configuration                      |

### Frontend (build args / `.env`)

| Variable              | Description                               |
| --------------------- | ----------------------------------------- |
| `VITE_API_URL`        | Base URL of the API (e.g. `https://api.example.com`) |
| `VITE_API_BASE_PATH`  | API path prefix (default `/api/v1`)       |
| `VITE_APP_NAME`       | Display name                              |

> Frontend variables are baked in **at build time**. Rebuild the `web` image when they change.

## Building images individually

```bash
# Backend
docker build -t property-management-api:latest .

# Frontend (pass the API URL used by the browser)
docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  -t property-management-web:latest ./frontend
```

## Database migrations

```bash
# Apply pending migrations (production)
npx prisma migrate deploy

# Generate the client after schema changes
npx prisma generate
```

The `api` container runs `prisma migrate deploy` automatically on startup.

## Health checks

| Endpoint          | Purpose                                   |
| ----------------- | ----------------------------------------- |
| `/health/live`    | Liveness — process is up                  |
| `/health/ready`   | Readiness — dependencies (DB) reachable   |
| `/health`         | Basic health summary                      |
| `/health/detailed`| Detailed component status                 |

Both Dockerfiles define `HEALTHCHECK` directives (API → `/health/live`, web → `/`).

## Production checklist

- [ ] `JWT_SECRET` set to a strong, unique value
- [ ] `DATABASE_URL` points to a managed/backed-up PostgreSQL instance
- [ ] `CORS_ORIGIN` restricted to known frontend origins (no `*`)
- [ ] `NODE_ENV=production`
- [ ] TLS terminated at a load balancer / reverse proxy
- [ ] Rate limiting and brute-force thresholds reviewed
- [ ] Email and payment provider keys configured
- [ ] Log aggregation configured (`LOG_LEVEL=info` or `warn`)
- [ ] Database migrations applied (`prisma migrate deploy`)
- [ ] Backups and monitoring in place

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main` and `develop`:

- **backend-lint-and-test** — type-check, tests (with a Postgres service), build
- **frontend-lint-and-test** — type-check, lint, format check, tests with coverage, build
- **deploy** — builds both apps on `main` (deployment steps are templated/commented)

Both test jobs run on Node 20.x and 22.x.
