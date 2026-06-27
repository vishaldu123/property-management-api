# Property Management API - Architecture Exploration

## Overview
The codebase follows a clean, layered architecture with clear separation of concerns:
- **Prisma Schema**: Database models and relationships
- **Repositories**: Data access layer with business logic queries
- **Services**: Business logic orchestration layer
- **Controllers**: HTTP request/response handlers
- **Validators**: Zod-based input validation
- **Middleware**: Cross-cutting concerns (auth, error handling)
- **Routes**: HTTP route definitions

---

## 1. Prisma Schema Patterns

### Current Schema Structure
The schema (`prisma/schema.prisma`) uses a multi-tenant architecture with:
- **Organization** as the tenant root
- **User** for authentication
- **OrganizationUser** for membership management
- **Soft-delete** pattern with `deletedAt` field
- **Audit fields**: `createdBy`, `updatedBy`, `createdAt`, `updatedAt`
- **Organization features**: Settings, Branding, Preferences

### Key Models Currently Defined
```
- Organization (with Settings, Branding, Preferences)
- User
- OrganizationUser (membership)
- OrganizationInvitation
- Role & Permission (RBAC)
- UserRole (role assignment)
- RefreshToken (auth tokens)
- PasswordResetToken (password reset)
```

### Missing Models (Phase 2)
Property, Tenant, Unit, Lease models are not yet defined but are referenced in controllers/routes.

### Field Patterns to Follow
```typescript
// Standard fields for all domain models
id              String             @id @default(uuid())
organizationId  String             @unique
name            String
createdAt       DateTime           @default(now())
updatedAt       DateTime           @updatedAt
deletedAt       DateTime?          // Soft delete
createdBy       String?            // Audit trail
updatedBy       String?            // Audit trail

// Relationships
organization    Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)

// Indexes
@@index([organizationId])
@@index([deletedAt])
```

---

## 2. Repository Pattern

### File Structure
```
src/repositories/
├── base.repository.ts           # Abstract base class
├── organization.repository.ts   # Domain-specific implementation
├── user.repository.ts
├── membership.repository.ts
└── __tests__/
```

### BaseRepository Class
**Location**: `src/repositories/base.repository.ts`

```typescript
export abstract class BaseRepository<T> implements IRepository<T> {
  protected modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  async findById(id: string): Promise<T | null> { }
  async findAll(skip?: number, take?: number): Promise<T[]> { }
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> { }
  async update(id: string, data: Partial<T>): Promise<T> { }
  async delete(id: string): Promise<boolean> { }
}
```

### OrganizationRepository Example
**Location**: `src/repositories/organization.repository.ts`

**Key Patterns**:
1. Extends BaseRepository
2. Domain-specific query methods
3. Soft-delete support via methods like `softDelete()`, `restore()`
4. Relationship handling (Settings, Branding, Preferences)
5. Scoped queries for tenant isolation
6. Pagination support with `PaginationRequest`

**Methods**:
```typescript
export class OrganizationRepository extends BaseRepository<Organization> {
  async findBySlug(slug: string): Promise<Organization | null>
  async findByEmail(email: string): Promise<Organization | null>
  async findByIdAndOrganizationId(id: string, organizationId: string): Promise<Organization | null>
  async paginateScoped(pagination, organizationId, where): Promise<PaginationResponse>
  
  // Related entity management
  async getOrCreateSettings(organizationId): Promise<OrganizationSettings>
  async updateSettings(organizationId, data): Promise<OrganizationSettings>
  async getOrCreateBranding(organizationId): Promise<OrganizationBranding>
  async updateBranding(organizationId, data): Promise<OrganizationBranding>
}
```

**Instantiation Pattern**:
```typescript
// In the class
constructor() {
  super(prisma, 'organization');
}

// Singleton instance
export const organizationRepository = new OrganizationRepository();
```

---

## 3. Service Layer Pattern

### File Structure
```
src/services/
├── organization.service.ts
├── auth.service.ts
├── membership.service.ts
├── rbac.service.ts
└── __tests__/
```

