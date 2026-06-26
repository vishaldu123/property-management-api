# Property Management API

## Project Overview

This repository contains a production-ready Node.js/TypeScript backend for a multi-tenant property management SaaS platform. Built with Express, Prisma ORM, and PostgreSQL, it provides enterprise-grade authentication, authorization, multi-tenancy, and organization management.

### Current Phase: Sprint 4 - Enterprise RBAC + Sprint UI-1 - Frontend Foundation

**Completed Phases - Backend:**
- ✅ Phase 0: Project Structure & Setup
- ✅ Phase 1: Authentication & Multi-Tenancy Foundation
- ✅ Phase 2.1-2.6: Shared Infrastructure & Hardening
- ✅ Phase 2.8: Platform Readiness (Authorization Framework, API Versioning, OpenAPI/Swagger, Health Checks)
- ✅ Phase 3: Organization Domain Implementation (Settings, Branding, Preferences)
- ✅ Phase 4: Enterprise RBAC (Role-Based Access Control)
- ✅ Phase 5: Property Domain Implementation (CRUD, Search, Filtering, Pagination, Statistics)

**Completed Phases - Frontend:**
- ✅ Sprint UI-1: Enterprise React Foundation (React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui)

**Upcoming:**
- Phase 6: Unit, Tenant, Lease, Payment modules (backend & frontend)

## Key Features

### 🔐 Authentication & Security
- JWT token-based authentication (8h expiry)
- Refresh token rotation (7d expiry)
- Bcrypt password hashing (12 rounds)
- Brute force protection (5 attempts → 30min lockout)
- Multi-tier rate limiting (general, auth-specific, password-reset)
- Helmet security headers (CSP, HSTS, X-Frame-Options, etc.)
- Environment-aware CORS policy
- Zod-based input validation

### 🏗️ Multi-Tenant Architecture
- Organization-level data isolation
- User organization memberships
- Organization soft-delete with restore
- Organization-ownership verification middleware

### 🎨 Organization Domain (Sprint 3)
- **Organization Settings**: Configure timezone, currency, date/time formats, language, and measurement units per organization
- **Organization Branding**: Customize colors, logos, favicon, theme, and CSS for each organization
- **Organization Preferences**: Manage email notifications, communication digest frequency, 2FA settings, data retention, and backup frequency

### � Enterprise RBAC - Role-Based Access Control (Sprint 4)
A complete, production-ready RBAC system with granular permission management:

#### Permission System
- **Flexible Permission Model**: Resource:action format (e.g., `property:read`, `lease:create`, `payment:approve`)
- **Permission Management**: Create, read, update, delete permissions with descriptions
- **Search & Pagination**: Query permissions with filters and sorting
- **Audit Trail**: Track permission creation and modifications

#### Role System
- **Custom Role Creation**: Define roles tailored to organization needs
- **Permission Assignment**: Assign multiple permissions to roles flexibly
- **Role Templates**: Clone system roles to quickly create custom roles
- **System Roles** (8 predefined):
  - `super_admin`: Full platform access (all permissions)
  - `organization_owner`: Organization-level owner with all org permissions
  - `organization_admin`: Admin capabilities within organization
  - `property_manager`: Property and unit management
  - `accountant`: Payment and financial operations
  - `maintenance_manager`: Maintenance request and issue tracking
  - `staff`: Limited operational access
  - `read_only`: View-only access across modules

#### User Role Assignment
- **Flexible Assignment**: Assign multiple roles to a user per organization
- **Permission Aggregation**: Permissions are inherited from all assigned roles (union)
- **Role Replacement**: Replace all roles for a user in a transaction
- **Audit Tracking**: Track who assigned/removed roles and when

#### Authorization Features
- **Role-Based Checks**: Middleware to verify user has required roles
- **Permission-Based Checks**: Middleware to verify user has required permissions
- **Single/Multiple Permissions**: Check for any or all required permissions
- **Organization Scope**: All RBAC operations scoped to organization
- **Soft Deletes**: Roles and permissions use soft delete pattern

