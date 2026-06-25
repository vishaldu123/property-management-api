# Next Sprint Plan - Phase 2: Business Modules (Draft)

## Phase 2 Objectives
Build the core business modules on top of solid Phase 1 foundation.

## Priority 1: RBAC Implementation
Enable fine-grained permission control across all modules.

### Tasks:
- [ ] RBAC Service: Implement `seedDefaultRolePermissions()` with database persistence
- [ ] RBAC Middleware: Create `authorize()` and `requireRole()` middleware
- [ ] RBAC Routes: Add role/permission management endpoints
- [ ] Tests: 80%+ coverage for RBAC logic

### Deliverables:
- Seeded Role/Permission data
- Protected endpoints by permission
- Role management API

---

## Priority 2: Property Module
Enable organization to manage properties.

### Data Model:
```
Property (extends Organization-owned)
├─ name: string
├─ address: string
├─ city: string
├─ state: string
├─ postalCode: string
├─ country: string (default: "India")
└─ units: Unit[] (1-to-many)
```

### Tasks:
- [ ] Update Prisma schema: Add Property model
- [ ] Create migration: Property table
- [ ] PropertyRepository: CRUD + query methods
- [ ] PropertyService: Business logic
- [ ] PropertyController: REST endpoints
- [ ] Tests: Integration tests for property lifecycle

### API Endpoints:
```
POST   /api/properties          - Create property
GET    /api/properties          - List properties
GET    /api/properties/:id      - Get property details
PUT    /api/properties/:id      - Update property
DELETE /api/properties/:id      - Delete property
```

### Authorization:
- PROPERTY_CREATE: OWNER, ADMIN, MANAGER
- PROPERTY_READ: All roles
- PROPERTY_UPDATE: OWNER, ADMIN, MANAGER
- PROPERTY_DELETE: OWNER, ADMIN

---

## Priority 3: Unit Module
Enable subdivision of properties into units.

### Data Model:
```
Unit (belongs to Property)
├─ unitNumber: string
├─ bedrooms: int
├─ bathrooms: int
├─ areaSqFt: decimal
├─ rentAmount: decimal
├─ propertyId: UUID (foreign key)
└─ leases: Lease[] (1-to-many)
```

### Tasks:
- [ ] Update Prisma schema: Add Unit model
- [ ] Create migration: Unit table with Property FK
- [ ] UnitRepository: Query and CRUD
- [ ] UnitService: Business logic
- [ ] UnitController: REST endpoints
- [ ] Tests: Unit/property relationship tests

### API Endpoints:
```
POST   /api/properties/:propertyId/units     - Create unit
GET    /api/properties/:propertyId/units     - List units
GET    /api/units/:id                        - Get unit details
PUT    /api/units/:id                        - Update unit
DELETE /api/units/:id                        - Delete unit
```

---

## Priority 4: Tenant Module
Enable management of tenants (people).

### Data Model:
```
Tenant (belongs to Organization)
├─ name: string
├─ email: string
├─ phone: string
├─ address: string
├─ organizationId: UUID (FK)
└─ leases: Lease[] (1-to-many)
```

### Tasks:
- [ ] Update Prisma schema: Add Tenant model
- [ ] Create migration: Tenant table
- [ ] TenantRepository: Queries
- [ ] TenantService: Business logic
- [ ] TenantController: REST endpoints
- [ ] Validation: Email/phone format

### API Endpoints:
```
POST   /api/tenants        - Create tenant
GET    /api/tenants        - List tenants
GET    /api/tenants/:id    - Get tenant details
PUT    /api/tenants/:id    - Update tenant
DELETE /api/tenants/:id    - Delete tenant
```

---

## Priority 5: Lease Module
Enable lease agreement management.

### Data Model:
```
Lease (connects Tenant + Unit + Payment)
├─ tenantId: UUID (FK)
├─ unitId: UUID (FK)
├─ startDate: DateTime
├─ endDate: DateTime
├─ monthlyRent: Decimal
├─ securityDeposit: Decimal
├─ depositPaid: boolean
├─ status: enum (ACTIVE, INACTIVE, EXPIRED)
├─ organizationId: UUID (FK)
└─ payments: Payment[] (1-to-many)
```

