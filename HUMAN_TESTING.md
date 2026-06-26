# Human Testing Guide - Sprint 2.8

This document provides step-by-step manual test cases for the Property Management API (Sprint 2.8 - Platform Readiness). Each test includes request examples, expected responses, and validation notes.

**API Base URL:** `http://localhost:5000`  
**API Version:** `/api/v1`  
**Documentation:** http://localhost:5000/api-docs (Swagger UI)

---

## Section 1: Health & Diagnostics

### Test 1.1: Basic Health Check
**Endpoint:** `GET /`  
**Auth:** None  
**Expected:** `200 OK`

```bash
curl http://localhost:5000/
```

Expected response:
```json
{
  "success": true,
  "message": "Property Management API is healthy",
  "data": {
    "status": "healthy",
    "environment": "development",
    "version": "1.0.0"
  }
}
```

### Test 1.2: Liveness Probe (Kubernetes)
**Endpoint:** `GET /health/live`  
**Auth:** None  
**Expected:** `200 OK`

```bash
curl http://localhost:5000/health/live
```

### Test 1.3: Readiness Probe
**Endpoint:** `GET /health/ready`  
**Auth:** None  
**Expected:** `200 OK` (when DB connected) or `503` (when DB down)

```bash
curl http://localhost:5000/health/ready
```

### Test 1.4: Detailed Health Information
**Endpoint:** `GET /health/detailed`  
**Auth:** None  
**Expected:** `200 OK`

```bash
curl http://localhost:5000/health/detailed
```

---

## Section 2: Authentication

### Test 2.1: Register New User
**Endpoint:** `POST /api/v1/auth/register`  
**Auth:** None  
**Expected:** `201 Created`

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "organizationName": "Acme Properties"
  }'
```

### Test 2.2: Login with Valid Credentials
**Endpoint:** `POST /api/v1/auth/login`  
**Auth:** None  
**Expected:** `200 OK`

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Test 2.3: Login with Invalid Credentials
**Endpoint:** `POST /api/v1/auth/login`  
**Auth:** None  
**Expected:** `401 Unauthorized`

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword123!"
  }'
```

### Test 2.4: Get Current User (Protected)
**Endpoint:** `GET /api/v1/auth/me`  
**Auth:** Bearer token required  
**Expected:** `200 OK`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test 2.5: Missing Authentication Header
**Endpoint:** `GET /api/v1/auth/me`  
**Auth:** None  
**Expected:** `401 Unauthorized`

```bash
curl http://localhost:5000/api/v1/auth/me
```

### Test 2.6: Refresh Token
**Endpoint:** `POST /api/v1/auth/refresh-token`  
**Auth:** None (uses refresh token)  
**Expected:** `200 OK`

```bash
REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIs..."
curl -X POST http://localhost:5000/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "'$REFRESH_TOKEN'"}'
```

### Test 2.7: Logout (Protected)
**Endpoint:** `POST /api/v1/auth/logout`  
**Auth:** Bearer token required  
**Expected:** `200 OK`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## Section 3: Organizations

### Test 3.1: List Organizations (Protected)
**Endpoint:** `GET /api/v1/organizations`  
**Auth:** Bearer token required  
**Expected:** `200 OK`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
curl http://localhost:5000/api/v1/organizations \
  -H "Authorization: Bearer $TOKEN"
```

### Test 3.2: Create Organization (Protected)
**Endpoint:** `POST /api/v1/organizations`  
**Auth:** Bearer token required  
**Expected:** `201 Created`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
curl -X POST http://localhost:5000/api/v1/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Skyline Properties"
  }'
```