#### API Endpoints (25+ endpoints)
- Permission Management: `/api/v1/rbac/permissions` (CRUD + list/search)
- Role Management: `/api/v1/rbac/roles` (CRUD + list/search + clone)
- Role Permissions: `/api/v1/rbac/roles/:roleId/permissions` (assign/remove single and bulk)
- User Roles: `/api/v1/rbac/users/roles` (assign/remove/replace)
- User Permissions: `/api/v1/rbac/users/:userId/permissions` (get aggregated)

#### Default Permission Matrix

| Category | Permissions |
|----------|-------------|
| **RBAC Management** | `rbac:read_role`, `rbac:create_role`, `rbac:update_role`, `rbac:delete_role`, `rbac:read_permission`, `rbac:create_permission`, `rbac:update_permission`, `rbac:delete_permission`, `rbac:assign_permission`, `rbac:remove_permission`, `rbac:assign_role`, `rbac:remove_role` |
| **Organization** | `organization:read`, `organization:update`, `organization:read_settings`, `organization:update_settings`, `organization:read_branding`, `organization:update_branding`, `organization:read_preferences`, `organization:update_preferences` |
| **User Management** | `user:read`, `user:create`, `user:update`, `user:delete` |
| **Reserved** | `system:admin` |

### �🔑 Authorization Framework
- Role-based authorization middleware (`requireRole`)
- Permission-based authorization middleware (`requirePermission`)
- Organization ownership verification (`requireOrganizationOwnership`)
- Resource ownership verification (`requireResourceOwnership`)
- Middleware composition helpers (`requireAll`, `optionalAuthorization`)

### 📡 API Versioning & Documentation
- RESTful API with `/api/v1` versioning
- Complete OpenAPI 3.0 specification
- Interactive Swagger UI at `/api-docs`
- OpenAPI JSON endpoint at `/openapi.json`
- Ready for future versions (v2, v3, etc.)

### 🏥 Health & Diagnostics
- Liveness probe: `/health/live` (process running check)
- Readiness probe: `/health/ready` (database connectivity check)
- Detailed health: `/health/detailed` (memory, uptime, version info)
- Kubernetes-ready health check configuration

### 📊 Shared Infrastructure
- Centralized API response formatter with consistent error handling
- Global error handler (prevents stack trace leakage)
- Structured JSON logging for audit trails
- Request ID tracing for debugging
- Pagination & filtering framework
- Custom exception classes
- Base repository pattern for CRUD operations

### 🏠 Property Domain (Sprint 5)
Complete property management system with comprehensive CRUD operations, advanced filtering, search, and statistics:

#### Core Features
- **Full CRUD Operations**: Create, retrieve, update, delete, and restore properties
- **Soft Delete & Restore**: All deleted properties remain recoverable
- **Property Types**: Apartment, Villa, Commercial, Office, Retail, Warehouse, Mixed Use, Land
- **Property Status**: Draft, Active, Inactive, Archived
- **Geographic Data**: Full address, coordinates (latitude/longitude), timezone support
- **Metadata**: Total units, year built, notes, audit fields (createdBy, updatedBy)

#### Search & Filtering
- **Full-Text Search**: Search by property name, code, city, or country
- **Status Filtering**: Filter by property status (Draft, Active, Inactive, Archived)
- **Type Filtering**: Filter by property type (8 types supported)
- **Geographic Filtering**: Filter by country
- **Sorting**: Sort by creation date, name, status, or property type (ascending/descending)

#### Pagination & Performance
- **Cursor-based Pagination**: Efficient pagination with configurable page size (1-100 items)
- **Metadata**: Total count, total pages, has next/previous indicators
- **Optimized Queries**: Database indexes on organizationId, status, type, location, dates

#### API Endpoints
- `POST /api/v1/properties` - Create property
- `GET /api/v1/properties` - List properties (with filters, search, pagination)
- `GET /api/v1/properties/stats` - Get organization property statistics
- `GET /api/v1/properties/:id` - Get property by ID
- `PUT /api/v1/properties/:id` - Update property
- `DELETE /api/v1/properties/:id` - Soft delete property
- `PATCH /api/v1/properties/:id/restore` - Restore deleted property

