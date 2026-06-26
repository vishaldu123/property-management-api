# Shared Infrastructure Documentation

## Overview

The shared infrastructure module provides production-ready, reusable components for the Property Management SaaS platform. It follows Clean Architecture and SOLID principles.

## Module Structure

```
src/shared/
├── constants/              # Application constants
├── exceptions/             # Custom exception classes
├── types/                  # TypeScript interfaces
├── utils/                  # Utility functions
│   ├── uuid.generator.ts   # UUID generation
│   ├── security.util.ts    # Password & token utilities
│   ├── date.util.ts        # Date utilities
│   ├── query.util.ts       # Query helpers (pagination, sorting, search)
│   └── validation.util.ts  # Validation helpers
├── core/
│   ├── response/           # API response formatter
│   ├── pagination/         # Pagination DTOs and logic
│   ├── filtering/          # Filter builder
│   ├── repository/         # Base repository class
│   └── context/            # Request context manager
├── logger/                 # Structured logging
├── validation/             # Centralized Zod schemas
└── database/               # (Prepared for future use)
```

## Key Components

### 1. Constants (APP_CONSTANTS)

Centralized configuration for the application:

```typescript
import { APP_CONSTANTS } from '@/shared';

// Access constants
APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT // 10
APP_CONSTANTS.STATUS.ACTIVE             // 'ACTIVE'
APP_CONSTANTS.HTTP_STATUS.OK            // 200
APP_CONSTANTS.MESSAGE.SUCCESS           // 'Operation successful'
```

### 2. Exception Classes

Custom exceptions with standardized structure:

```typescript
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ValidationException
} from '@/shared';

throw new NotFoundException('User');
throw new BadRequestException('Invalid input');
throw new ValidationException({ email: ['Invalid format'] });
```

### 3. Response Module

Unified API response format:

```typescript
import { ApiResponse } from '@/shared';

// Success response
ApiResponse.success(res, data, 'User created', 201);

// Paginated response
ApiResponse.paginated(res, users, meta, 'Users retrieved');

// Error response
ApiResponse.error(res, 'User not found', 404);

// Validation error
ApiResponse.validationError(res, { email: ['Required'] });
```

### 4. Pagination Module

Type-safe pagination with search and sorting:

```typescript
import { PaginationRequest, PaginationResponse } from '@/shared';

// Create pagination request
const pagination = new PaginationRequest(
  page = 1,
  limit = 10,
  sort = 'createdAt',
  order = 'desc',
  search = 'john'
);

// Use in repository
const response = await userRepository.paginate(pagination, { deletedAt: null });

// Response includes metadata
response.data // []
response.meta // { page, limit, total, totalPages, hasNextPage, hasPreviousPage }
```

### 5. Filtering Module

Generic filtering with operators:

```typescript
import { FilterBuilder } from '@/shared';

const filters = FilterBuilder.parseFilterString(
  'status:eq:ACTIVE,createdAt:gte:2024-01-01'
);

const whereClause = FilterBuilder.buildWhereClause(filters);
// { status: 'ACTIVE', createdAt: { gte: Date } }
```

### 6. Base Repository

Reusable CRUD operations with soft delete:

```typescript
import { BaseRepository } from '@/shared';
import { PrismaClient } from '@prisma/client';

class UserRepository extends BaseRepository<User> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'User'); // Model name
  }
}

const repo = new UserRepository(prisma);

// CRUD operations
await repo.findById(id);
await repo.findAll();
await repo.create({ email: 'user@example.com' });
await repo.update(id, { name: 'Updated' });
await repo.delete(id);

// Soft delete
await repo.softDelete(id);
await repo.restore(id);
await repo.permanentlyDelete(id);

// Pagination
const result = await repo.paginate(pagination, { status: 'ACTIVE' });
```

### 7. Request Context

Store user, organization, and request info:

```typescript
import { RequestContextManager, requestContextMiddleware } from '@/shared';

// In middleware
app.use(requestContextMiddleware);

// Access context anywhere
const userId = RequestContextManager.getUserId();
const organizationId = RequestContextManager.getOrganizationId();
const requestId = RequestContextManager.getRequestId();
```

### 8. Logger Service

Structured logging with request context:

```typescript
import { LoggerService, loggerMiddleware } from '@/shared';

// Initialize
LoggerService.initialize();

// Use in middleware
app.use(loggerMiddleware);

// Log with context
LoggerService.info('User created', { userId, email });
LoggerService.error('Database error', error, { query });
LoggerService.warn('High response time', { duration: 1500 });
```

### 9. UUID Generator

Secure UUID generation:

```typescript
import { UUIDGenerator } from '@/shared';

const id = UUIDGenerator.generate();                    // Random UUID v4
const namespaced = UUIDGenerator.generateNamespaced('user@example.com');
const valid = UUIDGenerator.validate(id);
```

### 10. Security Utilities

Password and token utilities:

```typescript
import { PasswordUtil, TokenUtil } from '@/shared';

// Password
const hashed = await PasswordUtil.hash('password123');
const matches = await PasswordUtil.compare('password123', hashed);
const validation = PasswordUtil.validateStrength('password123');

// Token
const token = TokenUtil.generateSecureToken(32);
const hash = TokenUtil.hashToken(token);
const verified = TokenUtil.verifyToken(token, hash);
```

### 11. Date Utilities

Date manipulation and timezone support:

```typescript
import { DateUtil } from '@/shared';

const now = DateUtil.now();                              // Current time
const future = DateUtil.add(new Date(), 7, 'day');      // Add 7 days
const expiry = DateUtil.parseExpiry('7d');               // Parse JWT expiry
const isPast = DateUtil.isExpired(expiresAt);           // Check expiry
const days = DateUtil.daysUntil(date);                   // Days remaining
```

### 12. Pagination Utilities

Helper functions for pagination:

```typescript
import { PaginationUtil, SearchUtil, SortUtil } from '@/shared';

// Pagination
const meta = PaginationUtil.calculateMeta(1, 10, 100);  // Calculate metadata
const skip = PaginationUtil.calculateSkip(2, 10);       // Get skip value (10)

// Search
const query = SearchUtil.buildSearchQuery('john', ['name', 'email']);

// Sort
const order = SortUtil.buildSortOrder('name', 'asc');
```

### 13. Validation Module

Centralized Zod schemas:

```typescript
import { ValidationSchemas, validate, validateOrThrow } from '@/shared';
import { z } from 'zod';

// Use predefined schemas
const createUserSchema = z.object({
  email: ValidationSchemas.email,
  password: ValidationSchemas.password,
  name: ValidationSchemas.name,
});

// Validate
const result = validate(data, createUserSchema);
if (result.success) {
  // result.data is typed
}

// Or throw on error
const validated = validateOrThrow(data, createUserSchema);
```

## Audit Fields

Every entity should include audit fields:

```typescript
interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdBy: string;
  updatedBy: string;
}
```

These are automatically populated by the BaseRepository:
- `createdBy` and `updatedBy` from `RequestContextManager.getUserId()`
- `createdAt` set on creation
- `updatedAt` updated on modification
- `deletedAt` set when soft deleted

## Soft Delete

Entities support logical deletion:

```typescript
// Soft delete (sets deletedAt)
await repo.softDelete(id);

// Find only active entities
const active = await repo.findAll({ deletedAt: null });

// Find deleted entities
const deleted = await repo.findDeleted();

// Restore
await repo.restore(id);

// Permanently delete
await repo.permanentlyDelete(id);
```

## Request Context Propagation

Request context is automatically set for each request and accessible throughout the request lifecycle:

```typescript
// Middleware sets context
app.use(requestContextMiddleware);

// Access in services/repositories
const userId = RequestContextManager.getUserId();
const orgId = RequestContextManager.getOrganizationId();

// Logged in all log entries automatically
LoggerService.info('Action performed'); // Includes requestId, userId, orgId
```

## Best Practices

1. **Always use BaseRepository** for CRUD operations
2. **Use ApiResponse** for all HTTP responses
3. **Throw custom exceptions** instead of generic errors
4. **Use ValidationSchemas** for input validation
5. **Access context via RequestContextManager** not req.user
6. **Use DateUtil** for all date operations
7. **Log important operations** with LoggerService
8. **Use PaginationRequest** for list endpoints
9. **Implement soft delete** in all entities
10. **Include audit fields** in all models

## Migration to Shared Infrastructure

When building new modules:

1. Create repository extending BaseRepository
2. Use ValidationSchemas for input validation
3. Throw custom exceptions for errors
4. Use ApiResponse for HTTP responses
5. Log operations using LoggerService
6. Include request context in operations

## Example Module Usage

```typescript
// Repository
class UserRepository extends BaseRepository<User> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'User');
  }
}

// Service
class UserService {
  private repo: UserRepository;

  async getUsers(pagination: PaginationRequest) {
    return this.repo.paginate(pagination, { deletedAt: null });
  }

  async createUser(data: unknown) {
    const validated = validateOrThrow(data, createUserSchema);
    try {
      return await this.repo.create(validated);
    } catch (error) {
      throw new ConflictException('User already exists');
    }
  }
}

// Controller
async (req: Request, res: Response) => {
  try {
    const pagination = new PaginationRequest(
      req.query.page,
      req.query.limit,
      req.query.sort,
      req.query.order
    );
    const result = await userService.getUsers(pagination);
    ApiResponse.paginated(res, result.data, result.meta);
  } catch (error) {
    LoggerService.error('Get users failed', error);
    ApiResponse.error(res, 'Internal error', 500);
  }
}
```

## Production Checklist

- ✅ All exceptions properly typed
- ✅ Request context available everywhere
- ✅ Logging includes request ID
- ✅ Audit fields present on all entities
- ✅ Soft delete implemented
- ✅ Pagination with search and sort
- ✅ Validation on all inputs
- ✅ Response format standardized
- ✅ Error messages consistent
- ✅ No direct database access outside repositories
