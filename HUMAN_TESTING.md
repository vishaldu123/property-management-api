# Human Testing Guide - Sprint 4

This document provides step-by-step manual test cases for the Property Management API (Sprint 4 - Enterprise RBAC). Each test includes request examples, expected responses, and validation notes.

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

## Section 4: Organization Settings (Sprint 3)

### Test 4.1: Get Organization Settings
**Endpoint:** `GET /api/v1/organizations/:organizationId/settings`  
**Auth:** Bearer token required  
**Expected:** `200 OK`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
ORG_ID="123e4567-e89b-12d3-a456-426614174000"

curl http://localhost:5000/api/v1/organizations/$ORG_ID/settings \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationId": "123e4567-e89b-12d3-a456-426614174000",
    "timezone": "UTC",
    "currency": "USD",
    "dateFormat": "YYYY-MM-DD",
    "timeFormat": "HH:mm:ss",
    "language": "en",
    "measurementUnit": "metric",
    "createdAt": "2026-06-26T12:00:00Z",
    "updatedAt": "2026-06-26T12:00:00Z"
  }
}
```

### Test 4.2: Update Organization Settings
**Endpoint:** `PUT /api/v1/organizations/:organizationId/settings`  
**Auth:** Bearer token required  
**Expected:** `200 OK`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
ORG_ID="123e4567-e89b-12d3-a456-426614174000"

curl -X PUT http://localhost:5000/api/v1/organizations/$ORG_ID/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "timezone": "America/New_York",
    "currency": "USD",
    "dateFormat": "MM-DD-YYYY",
    "timeFormat": "HH:mm",
    "language": "en",
    "measurementUnit": "imperial"
  }'
```

### Test 4.3: Settings Validation - Invalid Timezone Format
**Endpoint:** `PUT /api/v1/organizations/:organizationId/settings`  
**Expected:** `400 Bad Request`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
ORG_ID="123e4567-e89b-12d3-a456-426614174000"

curl -X PUT http://localhost:5000/api/v1/organizations/$ORG_ID/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "timezone": "Invalid/Timezone"
  }'
```

### Test 4.4: Cross-Organization Settings Access (Authorization)
**Endpoint:** `GET /api/v1/organizations/:organizationId/settings`  
**Auth:** Bearer token from different organization  
**Expected:** `403 Forbidden`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."          # From Organization A
ORG_ID="org-different-id"               # From Organization B
curl http://localhost:5000/api/v1/organizations/$ORG_ID/settings \
  -H "Authorization: Bearer $TOKEN"
```

---

## Section 5: Organization Branding (Sprint 3)

### Test 5.1: Get Organization Branding
**Endpoint:** `GET /api/v1/organizations/:organizationId/branding`  
**Auth:** Bearer token required  
**Expected:** `200 OK`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
ORG_ID="123e4567-e89b-12d3-a456-426614174000"

curl http://localhost:5000/api/v1/organizations/$ORG_ID/branding \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationId": "123e4567-e89b-12d3-a456-426614174000",
    "logoUrl": "https://example.com/logo.png",
    "logoAltText": "My Organization Logo",
    "faviconUrl": "https://example.com/favicon.ico",
    "primaryColor": "#0066CC",
    "secondaryColor": "#FFFFFF",
    "accentColor": "#FF6B35",
    "theme": "light",
    "customCss": "body { font-family: Arial; }",
    "createdAt": "2026-06-26T12:00:00Z",
    "updatedAt": "2026-06-26T12:00:00Z"
  }
}
```

### Test 5.2: Update Organization Branding
**Endpoint:** `PUT /api/v1/organizations/:organizationId/branding`  
**Auth:** Bearer token required  
**Expected:** `200 OK`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
ORG_ID="123e4567-e89b-12d3-a456-426614174000"

curl -X PUT http://localhost:5000/api/v1/organizations/$ORG_ID/branding \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "primaryColor": "#0066CC",
    "secondaryColor": "#F0F0F0",
    "accentColor": "#FF6B35",
    "theme": "dark"
  }'
```

### Test 5.3: Color Validation - Invalid Hex Format
**Endpoint:** `PUT /api/v1/organizations/:organizationId/branding`  
**Expected:** `400 Bad Request`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
ORG_ID="123e4567-e89b-12d3-a456-426614174000"