### OrganizationService Example
**Location**: `src/services/organization.service.ts`

**Architecture Principles**:
1. **Stateless**: Services are singletons with no mutable state
2. **Context-aware**: Receives `OrganizationActorContext` with userId and organizationId
3. **Error handling**: Uses custom AppError subclasses
4. **Logging**: Structured logging at key points
5. **Multi-step operations**: Uses private helper methods
6. **Tenant isolation**: Enforced via `ensureOrganizationIsolation()`
7. **Validation**: Business logic validation before repository calls

### Service Structure
```typescript
interface OrganizationActorContext {
  userId: string;
  organizationId: string;
}

export class OrganizationService {
  // Public CRUD methods
  async createOrganization(payload: CreateOrganizationInput, actorUserId?: string)
  async updateOrganization(organizationId: string, payload: UpdateOrganizationInput, context: OrganizationActorContext)
  async softDeleteOrganization(organizationId: string, context: OrganizationActorContext)
  async restoreOrganization(organizationId: string, context: OrganizationActorContext)
  async getOrganization(organizationId: string, context: OrganizationActorContext)
  async listOrganizations(query: ListOrganizationsQuery, context: OrganizationActorContext)

  // Related entity methods
  async getOrganizationSettings(organizationId: string, context: OrganizationActorContext)
  async updateOrganizationSettings(organizationId: string, payload: OrganizationSettingsInput, context: OrganizationActorContext)

  // Private helper methods
  private ensureOrganizationIsolation(requestedId: string, actorOrgId: string): void
  private async ensureOrganizationExists(organizationId: string): Promise<void>
  private async ensureUniqueFields(slug?: string, email?: string, excludeId?: string): Promise<void>
  private buildWhereClause(query: ListOrganizationsQuery, organizationId: string): Prisma.OrganizationWhereInput
  private generateSlug(name: string): string
}

export const organizationService = new OrganizationService();
```

### Key Patterns

**1. Multi-step Validation Pattern**:
```typescript
async createOrganization(payload, actorUserId) {
  const slug = payload.slug ?? this.generateSlug(payload.name);
  
  // 1. Validate uniqueness
  await this.ensureUniqueFields(slug, payload.email);
  
  // 2. Create with audit fields
  const organization = await organizationRepository.create({
    ...payload,
    slug,
    createdBy: actorUserId,
    updatedBy: actorUserId,
  });

  // 3. Log operation
  logger.info('Organization created successfully', { 
    organizationId: organization.id, 
    actorUserId 
  });
  
  return organization;
}
```

**2. Tenant Isolation Pattern**:
```typescript
async updateOrganization(organizationId, payload, context) {
  // 1. Enforce tenant isolation
  this.ensureOrganizationIsolation(organizationId, context.organizationId);
  
  // 2. Verify resource exists
  await this.ensureOrganizationExists(organizationId);
  
  // 3. Validate uniqueness if needed
  if (payload.slug || payload.email) {
    await this.ensureUniqueFields(payload.slug, payload.email, organizationId);
  }

  // 4. Update with audit trail
  const organization = await organizationRepository.update(organizationId, {
    ...payload,
    updatedBy: context.userId,
  });

  logger.info('Organization updated successfully', { organizationId, actorUserId: context.userId });
  return organization;
}
```

**3. Related Entity Pattern (Settings/Branding/Preferences)**:
```typescript
async getOrganizationSettings(organizationId, context) {
  this.ensureOrganizationIsolation(organizationId, context.organizationId);
  await this.ensureOrganizationExists(organizationId);
  
  const settings = await organizationRepository.getOrCreateSettings(organizationId);
  logger.info('Organization settings retrieved', { organizationId });
  return settings;
}

async updateOrganizationSettings(organizationId, payload, context) {
  this.ensureOrganizationIsolation(organizationId, context.organizationId);
  await this.ensureOrganizationExists(organizationId);
  
  const settings = await organizationRepository.updateSettings(organizationId, {
    ...payload,
    updatedBy: context.userId,
  });

  logger.info('Organization settings updated', { organizationId, actorUserId: context.userId });
  return settings;
}
```

