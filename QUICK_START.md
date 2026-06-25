# Quick Start Guide - Phase 1 Foundation

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js v18+ 
- PostgreSQL database
- Git repository access

### Step 1: Clone and Setup
```bash
# Navigate to project directory
cd property-management-api

# Install dependencies
npm install

# Create environment file
cp .env.template .env

# Edit .env with your values
# Edit DATABASE_URL: postgresql://user:password@host:5432/dbname
# Edit JWT_SECRET: Generate strong random string
```

### Step 2: Database Setup
```bash
# Run migrations
npx prisma migrate deploy

# Optional: Generate Prisma client
npm run generate
```

### Step 3: Start Application
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm run build
npm start
```

**Expected output:**
```
Server running on port 5000
```

### Step 4: Test Endpoints

#### Health Check
```bash
curl http://localhost:5000
```

#### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Admin",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "organizationName": "Tech Corp"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid...",
    "name": "John Admin",
    "email": "john@example.com"
  },
  "organization": {
    "id": "uuid...",
    "name": "Tech Corp",
    "slug": "tech-corp"
  }
}
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

---

## 📁 Project Structure

```
src/
├── app.ts                    # Express app setup
├── server.ts                 # Server entry point
├── config/
│   ├── environment.ts        # Environment variables (typed)
│   └── prisma.ts            # Prisma client
├── controllers/
│   └── auth.controller.ts    # Auth endpoints
├── services/
│   ├── auth.service.ts       # Auth business logic
│   └── rbac.service.ts       # Role/permission definitions
├── repositories/
│   ├── base.repository.ts    # Generic CRUD
│   ├── user.repository.ts    # User queries
│   └── organization.repository.ts
├── middleware/
│   ├── auth.middleware.ts    # JWT validation
│   └── errorHandler.ts       # Global error handling
├── routes/
│   └── auth.routes.ts        # Auth endpoints
├── utils/
│   ├── logger.ts            # Structured logging
│   └── errors.ts            # Error classes
└── validators/
    └── [TODO: Phase 2]

prisma/
├── schema.prisma            # Database schema (minimized)
└── migrations/              # Database migrations

.env.template               # Environment template
tsconfig.json              # TypeScript config (strict mode)
package.json               # Dependencies
```

---

## 🔑 Core Concepts

### Authentication Flow
```
User Request (email, password)
    ↓
Controller validates input
    ↓
Service handles login logic
    ↓
Repository queries database
    ↓
Service generates JWT token
    ↓
Response with token + user + org
    ↓
Client stores token
    ↓
Client includes token in Authorization header for future requests
```

### Protected Endpoints (Phase 2)
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/properties
```

### Error Handling
All errors return consistent JSON:
```json
{
  "message": "Error description",
  "errors": {
    "field": ["Validation error"]
  }
}
```

---

## 📊 Database Schema

### Users
- Unique email
- Hashed password (bcrypt)
- Basic profile info

### Organizations
- Unique slug
- Associated users (many-to-many via OrganizationUser)

### Roles & Permissions
- Framework ready for Phase 2 RBAC
- Definitions prepared in rbac.service.ts

---

## 🧪 Testing

### Unit Tests (Phase 2)
```bash
npm run test
npm run test:watch
npm run test:coverage
```

### Manual Testing
Use provided Postman collection: `Property Management API.postman_collection.json`

---

## 🔍 Debugging

### Enable Debug Logging
```bash
# In .env
LOG_LEVEL=DEBUG
```

### View Logs
All logs output as JSON for easy parsing:
```json
{
  "timestamp": "2026-06-25T10:30:00Z",
  "level": "INFO",
  "message": "User logged in successfully",
  "data": { "userId": "uuid..." }
}
```

### Inspect Database
```bash
# Open Prisma Studio
npx prisma studio

# Or use psql
psql -h localhost -U user -d property_management_db
```

---

## ⚙️ Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| NODE_ENV | No | development \| production |
| PORT | No | 5000 |
| DATABASE_URL | ✅ Yes | postgresql://user:pass@localhost/db |
| JWT_SECRET | ✅ Yes | super-secret-key-change-in-prod |
| JWT_EXPIRES_IN | No | 8h |
| LOG_LEVEL | No | INFO \| DEBUG |
| CORS_ORIGIN | No | http://localhost:3000 |
| APP_NAME | No | Property Management API |
| APP_VERSION | No | 1.0.0 |

---

## 🚨 Common Issues

### Issue: "Cannot find module '@prisma/client'"
**Solution:**
```bash
npm install
npm run generate
```

### Issue: "ECONNREFUSED" on database connection
**Solution:**
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Verify database exists

### Issue: "JWT_SECRET not set"
**Solution:**
```bash
# In .env
JWT_SECRET=your-secret-key-here
```

### Issue: Migrations failed
**Solution:**
```bash
# Reset database (WARNING: deletes data!)
npx prisma migrate reset

# Or deploy specific migration
npx prisma migrate deploy
```

---

## 📚 Documentation Files

1. **ARCHITECTURE_PHASE1.md** - Architecture decisions and principles
2. **PHASE1_COMPLETION_REPORT.md** - Detailed completion report
3. **PHASE1_CHECKLIST.md** - Requirements verification checklist
4. **PHASE2_PLAN.md** - Next sprint planning
5. **This file** - Quick start guide

---

## 🎯 Phase 1 Status

- ✅ Application starts successfully
- ✅ Authentication working (register/login)
- ✅ Database schema minimized and clean
- ✅ Error handling in place
- ✅ Logging configured
- ✅ Ready for Phase 2

---

## 🔄 Next Steps

1. **Complete local setup** (follow steps above)
2. **Test all endpoints** (register, login)
3. **Verify error handling** (try invalid inputs)
4. **Review code structure** (understand layers)
5. **Approve architecture** (before Phase 2)
6. **Plan Phase 2** (refer to PHASE2_PLAN.md)

---

## 💡 Tips & Best Practices

### For Developers
- Follow the repository → service → controller pattern for new features
- Always use transactions for multi-model operations
- Use logger.* methods instead of console.log
- Keep controllers thin (just request/response handling)
- Keep repositories focused on data access only
- Write services that can be tested independently

### For Deployments
- Always backup database before migrations
- Test migrations on staging first
- Use strong JWT_SECRET in production
- Enable LOG_LEVEL=INFO or above in production
- Set NODE_ENV=production
- Monitor error logs regularly

### For Code Reviews
- Check error handling is consistent
- Verify all user inputs are validated
- Confirm no hardcoded secrets
- Review SQL/Prisma queries for efficiency
- Ensure TypeScript types are correct

---

## 📞 Support

For issues or questions:
1. Check relevant documentation file
2. Review error messages in logs
3. Check TypeScript compilation: `npm run lint`
4. Refer to inline code comments

---

**Ready to build? Start with `npm install` and follow the 5-minute setup! 🚀**