#### Request Example
```bash
# Create a property
curl -X POST http://localhost:5000/api/v1/properties \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Office",
    "code": "DT-OFFICE-001",
    "propertyType": "Commercial",
    "status": "Active",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "totalUnits": 150,
    "yearBuilt": 2020
  }'

# List properties with filters
curl "http://localhost:5000/api/v1/properties?page=1&limit=20&status=Active&country=USA&search=Downtown" \
  -H "Authorization: Bearer <token>"
```

#### Response Format
```json
{
  "success": true,
  "message": "Properties retrieved",
  "data": [
    {
      "id": "uuid",
      "organizationId": "uuid",
      "name": "Downtown Office",
      "code": "DT-OFFICE-001",
      "propertyType": "Commercial",
      "status": "Active",
      "address": "123 Main St",
      "city": "New York",
      "country": "USA",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "totalUnits": 150,
      "yearBuilt": 2020,
      "createdAt": "2026-06-26T18:00:00Z",
      "createdBy": "user-id"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### ✅ Testing
- Comprehensive end-to-end tests (100+ passing tests)
- Unit tests for shared infrastructure
- Authorization middleware test coverage
- Jest with database reset between tests
- Meaningful coverage thresholds (60% lines, 60% functions, 50% branches)

### 🚀 DevOps Ready
- GitHub Actions CI/CD pipeline
- Multi-Node.js version testing (18.x, 20.x)
- TypeScript strict mode enforcement
- Docker multi-stage build with health checks
- Non-root user execution
- Kubernetes probe configuration

## Quick Start

### Prerequisites
- Node.js 18+ or 20+
- PostgreSQL 15+
- npm or yarn

### 1. Clone and Install

```bash
git clone <repository-url>
cd property-management-api
npm install
```

### 2. Environment Setup

```bash
# Copy template
cp .env.example .env

# Edit with your configuration
# DATABASE_URL, JWT_SECRET, etc.
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run generate

# Run migrations
npx prisma migrate dev
```

### 4. Start Development Server

```bash
npm run dev
```

Server will be available at `http://localhost:5000`

## Frontend Setup

### React 19 Frontend (Sprint UI-1)

A modern enterprise React frontend with TypeScript, Vite, and Tailwind CSS.

**Frontend Location:** `./frontend`

#### Prerequisites
- Node.js 18+ or npm 9+
- Backend API running on `http://localhost:3000`

#### Quick Start

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

#### Frontend Commands

```bash
# Development
npm run dev              # Start dev server
npm run preview         # Preview production build

# Building & Quality
npm run build           # Build for production
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run type-check      # Check TypeScript types

# Testing
npm run test            # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report

# CI/CD
npm run ci              # Run all checks (lint, format, type-check, test, build)
```

#### Frontend Features

**✅ Authentication**
- Login, Register, Logout
- Forgot Password & Reset Password flows
- Token refresh on expiry
- Session persistence
- Protected routes with role-aware navigation

**✅ Layout Components**
- Responsive Sidebar navigation
- Top Navigation bar with theme switcher
- User menu with profile and logout
- Breadcrumb support
- Organization switcher ready

**✅ Design System**
- 10+ reusable UI components (Button, Input, Card, Label, Alert, etc.)
- Form components with React Hook Form integration
- Loading states and Empty/Error states
- Light/Dark theme support with CSS variables

**✅ Pages Implemented**
- Home (public landing page)
- Login/Register (authentication)
- Forgot Password/Reset Password (recovery flows)
- Dashboard (protected, shows overview)
- Profile (displays user information)
- Settings (placeholder for user settings)
- 404 Not Found & 403 Forbidden error pages

**✅ State Management**
- React Context for authentication
- TanStack Query for server state
- Local storage for session persistence

**✅ Error Handling**
- Global error boundary
- API error handling with automatic token refresh
- Form validation with Zod
- User-friendly error messages

**✅ Testing**
- Vitest configuration
- React Testing Library setup
- Component test examples
- Utility function tests

#### Frontend Architecture

```
frontend/
├── src/
│   ├── app/                    # Application root
│   │   ├── routes/            # Routing configuration
│   │   ├── providers/         # Context providers
│   │   └── error-boundary.tsx # Global error handler
│   ├── shared/                # Shared code
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # Custom hooks
│   │   └── services/          # API services
│   ├── pages/                 # Page components
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Utilities
│   └── main.tsx              # Entry point
├── package.json              # Dependencies
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── README.md                 # Frontend documentation
```