**4. Error Handling Pattern**:
```typescript
private async ensureOrganizationExists(organizationId: string): Promise<void> {
  const organization = await organizationRepository.findByIdAndOrganizationId(organizationId, organizationId);
  if (!organization) {
    throw new NotFoundError('Organization');
  }
}

private ensureOrganizationIsolation(requestedId: string, actorOrgId: string): void {
  if (requestedId !== actorOrgId) {
    throw new ForbiddenError('Access denied for requested organization');
  }
}

private async ensureUniqueFields(slug?: string, email?: string, excludeId?: string): Promise<void> {
  if (slug) {
    const existingSlug = await organizationRepository.findBySlug(slug);
    if (existingSlug && existingSlug.id !== excludeId) {
      throw new ConflictError('Organization slug already exists');
    }
  }
  // ... similar for email
}
```

---

## 4. Controller Layer Pattern

### File Structure
```
src/controllers/
├── organization.controller.ts
├── auth.controller.ts
├── membership.controller.ts
└── __tests__/
```

### OrganizationController Example
**Location**: `src/controllers/organization.controller.ts`

**Key Patterns**:
1. **Handler functions** exported as named functions
2. **Context extraction**: Helper to get actor context from request
3. **Error handling**: Wrapped in try-catch, errors passed to next()
4. **Validation**: Body/params validated at route level
5. **Response formatting**: Using ApiResponse static methods
6. **Authentication**: Extracted from AuthenticatedRequest

```typescript
const getActorContext = (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return {
    userId: req.user.userId,
    organizationId: req.user.organizationId,
  };
};

export const createOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const actorUserId = (req as AuthenticatedRequest).user?.userId;
    const organization = await organizationService.createOrganization(
      req.body as CreateOrganizationInput,
      actorUserId
    );
    ApiResponse.created(res, organization, 'Organization created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const organizationId = req.params.organizationId as string;
    const organization = await organizationService.updateOrganization(
      organizationId,
      req.body as UpdateOrganizationInput,
      context
    );
    ApiResponse.success(res, organization, 'Organization updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const organizationId = req.params.organizationId as string;
    const organization = await organizationService.getOrganization(organizationId, context);
    ApiResponse.success(res, organization, 'Organization retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const listOrganizations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const result = await organizationService.listOrganizations(
      req.query as ListOrganizationsQuery,
      context
    );
    ApiResponse.paginated(res, result.data, result.meta, 'Organizations retrieved successfully');
  } catch (error) {
    next(error);
  }
};
```

---

## 5. Routes Structure

### File Structure
```
src/routes/
├── auth.routes.ts
├── organization.routes.ts
├── property.routes.ts
├── unit.routes.ts
├── tenant.routes.ts
├── lease.routes.ts
├── rbac.routes.ts
└── membership.routes.ts
```

### Route Pattern
**Location**: `src/routes/organization.routes.ts`

```typescript
import { Router } from 'express';
import { requireAuth, authorize } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { 
  createOrganizationSchema,
  // ... other validators
} from '../validators/organization.validators';
import {
  createOrganization,
  getOrganization,
  listOrganizations,
  // ... other handlers
} from '../controllers/organization.controller';

const router = Router();

// Public endpoint (no auth)
router.post('/', validate({ body: createOrganizationSchema }), createOrganization);

// Apply auth to all following routes
router.use(requireAuth);

// Protected endpoints
router.get('/', 
  validate({ query: listOrganizationsQuerySchema }), 
  listOrganizations
);

router.get('/:organizationId', 
  validate({ params: organizationParamsSchema }), 
  getOrganization
);

router.put(
  '/:organizationId',
  validate({ params: organizationParamsSchema, body: updateOrganizationSchema }),
  authorize('ORGANIZATION_UPDATE'), // Phase 2: permission checking
  updateOrganization
);

router.delete('/:organizationId', 
  validate({ params: organizationParamsSchema }), 
  authorize('ORGANIZATION_DELETE'),
  softDeleteOrganization
);

// Nested routes for sub-resources
router.get('/:organizationId/settings', 
  validate({ params: organizationParamsSchema }), 
  getOrganizationSettings
);

router.put(
  '/:organizationId/settings',
  validate({ params: organizationParamsSchema, body: organizationSettingsSchema }),
  updateOrganizationSettings
);

export default router;
```

