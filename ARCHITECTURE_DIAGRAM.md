# 📊 PHASE 1 VISUAL ARCHITECTURE DIAGRAM

## Application Stack Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Web/Mobile)                       │
│                   HTTP/REST Requests                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   LAYER 1: ROUTING                           │
├─────────────────────────────────────────────────────────────┤
│  Express Router → Route matching → Middleware pipeline      │
│                                                              │
│  GET  /                          → Health check             │
│  POST /api/auth/register         → Register endpoint        │
│  POST /api/auth/login            → Login endpoint           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              LAYER 2: MIDDLEWARE CHAIN                       │
├─────────────────────────────────────────────────────────────┤
│  1. express.json() - Parse JSON                             │
│  2. requireAuth() - Validate JWT (protected routes)         │
│  3. [Route handler] - Delegate to controller                │
│  4. globalErrorHandler() - Catch errors (last middleware)   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              LAYER 3: CONTROLLERS                            │
├─────────────────────────────────────────────────────────────┤
│  AuthController                                              │
│  ├─ register(req, res)  → Parse request → Call authService │
│  └─ login(req, res)     → Parse request → Call authService │
│                                                              │
│  Responsibility: Request/Response handling only             │
│  Tech: Express Request/Response objects                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              LAYER 4: SERVICES                               │
├─────────────────────────────────────────────────────────────┤
│  AuthService                                                │
│  ├─ register(payload)                                       │
│  │  ├─ Validate email unique                               │
│  │  ├─ Hash password with bcrypt                           │
│  │  ├─ Create user, org, membership (transaction)          │
│  │  └─ Generate JWT token                                  │
│  ├─ login(payload)                                          │
│  │  ├─ Find user by email                                  │
│  │  ├─ Verify password                                     │
│  │  ├─ Generate JWT token                                  │
│  │  └─ Return user + org info                              │
│                                                              │
│  RBACService                                                │
│  ├─ rolePermissionMap (definitions)                         │
│  └─ getRolePermissions(role)                                │
│                                                              │
│  Responsibility: Business logic, orchestration              │
│  Tech: Classes with methods, dependency injection           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           LAYER 5: REPOSITORIES (Data Access)               │
├─────────────────────────────────────────────────────────────┤
│  BaseRepository<T>                                           │
│  ├─ findById(id): Promise<T | null>                         │
│  ├─ findAll(skip, take): Promise<T[]>                       │
│  ├─ create(data): Promise<T>                                │
│  ├─ update(id, data): Promise<T>                            │
│  └─ delete(id): Promise<boolean>                            │
│                                                              │
│  UserRepository extends BaseRepository<User>                │
│  ├─ Inherits CRUD operations                               │
│  ├─ findByEmail(email): Promise<User | null>                │
│  └─ findWithMemberships(id): Promise<User + orgs>           │
│                                                              │
│  OrganizationRepository extends BaseRepository<Organization>│
│  ├─ findBySlug(slug): Promise<Org | null>                   │
│  └─ findWithUsers(id): Promise<Org + users>                 │
│                                                              │
│  Responsibility: Prisma isolation, query building           │
│  Tech: Prisma client, generic types                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            LAYER 6: INFRASTRUCTURE                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ Environment Config                                      │
│  │  ├─ DATABASE_URL (PostgreSQL connection)                 │
│  │  ├─ JWT_SECRET (authentication)                          │
│  │  ├─ PORT (server port)                                   │
│  │  └─ LOG_LEVEL (logging verbosity)                        │
│  │                                                           │
│  ├─ Logger                                                   │
│  │  ├─ debug(), info(), warn(), error()                     │
│  │  └─ JSON output with timestamps                          │
│  │                                                           │
│  ├─ Error Classes                                            │
│  │  ├─ AppError (base)                                      │
│  │  ├─ ValidationError (400)                                │
│  │  ├─ UnauthorizedError (401)                              │
│  │  ├─ ForbiddenError (403)                                 │
│  │  └─ NotFoundError (404)                                  │
│  │                                                           │
│  └─ Prisma Client                                            │
│     └─ Single connection to PostgreSQL                      │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL                                                  │
│  ├─ User table (email unique, password hashed)              │
│  ├─ Organization table (slug unique)                        │
│  ├─ OrganizationUser table (join table)                     │
│  ├─ Role table (RBAC framework)                             │
│  ├─ Permission table (RBAC framework)                       │
│  └─ RolePermission table (join table)                       │
│                                                              │
│  Transactions support atomic operations                     │
│  Foreign keys with cascading deletes                        │
│  Indexes on frequently queried fields                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Request Flow: User Registration

```
1. CLIENT sends POST /api/auth/register
   {
     "name": "John",
     "email": "john@example.com",
     "password": "SecurePass123",
     "organizationName": "Tech Corp"
   }
                ↓
2. EXPRESS Router matches /api/auth/register
                ↓
3. MIDDLEWARE chain
   - express.json() parses body ✓
   - requireAuth() skipped (not protected)
                ↓
4. CONTROLLER authController.register()
   - Validates required fields
   - Calls authService.register(payload)
                ↓
5. SERVICE authService.register()
   - Checks email unique via userRepository
   - Hashes password with bcrypt
   - Creates transaction:
     a. Create User
     b. Create Organization
     c. Create OrganizationUser (OWNER role)
   - Generates JWT token
   - Returns AuthResponse
                ↓
6. REPOSITORY userRepository.findByEmail()
   - Queries Prisma User model
   - Returns User or null
                ↓
7. DATABASE PostgreSQL
   - SELECT * FROM "User" WHERE email = ?
   - INSERT INTO "User" (...)
   - INSERT INTO "Organization" (...)
   - INSERT INTO "OrganizationUser" (...)
                ↓
8. RESPONSE sent to CLIENT
   {
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": {
       "id": "uuid",
       "name": "John",
       "email": "john@example.com"
     },
     "organization": {
       "id": "uuid",
       "name": "Tech Corp",
       "slug": "tech-corp"
     }
   }
```

