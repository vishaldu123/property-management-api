# Property Management API

## Project Overview
This repository contains a Node.js/TypeScript backend for a multi-tenant property management system.
The backend is built with Express, Prisma ORM, PostgreSQL, and supports multi-tenant organization management, properties, units, tenants, leases, payments, maintenance, accounting, and audit logging.

## What’s Implemented

### Core domain and multi-tenancy
- `Organization` and `OrganizationUser` models for multi-tenant membership
- `User` authentication and JWT-based login/register flows
- Role-based access structure via `Role`, `Permission`, `RolePermission`
- Core property management models:
  - `Property`
  - `Unit`
  - `Tenant`
  - `Lease`

### Accounting & finance
- `Payment` model with provider metadata
- `Invoice` and `InvoiceLineItem` models
- `Expense` model
- `LedgerAccount` and `LedgerEntry` models
- `TransactionStatus` and `PaymentMethod` support

### Maintenance
- `MaintenanceRequest`
- `MaintenanceAssignment`
- `MaintenanceStatus` and `MaintenancePriority`

### Audit and traceability
- `AuditLog` model captures actor, action, resource, before/after state, and metadata

### Payment gateway support
- Adapters for multiple gateways:
  - Razorpay
  - Cashfree
- Provider router in `src/services/payments/payment.service.ts`
- Payment initiation flow in controller and route layer
- Webhook support for verifying provider callbacks

### CI / Developer tooling
- GitHub Actions workflow under `.github/workflows/ci.yml`
- `npm run lint`, `npm test`, `npm run test:coverage`
- `npx prisma studio` support for browsing DB

## How to Run Locally

### Prerequisites
- Node.js 18+ / 20
- PostgreSQL running locally
- `npm` package manager

### Environment
Create a `.env` file with:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/property_management
JWT_SECRET=your_jwt_secret
```

### Install dependencies

```bash
npm install
```

### Generate Prisma client

```bash
npx prisma generate
```

### Run migrations

```bash
npx prisma migrate dev
```

### Start the API

```bash
npm run dev
```

### Open Prisma Studio

```bash
npx prisma studio
```

## Test and Validation

### Run tests

```bash
npm test
```

### Run coverage

```bash
npm run test:coverage
```

### Lint / TypeScript check

```bash
npm run lint
```

## What to Test Manually

### Authentication
- Register a new user
- Log in with valid credentials
- Verify JWT token is returned

### Organization / membership
- Create a new organization through the register flow
- Verify `OrganizationUser` membership records are created

### Property management
- Create property and unit records
- Create tenant records
- Create lease records for a unit and tenant

### Payment flow
- Initiate a payment by provider key (razorpay / cashfree)
- Verify the service routes to the correct adapter
- Simulate provider webhook payloads

### Accounting and invoices
- Create invoices for leases / tenants
- Create expenses and ledger accounts
- Verify payment records link to invoices

### Maintenance
- Create maintenance requests
- Assign requests to users
- Track status changes from requested to completed

## Remaining Work and Known Gaps

### Incomplete or low coverage areas
- Controllers are present but not fully covered by tests
- Payment adapter integration tests are partially implemented
- Webhook endpoint tests are missing
- RBAC enforcement is present in the schema but not fully implemented in middleware/routes

### Additional recommended work
- Add end-to-end tests for critical flows (`auth`, `payments`, `leases`, `maintenance`)
- Harden validation and error handling in controllers
- Add admin/role permission enforcement to routes
- Add API documentation (Swagger / OpenAPI)
- Enable production-safe deployment steps in CI (Docker/ECS/Heroku)
- Restore stricter Jest coverage thresholds after expanding test coverage

## Notes for Developers

- Prisma schema is located at `prisma/schema.prisma`
- Generated client lives in `node_modules/@prisma/client`
- Server entrypoint is `src/server.ts`
- Controllers live in `src/controllers/`
- Routes are in `src/routes/`
- Payment gateway adapters are in `src/services/payments/`
- Prisma client configuration is in `src/config/prisma.ts`

## Useful Commands

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma studio
npm run dev
npm test
npm run test:coverage
npm run lint
```

If you want, I can also add a separate `HUMAN_TESTING.md` file with step-by-step test cases and expected results.