### Main App Route Registration
**Location**: `src/app.ts`

```typescript
const apiV1Router = express.Router();

apiV1Router.use('/auth', checkBruteForceLockout, createAuthRateLimiter(), authRoutes);
apiV1Router.use('/organizations', organizationRoutes);
apiV1Router.use('/properties', propertyRoutes);
apiV1Router.use('/units', unitRoutes);
apiV1Router.use('/tenants', tenantRoutes);
apiV1Router.use('/leases', leaseRoutes);
apiV1Router.use('/rbac', rbacRoutes);

app.use('/api/v1', apiV1Router);
```

---

## 6. Validation Pattern

### File Structure
```
src/validators/
├── organization.validators.ts
├── property.validators.ts
├── lease.validators.ts
├── tenant.validators.ts
├── unit.validators.ts
└── ...
```

### Zod Schema Patterns
**Location**: `src/validators/organization.validators.ts`

```typescript
import { z } from 'zod';
import { ValidationSchemas } from '../shared/validation';

// 1. Reusable composite schemas
const colorSchema = z.string()
  .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format. Use hex format (e.g., #000000)');

const themeSchema = z.enum(['light', 'dark']).default('light');

// 2. Settings schemas
export const organizationSettingsSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required').optional(),
  currency: z.string().length(3, 'Currency must be ISO 4217 code').toUpperCase().optional(),
  dateFormat: z.enum(['YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY']).optional(),
  timeFormat: z.enum(['HH:mm:ss', 'HH:mm', '12h']).optional(),
  language: z.string().min(1).max(10).optional(),
  measurementUnit: z.enum(['metric', 'imperial']).optional(),
});

// 3. Branding schemas
export const organizationBrandingSchema = z.object({
  logoUrl: z.string().url('Invalid logo URL').optional().nullable(),
  primaryColor: colorSchema.optional(),
  secondaryColor: colorSchema.optional(),
  accentColor: colorSchema.optional(),
  theme: z.enum(['light', 'dark']).optional(),
  customCss: z.string().max(5000).optional().nullable(),
});

// 4. CRUD schemas
export const createOrganizationSchema = z.object({
  name: ValidationSchemas.name,
  slug: ValidationSchemas.slug.optional(),
  email: ValidationSchemas.email,
  phone: ValidationSchemas.phone.optional(),
  website: z.string().url('Invalid website URL').optional(),
  address: z.string().min(1).max(255).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  country: z.string().min(1).max(100).optional(),
  postalCode: z.string().min(1).max(20).optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export const organizationParamsSchema = z.object({
  organizationId: z.string().uuid('Organization ID must be a valid UUID'),
});

// 5. Query/filter schemas
export const listOrganizationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  search: z.string().optional(),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  filters: z.string().optional(),
});

// Type inference
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type ListOrganizationsQuery = z.infer<typeof listOrganizationsQuerySchema>;
export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;
export type OrganizationBrandingInput = z.infer<typeof organizationBrandingSchema>;
```

### Property Validators Example
**Location**: `src/validators/property.validators.ts`

```typescript
export const createPropertySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const propertyIdParamSchema = z.object({
  propertyId: z.string().uuid('Property ID must be a valid UUID'),
});
```

### Validation Middleware
**Location**: `src/utils/validation.ts`

```typescript
export const validate = (schemas: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.reduce((acc, err) => {
          const path = err.path.join('.');
          if (!acc[path]) acc[path] = [];
          acc[path].push(err.message);
          return acc;
        }, {} as Record<string, string[]>);
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      } else {
        next(error);
      }
    }
  };
};
```