---

## Request Flow: Protected Request (Phase 2 Example)

```
1. CLIENT sends GET /api/properties
   Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
                ↓
2. EXPRESS Router matches /api/properties
                ↓
3. MIDDLEWARE chain
   - express.json() parses body ✓
   - requireAuth() validates JWT ✓
     - Extracts token from Authorization header
     - Verifies signature with JWT_SECRET
     - Decodes payload (userId, organizationId)
     - Injects req.user = { userId, organizationId }
   - Continues to route handler
                ↓
4. CONTROLLER propertyController.list()
   - Access req.user.organizationId
   - Calls propertyService.list(organizationId)
                ↓
5. SERVICE propertyService.list()
   - Calls propertyRepository.findByOrganization()
                ↓
6. REPOSITORY propertyRepository
   - Queries: SELECT * FROM "Property" 
              WHERE organizationId = ?
   - Returns Property[]
                ↓
7. RESPONSE sent to CLIENT
   [
     {
       "id": "uuid",
       "name": "Building A",
       ...
     }
   ]
```

---

## Error Handling Flow

```
ANY LAYER throws Error
      ↓
Error bubbles up to Express middleware
      ↓
globalErrorHandler middleware catches it
      ↓
TYPE CHECK
├─ AppError type? → Use statusCode
├─ ValidationError type? → Return validation response
├─ UnauthorizedError type? → Return 401
├─ ForbiddenError type? → Return 403
├─ JWT error? → Return 401
└─ Unknown error → Return 500

      ↓
LOG error with context
      ↓
SEND JSON response
{
  "message": "Error description",
  "errors": { "field": ["Validation error"] }
}
```

---

## TypeScript Type Flow

```
Request Input
  ↓
Controller validates & parses
  ↓
Service receives typed payload
  ├─ Interface: RegisterPayload
  └─ Return type: Promise<AuthResponse>
  ↓
Service calls repository
  ├─ Generic: BaseRepository<User>
  └─ Return type: Promise<User | null>
  ↓
Database returns data
  ↓
Response sent to client
  └─ Fully typed: JSON serializable

Result: NO implicit any, full type safety ✅
```

---

## Module Organization

```
src/
├── app.ts (Express setup)
├── server.ts (Entry point)
│
├── controllers/
│   └── auth.controller.ts
│       ├─ register(req, res)
│       └─ login(req, res)
│
├── services/
│   ├── auth.service.ts
│   │   ├─ register(payload): AuthResponse
│   │   └─ login(payload): AuthResponse
│   └── rbac.service.ts
│       ├─ rolePermissionMap
│       └─ getRolePermissions(role)
│
├── repositories/
│   ├── base.repository.ts
│   │   ├─ findById()
│   │   ├─ findAll()
│   │   ├─ create()
│   │   ├─ update()
│   │   └─ delete()
│   ├── user.repository.ts
│   │   ├─ findByEmail()
│   │   └─ findWithMemberships()
│   └── organization.repository.ts
│       ├─ findBySlug()
│       └─ findWithUsers()
│
├── middleware/
│   ├── auth.middleware.ts
│   │   └─ requireAuth()
│   └── errorHandler.ts
│       └─ globalErrorHandler()
│
├── routes/
│   └── auth.routes.ts
│       ├─ POST /register
│       └─ POST /login
│
├── utils/
│   ├── logger.ts
│   │   ├─ debug()
│   │   ├─ info()
│   │   ├─ warn()
│   │   └─ error()
│   └── errors.ts
│       ├─ AppError
│       ├─ ValidationError
│       ├─ UnauthorizedError
│       ├─ ForbiddenError
│       └─ NotFoundError
│
└── config/
    ├── environment.ts
    │   └─ config object (typed)
    └── prisma.ts
        └─ prisma client instance
```

---

## Dependencies Between Layers

```
Controllers
    ↓ depends on
Services
    ↓ depends on
Repositories
    ↓ depends on
Prisma (ORM)
    ↓ depends on
PostgreSQL (Database)

Middleware is independent
Config is independent
Utils are independent

This is UNIDIRECTIONAL ✅
- Controllers cannot call Repositories directly
- Controllers cannot call Prisma directly
- Ensures clean separation
```

---

## Extension Pattern for Phase 2

When adding a new module (e.g., Property):

```
1. ADD TO DATABASE
   → Update prisma/schema.prisma
   → Create migration

2. CREATE REPOSITORY
   → src/repositories/property.repository.ts
   → Extend BaseRepository<Property>
   → Add custom queries

3. CREATE SERVICE
   → src/services/property.service.ts
   → Inject repository
   → Implement business logic

4. CREATE CONTROLLER
   → src/controllers/property.controller.ts
   → Inject service
   → Handle HTTP requests

5. CREATE ROUTES
   → src/routes/property.routes.ts
   → Use controller
   → Define endpoints

6. MOUNT ROUTES
   → src/app.ts
   → app.use('/api/properties', propertyRoutes)

7. ADD AUTHORIZATION
   → src/middleware/auth.middleware.ts
   → authorize() middleware
   → Check permissions

Result: Module follows same pattern ✅
```

---

**This architecture ensures scalability, testability, and maintainability as the application grows.**