#### Environment Configuration

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_BASE_PATH=/api/v1

# App Configuration
VITE_APP_NAME=Property Management
VITE_APP_DESCRIPTION=Enterprise Property Management SaaS
```

See [Frontend README](./frontend/README.md) for detailed frontend documentation.

## API Documentation

### Accessing Documentation

**Interactive Swagger UI (Recommended):**
```
http://localhost:5000/api-docs
```

**OpenAPI Specification (JSON):**
```
GET http://localhost:5000/openapi.json
```

### API Versioning

All endpoints are versioned under `/api/v1`:

```
GET  /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/organizations
```

### Health Checks

```bash
# Basic status
GET http://localhost:5000/

# Kubernetes liveness probe
GET http://localhost:5000/health/live

# Kubernetes readiness probe (checks database)
GET http://localhost:5000/health/ready

# Detailed diagnostics
GET http://localhost:5000/health/detailed
```

### Authentication

All protected endpoints require JWT Bearer token:

```bash
Authorization: Bearer <jwt_token>
```

**Public Endpoints:**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh-token
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

**Protected Endpoints:**
```
GET  /api/v1/auth/me
POST /api/v1/auth/logout
POST /api/v1/auth/change-password
```

### Organization Management

All require authentication. Use `/api-docs` for detailed endpoint documentation.

```
GET    /api/v1/organizations
POST   /api/v1/organizations
GET    /api/v1/organizations/:organizationId
PUT    /api/v1/organizations/:organizationId
DELETE /api/v1/organizations/:organizationId
POST   /api/v1/organizations/:organizationId/restore
```

### Organization Settings (Sprint 3)

Configure organization-wide settings for timezone, currency, date/time formats, language, and measurement units.

```bash
# Get organization settings
GET /api/v1/organizations/:organizationId/settings

# Update organization settings
PUT /api/v1/organizations/:organizationId/settings
{
  "timezone": "America/New_York",
  "currency": "USD",
  "dateFormat": "MM-DD-YYYY",
  "timeFormat": "HH:mm",
  "language": "en",
  "measurementUnit": "metric"
}
```

**Supported Values:**
- Timezone: Any IANA timezone (e.g., "UTC", "America/New_York", "Europe/London")
- Currency: ISO 4217 codes (e.g., "USD", "EUR", "INR", "GBP")
- Date Format: "YYYY-MM-DD", "DD-MM-YYYY", "MM-DD-YYYY"
- Time Format: "HH:mm:ss", "HH:mm", "12h"
- Language: Language codes (e.g., "en", "es", "fr", "de")
- Measurement Unit: "metric" or "imperial"

### Organization Branding (Sprint 3)

Customize your organization's visual appearance with colors, logos, and CSS.

```bash
# Get organization branding
GET /api/v1/organizations/:organizationId/branding

# Update organization branding
PUT /api/v1/organizations/:organizationId/branding
{
  "logoUrl": "https://example.com/logo.png",
  "logoAltText": "My Organization",
  "faviconUrl": "https://example.com/favicon.ico",
  "primaryColor": "#0066CC",
  "secondaryColor": "#F0F0F0",
  "accentColor": "#FF6B35",
  "theme": "light",
  "customCss": "body { font-family: Arial; }"
}
```

**Requirements:**
- Logo and Favicon URLs must be valid HTTPS URLs
- Colors must be valid hex format (#RRGGBB)
- Theme: "light" or "dark"
- Custom CSS limited to 5000 characters

### Organization Preferences (Sprint 3)

Manage user communication and security preferences.

```bash
# Get organization preferences
GET /api/v1/organizations/:organizationId/preferences