### Test 3.3: Get Organization by ID (Protected)
**Endpoint:** `GET /api/v1/organizations/:organizationId`  
**Auth:** Bearer token required  
**Expected:** `200 OK`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
ORG_ID="org-uuid"
curl http://localhost:5000/api/v1/organizations/$ORG_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Test 3.4: Update Organization (Protected)
**Endpoint:** `PUT /api/v1/organizations/:organizationId`  
**Auth:** Bearer token required  
**Expected:** `200 OK`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
ORG_ID="org-uuid"
curl -X PUT http://localhost:5000/api/v1/organizations/$ORG_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Updated Name"}'
```

### Test 3.5: Delete Organization (Protected)
**Endpoint:** `DELETE /api/v1/organizations/:organizationId`  
**Auth:** Bearer token required  
**Expected:** `200 OK` (soft delete)

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
ORG_ID="org-uuid"
curl -X DELETE http://localhost:5000/api/v1/organizations/$ORG_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Test 3.6: Restore Deleted Organization (Protected)
**Endpoint:** `POST /api/v1/organizations/:organizationId/restore`  
**Auth:** Bearer token required  
**Expected:** `200 OK`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
ORG_ID="org-uuid"
curl -X POST http://localhost:5000/api/v1/organizations/$ORG_ID/restore \
  -H "Authorization: Bearer $TOKEN"
```

### Test 3.7: Cross-Organization Access Denied (Authorization)
**Endpoint:** `GET /api/v1/organizations/:organizationId`  
**Auth:** Bearer token from different organization  
**Expected:** `403 Forbidden`

A user should not be able to access organizations they don't belong to.

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."  # Token from User A in Organization X
ORG_ID="org-different"             # Organization Y ID
curl http://localhost:5000/api/v1/organizations/$ORG_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Section 4: Input Validation

### Test 4.1: Invalid Email Format
**Endpoint:** `POST /api/v1/auth/register`  
**Expected:** `400 Bad Request`

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "invalid-email",
    "password": "Password123!",
    "organizationName": "Test Org"
  }'
```

### Test 4.2: Weak Password
**Endpoint:** `POST /api/v1/auth/register`  
**Expected:** `400 Bad Request`

Password must have: 8+ characters, uppercase, lowercase, digit, special character

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "weak",
    "organizationName": "Test Org"
  }'
```

### Test 4.3: Duplicate Email Registration
**Endpoint:** `POST /api/v1/auth/register`  
**Expected:** `409 Conflict` (on second registration)

```bash
# First registration
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User One",
    "email": "duplicate@example.com",
    "password": "Password123!",
    "organizationName": "Org 1"
  }'

# Second registration with same email
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User Two",
    "email": "duplicate@example.com",
    "password": "Password123!",
    "organizationName": "Org 2"
  }'
```

### Test 4.4: Not Found Error
**Endpoint:** `GET /api/v1/organizations/invalid-id`  
**Auth:** Bearer token required  
**Expected:** `404 Not Found`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
curl http://localhost:5000/api/v1/organizations/invalid-id \
  -H "Authorization: Bearer $TOKEN"
```

---

## Section 5: Rate Limiting & Security

### Test 5.1: General Rate Limit
**Limit:** 100 requests per 15 minutes  
**Expected:** `429 Too Many Requests` after exceeding limit

```bash
# Make requests in rapid succession
for i in {1..105}; do
  curl http://localhost:5000/
done
```

### Test 5.2: Brute Force Protection
**Endpoint:** `POST /api/v1/auth/login`  
**Limit:** 5 failed attempts → 30 minute lockout  
**Expected:** `429 Too Many Requests` on 6th attempt

```bash
# Make 6 failed login attempts
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "john@example.com", "password": "WrongPassword123!"}'
done
```

---

## Section 6: API Documentation

### Test 6.1: Swagger UI
**Endpoint:** `GET /api-docs`  
**Expected:** Interactive HTML documentation

```bash
open http://localhost:5000/api-docs
```

Verify:
- All endpoints listed
- Try it out functionality works
- Request/response examples displayed

### Test 6.2: OpenAPI Specification
**Endpoint:** `GET /openapi.json`  
**Expected:** `200 OK` with valid JSON spec

```bash
curl http://localhost:5000/openapi.json | jq
```

Verify:
- Valid JSON structure
- All endpoints documented
- Authentication schema present
- Error responses defined