---

## 7. Error Handling Pattern

### Custom Error Classes
**Location**: `src/utils/errors.ts`

```typescript
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;
  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 400, true);
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, true);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409, true);
  }
}
```

### Global Error Handler
**Location**: `src/middleware/errorHandler.ts`

Catches errors from services and formats responses appropriately.

---

## 8. Response Format Pattern

### ApiResponse Class
**Location**: `src/shared/core/response/api.response.ts`

```typescript
export class ApiResponse {
  // Success responses
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): void

  // Paginated responses
  static paginated<T>(
    res: Response,
    data: T[],
    meta: any,
    message: string = 'Success',
    statusCode: number = 200
  ): void

  // Create/201 response
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Created'
  ): void

  // Error responses
  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: Record<string, any>
  ): void

  static validationError(
    res: Response,
    errors: Record<string, string[]>,
    message: string = 'Validation failed'
  ): void
}
```

### Response Format Examples

**Success Response** (200):
```json
{
  "success": true,
  "message": "Organization retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Org Name",
    // ... entity fields
  }
}
```

**Paginated Response** (200):
```json
{
  "success": true,
  "message": "Organizations retrieved successfully",
  "data": [
    { /* entity */ },
    { /* entity */ }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Created Response** (201):
```json
{
  "success": true,
  "message": "Organization created successfully",
  "data": {
    "id": "uuid",
    "name": "New Org",
    // ... entity fields
  }
}
```

**Error Response** (4xx/5xx):
```json
{
  "success": false,
  "message": "Organization not found",
  "errors": []
}
```

**Validation Error Response** (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["Name is required"],
    "email": ["Invalid email format"]
  }
}
```

---

## 9. Authentication Context Pattern

### AuthenticatedRequest Interface
**Location**: `src/middleware/auth.middleware.ts`

```typescript
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

interface TokenPayload {
  userId: string;
  organizationId: string;
  iat?: number;
  exp?: number;
}
```

### JWT Verification Flow
1. Middleware extracts Bearer token from Authorization header
2. Verifies JWT signature using `jwtSecret`
3. Validates payload has required fields
4. Injects user context into `req.user`
5. Passes to next middleware/handler

### Context Usage in Services
```typescript
// Services receive context with user identity AND tenant identity
async updateOrganization(
  organizationId: string,
  payload: UpdateOrganizationInput,
  context: OrganizationActorContext  // { userId, organizationId }
)

// Services use context for:
// 1. Tenant isolation checks
this.ensureOrganizationIsolation(organizationId, context.organizationId);

// 2. Audit trail
const updated = await organizationRepository.update(organizationId, {
  ...payload,
  updatedBy: context.userId,  // Track who made the change
});

// 3. Logging
logger.info('Organization updated', { 
  organizationId, 
  actorUserId: context.userId 
});
```

---

## 10. Pagination Pattern

### PaginationRequest DTO
**Location**: `src/shared/core/pagination/pagination.dto.ts`