# Update organization preferences
PUT /api/v1/organizations/:organizationId/preferences
{
  "emailNotifications": true,
  "emailDigest": "daily",
  "twoFactorAuth": false,
  "dataRetention": 90,
  "backupFrequency": "weekly"
}
```

**Configuration Options:**
- Email Notifications: `true` or `false` - Enable/disable all email notifications
- Email Digest: "off", "daily", "weekly", "monthly" - Frequency for digest emails
- Two-Factor Auth: `true` or `false` - Require 2FA for organization
- Data Retention: 1-3650 days - How long to keep deleted data
- Backup Frequency: "daily", "weekly", "monthly" - How often to backup data

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Test Configuration
- **Framework**: Jest
- **Database Reset**: Between each test
- **Coverage Thresholds**:
  - Lines: 45%
  - Functions: 40%
  - Branches: 28%
  - Statements: 45%

### Run Tests in Watch Mode
```bash
npm test:watch
```

### Check Code Quality
```bash
npm run lint
```

## Project Structure

```
src/
├── app.ts                              # Express application setup
├── server.ts                           # Server entry point
├── openapi.spec.ts                     # OpenAPI 3.0 specification
├── config/
│   ├── environment.ts                  # Environment configuration
│   └── prisma.ts                       # Prisma client
├── controllers/
│   ├── auth.controller.ts              # Authentication logic
│   ├── organization.controller.ts      # Organization CRUD
│   └── health.controller.ts            # Health/diagnostics
├── middleware/
│   ├── auth.middleware.ts              # JWT validation
│   ├── authorization.middleware.ts     # RBAC & authorization
│   ├── errorHandler.ts                 # Global error handler
│   ├── helmet.middleware.ts            # Security headers
│   ├── cors.middleware.ts              # CORS configuration
│   ├── rate-limit.middleware.ts        # Rate limiting
│   └── brute-force.middleware.ts       # Brute force protection
├── routes/
│   ├── auth.routes.ts                  # Auth endpoints
│   ├── organization.routes.ts          # Organization endpoints
│   └── health.routes.ts                # Health endpoints
├── services/
│   ├── auth.service.ts                 # Auth business logic
│   ├── organization.service.ts         # Org business logic
│   └── email.service.ts                # Email notifications
├── repositories/
│   ├── base.repository.ts              # Base CRUD operations
│   ├── user.repository.ts
│   └── organization.repository.ts
├── shared/
│   ├── core/
│   │   ├── response/                   # API response formatter
│   │   ├── pagination/                 # Pagination logic
│   │   └── filtering/                  # Filter utilities
│   ├── exceptions/                     # Custom exceptions
│   ├── constants/                      # App constants
│   ├── types/                          # TypeScript types
│   ├── utils/                          # Helper utilities
│   └── validation/                     # Validation schemas
├── utils/
│   ├── errors.ts                       # Error classes
│   ├── logger.ts                       # Logger utility
│   ├── jwt.ts                          # JWT utilities
│   └── validation.ts                   # Validation middleware
├── validators/
│   ├── auth.validators.ts              # Auth validation schemas
│   └── organization.validators.ts      # Org validation schemas
└── __tests__/
    ├── organization.service.unit.test.ts
    └── e2e/
        ├── auth.e2e.test.ts
        └── organization.e2e.test.ts

prisma/
├── schema.prisma                       # Database schema
└── migrations/                         # Database migrations

.github/
└── workflows/
    └── ci.yml                          # GitHub Actions CI/CD
```

## Environment Configuration

Create `.env` file with:

```env
# Application
NODE_ENV=development
PORT=5000
LOG_LEVEL=INFO
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/property_management

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# Brute Force Protection
BRUTE_FORCE_MAX_ATTEMPTS=5
BRUTE_FORCE_LOCKOUT_DURATION_MS=1800000

# Email
EMAIL_PROVIDER=sendgrid
EMAIL_FROM_ADDRESS=noreply@propertymanagement.com
SENDGRID_API_KEY=your-sendgrid-key
```

## Security

### Implemented Security Measures
- ✅ JWT-based stateless authentication
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Brute force attack protection
- ✅ Rate limiting (3 tiers: general, auth, password-reset)
- ✅ Input validation (Zod schemas)
- ✅ Error handling (no stack traces in production)
- ✅ Security headers (Helmet)
- ✅ CORS with environment-aware policies
- ✅ Request ID tracing
- ✅ Structured logging for audit trails
- ✅ Organization-level data isolation

### Production Deployment Checklist
- [ ] Use HTTPS with valid SSL certificate
- [ ] Store secrets in secure vault (AWS Secrets Manager, HashiCorp Vault)
- [ ] Enable database encryption at rest and SSL connections
- [ ] Configure automated backups with recovery testing
- [ ] Integrate error tracking (Sentry)
- [ ] Setup application performance monitoring (DataDog, New Relic)
- [ ] Use Redis for distributed rate limiting
- [ ] Implement token blacklist for logout
- [ ] Specify exact CORS origins (not `*`)
- [ ] Setup Kubernetes health probe timeouts appropriately

## Deployment

### Docker

```bash
# Build image
docker build -t property-management-api:latest .