curl -X PUT http://localhost:5000/api/v1/organizations/$ORG_ID/branding \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "primaryColor": "red"
  }'
```

Expected error response:
```json
{
  "success": false,
  "error": "Invalid color format. Use hex format (e.g., #000000)"
}
```

---

## Section 6: Organization Preferences (Sprint 3)

### Test 6.1: Get Organization Preferences
**Endpoint:** `GET /api/v1/organizations/:organizationId/preferences`  
**Auth:** Bearer token required  
**Expected:** `200 OK`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
ORG_ID="123e4567-e89b-12d3-a456-426614174000"

curl http://localhost:5000/api/v1/organizations/$ORG_ID/preferences \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationId": "123e4567-e89b-12d3-a456-426614174000",
    "emailNotifications": true,
    "emailDigest": "daily",
    "twoFactorAuth": false,
    "dataRetention": 90,
    "backupFrequency": "weekly",
    "createdAt": "2026-06-26T12:00:00Z",
    "updatedAt": "2026-06-26T12:00:00Z"
  }
}
```

### Test 6.2: Update Organization Preferences
**Endpoint:** `PUT /api/v1/organizations/:organizationId/preferences`  
**Auth:** Bearer token required  
**Expected:** `200 OK`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
ORG_ID="123e4567-e89b-12d3-a456-426614174000"

curl -X PUT http://localhost:5000/api/v1/organizations/$ORG_ID/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emailNotifications": false,
    "emailDigest": "weekly",
    "twoFactorAuth": true,
    "dataRetention": 180,
    "backupFrequency": "daily"
  }'
```

### Test 6.3: Data Retention Validation
**Endpoint:** `PUT /api/v1/organizations/:organizationId/preferences`  
**Expected:** `400 Bad Request` (values outside 1-3650 range)

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
ORG_ID="123e4567-e89b-12d3-a456-426614174000"

# Invalid: dataRetention = 5000 (exceeds max of 3650)
curl -X PUT http://localhost:5000/api/v1/organizations/$ORG_ID/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dataRetention": 5000
  }'
```

### Test 6.4: Persistent Preferences Update
**Endpoint:** `PUT /api/v1/organizations/:organizationId/preferences` (multiple updates)  
**Expected:** `200 OK` with previous values maintained

Verify that updating one field doesn't reset others to defaults:

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
ORG_ID="123e4567-e89b-12d3-a456-426614174000"

# First update: disable email notifications
curl -X PUT http://localhost:5000/api/v1/organizations/$ORG_ID/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emailNotifications": false}'

# Second update: enable 2FA
# Should still have emailNotifications = false
curl -X PUT http://localhost:5000/api/v1/organizations/$ORG_ID/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"twoFactorAuth": true}'

# Verify: GET should show both changes persisted
curl http://localhost:5000/api/v1/organizations/$ORG_ID/preferences \
  -H "Authorization: Bearer $TOKEN"
```

### Test 6.5: Cross-Organization Preferences Access (Authorization)
**Endpoint:** `GET /api/v1/organizations/:organizationId/preferences`  
**Auth:** Bearer token from different organization  
**Expected:** `403 Forbidden`

```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."          # From Organization A
ORG_ID="org-different-id"               # From Organization B
curl http://localhost:5000/api/v1/organizations/$ORG_ID/preferences \
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

---

## Section 7: Enterprise RBAC (Sprint 4)

### Prerequisites
- Valid JWT token with organization scope (see Section 2: Authentication)
- Organization ID for testing
- Postman or curl for testing

### Test 7.1: Create Permission
**Endpoint:** `POST /api/v1/rbac/permissions`  
**Auth:** Required (Bearer token)  
**Expected:** `201 Created`

```bash
curl -X POST http://localhost:5000/api/v1/rbac/permissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "property:read",
    "description": "View property details"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Permission created successfully",
  "data": {
    "id": "uuid",
    "organizationId": "uuid",
    "key": "property:read",
    "description": "View property details",
    "createdAt": "2025-06-26T...",
    "createdBy": "user-id"
  }
}
```

### Test 7.2: List Permissions with Pagination
**Endpoint:** `GET /api/v1/rbac/permissions?page=1&limit=10`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X GET "http://localhost:5000/api/v1/rbac/permissions?page=1&limit=10&sort=createdAt:desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 7.3: Create Role
**Endpoint:** `POST /api/v1/rbac/roles`  
**Auth:** Required  
**Expected:** `201 Created`