```typescript
export class PaginationRequest {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;

  constructor(
    page: number = DEFAULT_PAGE,
    limit: number = DEFAULT_LIMIT,
    sort: string = DEFAULT_SORT,
    order: 'asc' | 'desc' = DEFAULT_ORDER,
    search?: string
  ) {
    // Validation and normalization
    const validated = PaginationUtil.validateParams(page, limit, MIN_LIMIT, MAX_LIMIT);
    this.page = validated.page;
    this.limit = validated.limit;
    this.sort = sort;
    this.order = SortUtil.validateOrder(order);
    this.search = search ? SearchUtil.sanitize(search) : undefined;
  }

  getSkip(): number
  getSortOrder(): Record<string, 'asc' | 'desc'>
  getSearchQuery(fields: string[]): Record<string, any>
  getMeta(total: number): PaginationMeta
}

export class PaginationResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

### Repository Pagination Method Pattern
```typescript
// In Repository
async paginateScoped(
  pagination: PaginationRequest,
  organizationId: string,
  where: Prisma.OrganizationWhereInput
) {
  const scopedWhere = { ...where, id: organizationId };
  const skip = pagination.getSkip();
  const orderBy = pagination.getSortOrder();
  
  const [data, total] = await Promise.all([
    prisma.organization.findMany({
      where: scopedWhere,
      skip,
      take: pagination.limit,
      orderBy,
    }),
    prisma.organization.count({ where: scopedWhere }),
  ]);

  return {
    data,
    meta: pagination.getMeta(total),
  };
}
```

### Controller Usage Pattern
```typescript
// In Controller
const pagination = new PaginationRequest(
  query.page,
  query.limit,
  query.sort,
  query.order,
  query.search
);
const result = await organizationRepository.paginate(pagination, where);
ApiResponse.paginated(res, result.data, result.meta, 'Organizations retrieved');
```

---

## 11. Testing Patterns

### E2E Test Structure
**Location**: `src/__tests__/e2e/organization.e2e.test.ts`

```typescript
process.env.NODE_ENV = 'test';
import request from 'supertest';
import app from '../../app';

describe('Organization Module E2E', () => {
  // Test data setup with unique identifiers
  const seed = Date.now();
  const primaryUser = {
    name: 'Org Admin',
    email: `org-admin-${seed}@example.com`,
    password: 'Password123!',
    organizationName: `Primary Org ${seed}`,
  };

  // Context variables for chaining tests
  let authToken = '';
  let ownOrganizationId = '';
  let otherOrganizationId = '';

  // Test lifecycle
  it('creates an organization (public endpoint)', async () => {
    const createResponse = await request(app)
      .post('/api/v1/organizations')
      .send({
        name: `Standalone Org ${seed}`,
        slug: `standalone-org-${seed}`,
        email: `standalone-org-${seed}@example.com`,
        city: 'Mumbai',
        country: 'India',
        subscriptionPlan: 'FREE',
        subscriptionStatus: 'TRIAL',
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.slug).toBe(`standalone-org-${seed}`);
  });

  it('registers users and gets auth context', async () => {
    await request(app).post('/api/v1/auth/register').send(primaryUser).expect(201);
    
    const loginPrimary = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: primaryUser.email, password: primaryUser.password })
      .expect(200);

    authToken = loginPrimary.body.data.token;
    ownOrganizationId = loginPrimary.body.data.organization.id;
  });

  it('lists organizations with pagination metadata', async () => {
    const response = await request(app)
      .get('/api/v1/organizations?page=1&limit=10&search=Primary')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.meta).toHaveProperty('total');
    expect(response.body.data[0].id).toBe(ownOrganizationId);
  });

  it('gets organization by id in same tenant', async () => {
    const response = await request(app)
      .get(`/api/v1/organizations/${ownOrganizationId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(ownOrganizationId);
  });

  // Tenant isolation test
  it('prevents access to other tenant organizations', async () => {
    const response = await request(app)
      .get(`/api/v1/organizations/${otherOrganizationId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(403); // Forbidden

    expect(response.body.success).toBe(false);
  });
});
```

### Test Patterns
1. **Seeded Data**: Uses timestamp for unique identifiers
2. **Sequential Tests**: Later tests depend on earlier state
3. **Auth Context**: Captures token and organization ID
4. **Tenant Isolation**: Verifies cross-tenant access prevention
5. **Response Validation**: Checks both status and response structure
6. **Pagination**: Validates meta information

---

## 12. Project Structure Summary

```
src/
├── app.ts                      # Express app setup
├── server.ts                   # Server entry point
├── config/
│   ├── environment.ts          # Environment variables
│   └── prisma.ts               # Prisma client config
├── controllers/                # HTTP handlers
│   ├── organization.controller.ts
│   ├── property.controller.ts
│   └── __tests__/
├── repositories/               # Data access layer
│   ├── base.repository.ts      # Abstract base
│   ├── organization.repository.ts
│   └── __tests__/
├── services/                   # Business logic
│   ├── organization.service.ts
│   ├── auth.service.ts
│   └── __tests__/
├── routes/                     # Route definitions
│   ├── organization.routes.ts
│   ├── property.routes.ts
│   └── ...
├── validators/                 # Zod schemas
│   ├── organization.validators.ts
│   ├── property.validators.ts
│   └── ...
├── middleware/
│   ├── auth.middleware.ts      # JWT validation
│   ├── errorHandler.ts         # Global error handling
│   ├── rate-limit.middleware.ts
│   └── ...
├── shared/
│   ├── core/
│   │   ├── repository/         # Base repository
│   │   ├── pagination/         # Pagination DTOs
│   │   ├── filtering/          # Filtering utilities
│   │   ├── response/           # Response helpers
│   │   └── context/            # Context types
│   ├── constants/              # App constants
│   ├── validation/             # Shared validators
│   ├── types/                  # TypeScript types
│   └── utils/
├── utils/
│   ├── errors.ts               # Custom error classes
│   ├── logger.ts               # Structured logging
│   ├── validation.ts           # Validation middleware
│   └── ...
└── __tests__/
    └── e2e/                    # E2E tests
        ├── organization.e2e.test.ts
        └── property.e2e.test.ts