# Run container
docker run \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=your-secret \
  -p 5000:5000 \
  property-management-api:latest
```

### Kubernetes

Configure health probes:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: property-api
spec:
  containers:
  - name: api
    image: property-management-api:latest
    ports:
    - containerPort: 5000
    
    livenessProbe:
      httpGet:
        path: /health/live
        port: 5000
      initialDelaySeconds: 30
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3
    
    readinessProbe:
      httpGet:
        path: /health/ready
        port: 5000
      initialDelaySeconds: 10
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 3
```

## Troubleshooting

### Database Connection Fails
```bash
# Verify PostgreSQL is running
psql postgresql://postgres:postgres@localhost:5432

# Check DATABASE_URL in .env
# Run migrations
npx prisma migrate dev

# View database
npx prisma studio
```

### JWT Token Invalid
- Verify `JWT_SECRET` is set in `.env`
- Check token hasn't expired (`JWT_EXPIRES_IN=8h`)
- Get new token: `POST /api/v1/auth/login`

### Rate Limit Exceeded
- Default: 100 general / 5 auth / 3 password-reset per window
- Adjust in `.env`: `RATE_LIMIT_MAX_REQUESTS`
- In development, rate limiting may be disabled

### Tests Failing
```bash
# Regenerate Prisma client
npm run generate

# Ensure test database exists
npx prisma db push --skip-generate

# Run tests with verbose output
npm test -- --verbose
```

## Development

### Build for Production
```bash
npm run build
```

### Lint & Type Check
```bash
npm run lint
npm run type-check
```

### Database Studio
```bash
npx prisma studio
```

Opens interactive database browser at `http://localhost:5555`

## Contributing

### Code Standards
- TypeScript strict mode required
- ESLint & Prettier formatting
- Minimum coverage: 60% lines, 60% functions
- All new features require unit & integration tests
- Follow Clean Architecture principles

### Before Submitting PR
```bash
npm run lint
npm run type-check
npm test
npm run test:coverage
```

## Useful Commands

```bash
# Installation & Setup
npm install
npm run generate
npx prisma migrate dev

# Development
npm run dev
npm run build
npm run lint
npm run type-check

# Testing
npm test
npm test:watch
npm run test:coverage

# Database
npx prisma studio
npx prisma migrate dev
npx prisma db push

# Documentation
npm run docs
```

## API Response Format

All endpoints return consistent JSON response:

**Success (2xx):**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Paginated Success:**
```json
{
  "success": true,
  "message": "Items retrieved",
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```

## Logging

Application uses structured JSON logging:

```json
{
  "timestamp": "2025-01-15T10:30:45.123Z",
  "level": "INFO",
  "service": "property-management-api",
  "requestId": "req-1705318245123-0.456",
  "message": "User login successful",
  "userId": "user-123",
  "organizationId": "org-456"
}
```

## Related Documentation

- [Frontend Documentation](./frontend/README.md) - React 19 frontend setup and usage
- [Sprint UI-1 Completion Report](./SPRINT_UI1_COMPLETION_REPORT.md) - Frontend implementation details
- [Quick Start Guide](./QUICK_START.md)
- [Manual Testing Guide](./HUMAN_TESTING.md)
- [Architecture Diagram](./ARCHITECTURE_DIAGRAM.md)
- [Phase 1 Completion](./PHASE1_COMPLETION_REPORT.md)
- [Shared Infrastructure](./SHARED_INFRASTRUCTURE_COMPLETE.md)

## Support

For questions, bugs, or feature requests, please create an issue or contact the development team.

## License

ISC