### Tasks:
- [ ] Update Prisma schema: Add Lease model
- [ ] Create migration: Lease table
- [ ] LeaseRepository: Query + filters
- [ ] LeaseService: Lifecycle (create, renew, terminate)
- [ ] LeaseController: REST endpoints
- [ ] Validators: Date validation, deposit checks

### API Endpoints:
```
POST   /api/leases          - Create lease
GET    /api/leases          - List leases (with filters)
GET    /api/leases/:id      - Get lease details
PUT    /api/leases/:id      - Update lease
PATCH  /api/leases/:id/terminate - End lease
DELETE /api/leases/:id      - Delete lease
```

### Business Logic:
- Security deposit validation
- Lease date validation (end > start)
- Active lease conflict detection
- Rent calculation

---

## Priority 6: Payment Module
Enable payment processing and tracking.

### Data Model:
```
Payment (tracks Lease payments)
├─ leaseId: UUID (FK)
├─ amount: Decimal
├─ paymentDate: DateTime
├─ status: enum (PENDING, COMPLETED, FAILED, REFUNDED)
├─ method: enum (BANK_TRANSFER, CARD, UPI, etc.)
├─ provider: string (razorpay, cashfree)
├─ providerPaymentId: string (external ID)
├─ providerResponse: JSON (full response)
└─ reference: string (unique payment reference)
```

### Tasks:
- [ ] Update Prisma schema: Add Payment model
- [ ] Payment gateway adapter: Razorpay integration
- [ ] Payment gateway adapter: Cashfree integration
- [ ] PaymentRepository: Query + reconciliation
- [ ] PaymentService: Payment lifecycle
- [ ] PaymentController: REST endpoints
- [ ] Webhook handlers: Payment updates from gateways

### API Endpoints:
```
POST   /api/payments        - Initiate payment
GET    /api/payments        - List payments
GET    /api/payments/:id    - Get payment details
POST   /api/payments/:id/retry - Retry failed payment
POST   /api/payments/:id/refund - Refund payment
```

### Webhook Endpoints:
```
POST   /api/payments/webhooks/razorpay  - Razorpay updates
POST   /api/payments/webhooks/cashfree  - Cashfree updates
```

### Business Logic:
- Payment validation (amount vs lease rent)
- Status tracking (PENDING → COMPLETED)
- Retry logic for failed payments
- Reconciliation with payment gateways

---

## Implementation Approach

### Per Sprint (1-2 weeks):
1. Update Prisma schema
2. Create migration
3. Create repository
4. Create service (business logic)
5. Create controller (endpoints)
6. Write integration tests (80% coverage)
7. Manual testing
8. Code review and refinement

### Database Migration Strategy:
- Always create new migration files
- Never edit previous migrations
- Test migrations on copy of production DB
- Keep migrations small and focused

### Testing Requirements:
- Unit tests for services (80%+ coverage)
- Integration tests for controllers
- E2E tests for critical workflows
- Postman collection updates

---

## Definition of Done (Phase 2 modules)

For each module to be considered complete:
- [ ] All endpoints tested and working
- [ ] 80%+ test coverage
- [ ] Authorization checks in place
- [ ] Error handling complete
- [ ] Postman collection updated
- [ ] Documentation updated
- [ ] Code review approved
- [ ] Ready for manual testing

---

## Risk Mitigation

### Risks:
1. **Complex RBAC logic** - Start simple in Phase 2, enhance in Phase 3
2. **Payment gateway integration failures** - Implement mock adapter for testing
3. **Data consistency issues** - Use transactions for multi-model operations
4. **Circular references between models** - Plan relationships carefully in design

### Mitigation:
- Design review before implementation
- Start with mock implementations
- Comprehensive test suite
- Clear database schema design docs

---

## Success Criteria for Phase 2

- ✅ All 6 modules implemented and tested
- ✅ 80%+ test coverage across modules
- ✅ RBAC properly enforced on all endpoints
- ✅ No data consistency issues in testing
- ✅ Payment integrations working (mock + real)
- ✅ Full documentation and Postman collection
- ✅ Ready for production deployment

---

**Phase 2 Estimated Timeline**: 6-8 weeks  
**Team Size Recommendation**: 2-3 backend engineers  
**Dependencies**: Completion of Phase 1 foundation