```

---

## Key Architecture Principles

### 1. **Layered Architecture**
- Clear separation between HTTP, business logic, and data access
- Each layer has specific responsibilities

### 2. **Tenant Isolation**
- Every request context includes `organizationId`
- Services enforce tenant isolation via `ensureOrganizationIsolation()`
- Repository queries are scoped to tenant

### 3. **Error Handling**
- Custom AppError subclasses for different scenarios
- Errors propagate up with status codes
- Global error handler formats responses

### 4. **Audit Trail**
- All entities track `createdBy`, `updatedBy`
- Timestamp fields: `createdAt`, `updatedAt`, `deletedAt`
- Soft deletes preserve data

### 5. **Validation**
- Zod schemas for all inputs (body, params, query)
- Validation middleware intercepts requests
- Type inference from schemas

### 6. **Logging**
- Structured logging at key operations
- Context includes operation details
- Different log levels for audit vs debugging

### 7. **Response Consistency**
- Unified response format via ApiResponse
- All responses include success flag and message
- Paginated endpoints include metadata

---

## How to Replicate for Property Domain

When implementing the Property domain (Phase 2), follow this checklist:

### 1. Prisma Schema
- [ ] Add Property model with organization scope
- [ ] Add Unit model as Property child
- [ ] Add Tenant model
- [ ] Add Lease model linking Unit + Tenant
- [ ] Use consistent field patterns (audit, soft-delete)

### 2. Repository Layer
- [ ] Create PropertyRepository extending BaseRepository
- [ ] Implement scoped queries (by organizationId)
- [ ] Add domain-specific query methods
- [ ] Add pagination support

### 3. Service Layer
- [ ] Create PropertyService with ActorContext
- [ ] Implement CRUD methods with validation
- [ ] Add tenant isolation checks
- [ ] Handle related entities (units, leases)
- [ ] Add audit logging

### 4. Controller Layer
- [ ] Create property.controller.ts handlers
- [ ] Use ApiResponse for responses
- [ ] Extract actor context from AuthenticatedRequest
- [ ] Wrap all handlers in try-catch

### 5. Validators
- [ ] Create property.validators.ts with Zod schemas
- [ ] Define createPropertySchema, updatePropertySchema, etc.
- [ ] Infer types from schemas

### 6. Routes
- [ ] Create property.routes.ts
- [ ] Apply requireAuth middleware
- [ ] Apply validate middleware
- [ ] Register with app in app.ts

### 7. Tests
- [ ] Create property.e2e.test.ts
- [ ] Test CRUD operations
- [ ] Test tenant isolation
- [ ] Test pagination