```bash
curl -X POST http://localhost:5000/api/v1/rbac/roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "property_manager",
    "name": "Property Manager",
    "description": "Manages properties and tenants"
  }'
```

### Test 7.4: Assign Permission to Role
**Endpoint:** `POST /api/v1/rbac/roles/:roleId/permissions`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X POST http://localhost:5000/api/v1/rbac/roles/ROLE_UUID/permissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionId": "PERMISSION_UUID"
  }'
```

### Test 7.5: Assign Multiple Permissions to Role
**Endpoint:** `POST /api/v1/rbac/roles/:roleId/permissions/bulk`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X POST http://localhost:5000/api/v1/rbac/roles/ROLE_UUID/permissions/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionIds": [
      "PERMISSION_UUID_1",
      "PERMISSION_UUID_2"
    ]
  }'
```

### Test 7.6: Assign Role to User
**Endpoint:** `POST /api/v1/rbac/users/roles`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X POST http://localhost:5000/api/v1/rbac/users/roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_UUID",
    "roleId": "ROLE_UUID"
  }'
```

### Test 7.7: Get User Roles
**Endpoint:** `GET /api/v1/rbac/users/:userId/roles`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X GET http://localhost:5000/api/v1/rbac/users/USER_UUID/roles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "message": "User roles retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "organizationId": "uuid",
      "userId": "uuid",
      "roleId": "uuid",
      "assignedAt": "2025-06-26T...",
      "assignedBy": "user-id",
      "role": {
        "id": "uuid",
        "key": "property_manager",
        "name": "Property Manager",
        "description": "Manages properties and tenants"
      }
    }
  ]
}
```

### Test 7.8: Get User Permissions (Aggregated)
**Endpoint:** `GET /api/v1/rbac/users/:userId/permissions`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X GET http://localhost:5000/api/v1/rbac/users/USER_UUID/permissions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response shows all permissions inherited from all assigned roles, deduplicated.

### Test 7.9: Clone Role
**Endpoint:** `POST /api/v1/rbac/roles/:roleId/clone`  
**Auth:** Required  
**Expected:** `201 Created`

```bash
curl -X POST http://localhost:5000/api/v1/rbac/roles/ORIGINAL_ROLE_UUID/clone \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "custom_property_manager",
    "name": "Custom Property Manager"
  }'
```

### Test 7.10: Replace User Roles (Update All)
**Endpoint:** `PUT /api/v1/rbac/users/roles`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X PUT http://localhost:5000/api/v1/rbac/users/roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_UUID",
    "roleIds": [
      "ROLE_UUID_1",
      "ROLE_UUID_2"
    ]
  }'
```

### Test 7.11: Remove Permission from Role
**Endpoint:** `DELETE /api/v1/rbac/roles/:roleId/permissions?permissionId=PERMISSION_UUID`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X DELETE "http://localhost:5000/api/v1/rbac/roles/ROLE_UUID/permissions?permissionId=PERMISSION_UUID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 7.12: Remove Role from User
**Endpoint:** `DELETE /api/v1/rbac/users/:userId/roles?roleId=ROLE_UUID`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X DELETE "http://localhost:5000/api/v1/rbac/users/USER_UUID/roles?roleId=ROLE_UUID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 7.13: Search Permissions
**Endpoint:** `GET /api/v1/rbac/permissions?search=property`  
**Auth:** Required  
**Expected:** `200 OK` with filtered results

```bash
curl -X GET "http://localhost:5000/api/v1/rbac/permissions?search=property&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 7.14: Error Handling - Invalid Permission Format
**Endpoint:** `POST /api/v1/rbac/permissions`  
**Auth:** Required  
**Expected:** `400 Bad Request`

```bash
curl -X POST http://localhost:5000/api/v1/rbac/permissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "invalid_permission_format"
  }'
```

Expected response shows validation error about permission key format (must be `resource:action`).

### Test 7.15: Error Handling - Duplicate Role
**Endpoint:** `POST /api/v1/rbac/roles`  
**Auth:** Required  
**Expected:** `400 Bad Request`

```bash
curl -X POST http://localhost:5000/api/v1/rbac/roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "property_manager",
    "name": "Property Manager (Duplicate)"
  }'
```

Expected response shows error about role key already existing.
