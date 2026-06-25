# Enterprise Architecture - Phase 1: Foundation

## Current State Analysis

### Issues Blocking Application Startup:
1. **RBAC Seeding Error**: `seedDefaultRolePermissions()` attempts to upsert RolePermission records with invalid roleId/permissionId (using UserRole enums instead of UUID foreign keys)
2. **Route Mount Errors**: Routes for Property, Unit, Tenant, Lease, Payment are mounted but their controllers/services are incomplete
3. **Complex Schema**: Prisma schema contains advanced models (Expense, Invoice, MaintenanceRequest, Ledger) not needed for MVP
4. **Over-engineered Auth**: Authentication logic intertwined with complex organization/membership system

### Root Causes:
- Attempting to implement full feature set before establishing solid foundation
- Mixing RBAC implementation with basic auth
- Database schema complexity exceeds MVP requirements

---

## Phase 1: Foundation (This Sprint)

### Objectives:
✓ Establish minimal production-ready architecture  
✓ Fix application startup issues  
✓ Keep only core infrastructure modules  
✓ Prepare foundation for future modules  

### Architecture Principles:
- **Clean Architecture**: Separation of concerns (Controllers → Services → Repositories → Data)
- **Repository Pattern**: Abstraction layer for database access
- **Dependency Injection**: Constructor-based DI for testability
- **TypeScript Strict Mode**: Enabled for type safety
- **Environment-Driven Configuration**: All secrets via .env

### Scope: Keep ONLY
1. ✓ Express Application Framework
2. ✓ Prisma ORM
3. ✓ PostgreSQL Database
4. ✓ Environment Configuration (.env)
5. ✓ Logger (structured logging)
6. ✓ Global Error Handler
7. ✓ Authentication Module (simplified JWT-based)

### Scope: Remove/Disable
- Property Module
- Tenant Module
- Lease Module
- Payment Module
- RBAC Seeding (replaced with simple role-based access)
- Complex Expense/Invoice/Ledger models
- Multi-organization complexity (simplify to single org per deployment)

---

## Phase 1 Implementation Steps

### Step 1: Fix Database Schema
**File**: `prisma/schema.prisma`
- Remove: Property, Unit, Tenant, Lease, Payment, Expense, Invoice, MaintenanceRequest, LedgerAccount, LedgerEntry, AuditLog, etc.
- Keep: User, Organization (simplified), OrganizationUser (simplified), Role, Permission, RolePermission
- Simplify: Organization structure, remove unnecessary fields

### Step 2: Disable RBAC Seeding
**File**: `src/app.ts`
- Remove: `seedDefaultRolePermissions()` call from bootstrap
- Replace with: Simple in-memory role definitions
- Keep: Role definitions for future RBAC implementation

### Step 3: Fix Authentication Flow
**Files**: 
- `src/controllers/auth.controller.ts` - Simplify register/login
- `src/middleware/auth.middleware.ts` - Remove complex membership checks
- `src/services/rbac.service.ts` - Keep role definitions, remove seeding logic

### Step 4: Disable Non-Core Routes
**File**: `src/app.ts`
- Remove: Property, Unit, Tenant, Lease, Payment route mounts
- Keep: Auth routes only

### Step 5: Implement Logger
**Files**:
- `src/utils/logger.ts` - Create structured logger
- `src/middleware/logging.middleware.ts` - Add request/response logging

### Step 6: Create Repository Layer
**Files**:
- `src/repositories/base.repository.ts` - Base repository class
- `src/repositories/user.repository.ts` - User data access
- `src/repositories/organization.repository.ts` - Organization data access

### Step 7: Refactor Auth Service
**Files**:
- `src/services/auth.service.ts` - Implement auth business logic
- Use repositories for data access

### Step 8: Update Validators
**Files**:
- `src/validators/auth.validators.ts` - Auth-specific validators
- Clean up validator structure

### Step 9: Environment Configuration
**Files**:
- `.env.template` - Create template with only core variables
- `src/config/environment.ts` - Typed environment configuration

### Step 10: Fix Error Handling
**File**: `src/app.ts`
- Register global error handler middleware

---

## Testing Strategy
- Unit tests for repositories and services
- Integration tests for auth endpoints
- E2E tests for full auth flow
- Coverage target: >80%

---

## Deliverables
1. ✓ Clean, minimalist application structure
2. ✓ Simplified database schema
3. ✓ Working authentication (register/login)
4. ✓ Structured logging
5. ✓ Repository-Service-Controller pattern
6. ✓ Global error handling
7. ✓ Passing tests
8. ✓ TypeScript strict mode compliant
9. ✓ Production-ready code

---

## Next Sprint (Phase 2)
After Phase 1 foundation is solid:
1. **RBAC Implementation**: Proper role/permission system with seeding
2. **Property Module**: Domain entities and services
3. **Unit Module**: Property subdivisions
4. **Tenant Module**: Tenant management
5. **Lease Module**: Lease agreements
6. **Payment Module**: Payment processing

---

## Timeline Estimate
- Schema refactoring: 30 min
- Auth simplification: 45 min
- Repository layer: 30 min
- Logger implementation: 20 min
- Testing & validation: 30 min
- **Total**: ~2.5 hours

