# Human Testing Guide - Sprint 4 + Sprint UI-1 + Sprint UI-3

This document provides step-by-step manual test cases for the Property Management API (Sprint 4 - Enterprise RBAC) and Frontend (Sprint UI-1 - React Foundation, Sprint UI-3 - Property, Unit & Tenant Management). Each test includes request examples, expected responses, and validation notes.

**Backend API Base URL:** `http://localhost:3000`  
**Backend API Version:** `/api/v1`  
**Backend Documentation:** http://localhost:3000/api-docs (Swagger UI)  
**Frontend URL:** `http://localhost:5173`

---

## Frontend Testing Guide

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Section 0: Frontend General Tests

#### Test 0.1: Home Page Load
- **URL:** `http://localhost:5173/`
- **Expected:** Home landing page loads with Property Management header and navigation links
- **Validation:**
  - ✓ Page title shows "Property Management - Enterprise SaaS"
  - ✓ Navigation shows "Sign In" and "Get Started" buttons
  - ✓ Hero section displays with features list
  - ✓ All links are clickable

#### Test 0.2: Navigation When Not Authenticated
- **Expected:** Unauthenticated users see login/register options
- **Validation:**
  - ✓ Can access `/` (home)
  - ✓ Can access `/login`
  - ✓ Can access `/register`
  - ✓ Can access `/forgot-password`
  - ✓ Cannot access `/dashboard`, `/profile`, or `/settings`
  - ✓ Attempting to access protected routes redirects to `/login`

#### Test 0.3: Theme Switching
- **Location:** Top navigation bar
- **Expected:** Dark/Light theme toggle works
- **Validation:**
  - ✓ Click sun/moon icon to toggle theme
  - ✓ Theme preference persists on page refresh
  - ✓ All components properly styled in both themes

#### Test 0.4: 404 Page
- **URL:** `http://localhost:5173/nonexistent-page`
- **Expected:** 404 page displays
- **Validation:**
  - ✓ Page shows "Page Not Found" message
  - ✓ "Go to Home" button is clickable
  - ✓ Button redirects to home page

### Section 0.5: Authentication Flow Tests

#### Test 0.5.1: User Registration
- **URL:** `http://localhost:5173/register`
- **Steps:**
  1. Fill in all fields (first name, last name, email, password, confirm password)
  2. Click "Create Account"
- **Expected:** User is created and redirected to dashboard
- **Validation:**
  - ✓ Form validation prevents empty fields
  - ✓ Password and confirm password must match
  - ✓ Email format is validated
  - ✓ Password must be at least 8 characters
  - ✓ Success redirects to dashboard
  - ✓ Error messages display for invalid submissions

#### Test 0.5.2: User Login
- **URL:** `http://localhost:5173/login`
- **Steps:**
  1. Enter registered email
  2. Enter correct password
  3. Click "Sign In"
- **Expected:** User is logged in and redirected to dashboard
- **Validation:**
  - ✓ Form validation prevents empty fields
  - ✓ Invalid credentials show error message
  - ✓ Successful login stores tokens in localStorage
  - ✓ User is redirected to dashboard
  - ✓ Dashboard displays logged-in user's name

#### Test 0.5.3: Forgot Password Flow
- **URL:** `http://localhost:5173/forgot-password`
- **Steps:**
  1. Enter email address
  2. Click "Send Reset Link"
- **Expected:** Confirmation message appears
- **Validation:**
  - ✓ Form validates email format
  - ✓ Success shows "Check Your Email" message
  - ✓ Message indicates reset link has been sent

#### Test 0.5.4: Reset Password (if backend implements it)
- **URL:** `http://localhost:5173/reset-password?token=<token>`
- **Steps:**
  1. Enter new password
  2. Confirm password
  3. Click "Reset Password"
- **Expected:** Password is reset and user can login with new password
- **Validation:**
  - ✓ Passwords must match
  - ✓ Password must be 8+ characters
  - ✓ Success message appears
  - ✓ User can login with new password

#### Test 0.5.5: Logout
- **Location:** User menu (top right)
- **Steps:**
  1. Click user profile button
  2. Click "Logout"
- **Expected:** User is logged out and redirected to login
- **Validation:**
  - ✓ Tokens are cleared from localStorage
  - ✓ User is redirected to login page
  - ✓ Cannot access protected pages after logout

### Section 0.6: Dashboard & Protected Pages

#### Test 0.6.1: Dashboard Access
- **URL:** `http://localhost:5173/dashboard` (when logged in)
- **Expected:** Dashboard displays with user information and stats
- **Validation:**
  - ✓ Sidebar navigation is visible
  - ✓ Top navigation shows theme switcher and user menu
  - ✓ Welcome message displays user's first name
  - ✓ Stats cards display (all show 0 initially)
  - ✓ Quick start guide is visible

#### Test 0.6.2: Sidebar Navigation
- **Expected:** Sidebar shows all navigation items
- **Validation:**
  - ✓ Dashboard link is present and highlighted when on dashboard
  - ✓ Profile link navigates to profile page
  - ✓ Settings link navigates to settings page
  - ✓ Logout button is present
  - ✓ Links highlight current page
  - ✓ Sidebar is responsive (collapses on mobile)

#### Test 0.6.3: Profile Page
- **URL:** `http://localhost:5173/profile` (when logged in)
- **Expected:** Profile page displays user information
- **Validation:**
  - ✓ Personal information section shows user details
  - ✓ First name, last name, email, display name all displayed
  - ✓ User roles section shows assigned roles
  - ✓ Organizations section shows organizations user belongs to
  - ✓ Page is protected (redirects to login if not authenticated)

#### Test 0.6.4: Settings Page
- **URL:** `http://localhost:5173/settings` (when logged in)
- **Expected:** Settings page displays options
- **Validation:**
  - ✓ Account settings section is present
  - ✓ Privacy & Security section is present
  - ✓ Notifications section is present
  - ✓ Data & Privacy section is present
  - ✓ Page is protected (redirects to login if not authenticated)

### Section 0.7: Protected Routes & Access Control

#### Test 0.7.1: Protected Route Redirect
- **Steps:**
  1. Logout or ensure not authenticated
  2. Try to access `/dashboard`
- **Expected:** User is redirected to login page
- **Validation:**
  - ✓ Cannot access protected pages without authentication
  - ✓ Redirect happens automatically
  - ✓ Can login and access protected pages

#### Test 0.7.2: Forbidden Page
- **URL:** `http://localhost:5173/forbidden` (after logout or as unauthorized user)
- **Expected:** Forbidden page displays
- **Validation:**
  - ✓ Page shows "Access Denied" message
  - ✓ Message explains lack of permission
  - ✓ "Go to Home" button redirects to home

### Section 0.8: Error Handling

#### Test 0.8.1: Form Validation Errors
- **URL:** `http://localhost:5173/login`
- **Steps:**
  1. Leave email empty and try to submit
  2. Leave password empty and try to submit
  3. Enter invalid email format
- **Expected:** Error messages appear below invalid fields
- **Validation:**
  - ✓ Required field errors show when empty
  - ✓ Email format error shows for invalid emails
  - ✓ Password requirement errors show
  - ✓ Error messages are clear and helpful

#### Test 0.8.2: API Error Handling
- **URL:** `http://localhost:5173/login`
- **Steps:**
  1. Enter invalid credentials
  2. Submit login form
- **Expected:** Error alert appears
- **Validation:**
  - ✓ Error message displays in alert
  - ✓ Message is user-friendly
  - ✓ Form remains filled (doesn't reset)
  - ✓ User can retry

#### Test 0.8.3: Network Error Handling
- **Steps:**
  1. Stop backend API (`Ctrl+C` from backend terminal)
  2. Try to login or perform any API operation
- **Expected:** Error state displays
- **Validation:**
  - ✓ Error message indicates connection issue
  - ✓ Application doesn't crash
  - ✓ User can still navigate
  - ✓ When backend restarts, operations work again

### Section 0.9: Responsive Design

#### Test 0.9.1: Mobile Layout
- **Device:** Mobile phone or browser window < 640px
- **Steps:**
  1. Resize browser to mobile width
  2. Navigate through pages
- **Expected:** Layout adjusts properly
- **Validation:**
  - ✓ Sidebar collapses on mobile
  - ✓ Navigation remains accessible via hamburger menu
  - ✓ All content is readable
  - ✓ Buttons and inputs are touch-friendly
  - ✓ Cards stack vertically

#### Test 0.9.2: Tablet Layout
- **Device:** Tablet or browser window 640px - 1024px
- **Expected:** Intermediate layout displays
- **Validation:**
  - ✓ Layout is optimized for tablet size
  - ✓ Content is well-distributed
  - ✓ Navigation is accessible

#### Test 0.9.3: Desktop Layout
- **Device:** Desktop or browser window > 1024px
- **Expected:** Full layout displays
- **Validation:**
  - ✓ Sidebar is always visible
  - ✓ Full width is utilized
  - ✓ All content is properly aligned

---

## Backend API Testing Guide

**API Base URL:** `http://localhost:3000`  
**API Version:** `/api/v1`  
**Documentation:** http://localhost:3000/api-docs (Swagger UI)

---

## Section 1: Health & Diagnostics

### Test 1.1: Basic Health Check
**Endpoint:** `GET /`  
**Auth:** None  
**Expected:** `200 OK`

```bash
curl http://localhost:3000/
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

---

## Section 8: Property Domain Testing (Sprint 5)

### Setup: Authenticate and Get Tokens
```bash
# Register user (if not already registered)
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "property-test@example.com",
    "password": "SecurePass123!",
    "organizationName": "Test Property Company"
  }'

# Login to get token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "property-test@example.com",
    "password": "SecurePass123!"
  }'

# Extract token from response and save as YOUR_TOKEN
```

### Test 8.1: Create Property
**Endpoint:** `POST /api/v1/properties`  
**Auth:** Required  
**Expected:** `201 Created`

```bash
curl -X POST http://localhost:5000/api/v1/properties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Office Tower",
    "code": "DT-OFFICE-001",
    "description": "Modern office building with 24/7 security",
    "propertyType": "Commercial",
    "status": "Active",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timezone": "America/New_York",
    "totalUnits": 150,
    "yearBuilt": 2020,
    "notes": "Premium location in financial district"
  }'
```

**Validation:**
- ✓ Response status: `201 Created`
- ✓ Response includes property `id` (UUID)
- ✓ All fields are returned in response
- ✓ `organizationId` matches authenticated user's organization
- ✓ `createdBy` is set to authenticated user's ID
- ✓ `deletedAt` is null
- ✓ `status` defaults to "Draft" if not provided

### Test 8.2: Get Property by ID
**Endpoint:** `GET /api/v1/properties/{id}`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
# Use the property ID from Test 8.1 response
curl -X GET "http://localhost:5000/api/v1/properties/PROPERTY_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validation:**
- ✓ Response status: `200 OK`
- ✓ Returns complete property object
- ✓ All fields match created property
- ✓ Cannot access properties from other organizations

### Test 8.3: Update Property
**Endpoint:** `PUT /api/v1/properties/{id}`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X PUT "http://localhost:5000/api/v1/properties/PROPERTY_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Inactive",
    "totalUnits": 160,
    "notes": "Recently renovated units"
  }'
```

**Validation:**
- ✓ Response status: `200 OK`
- ✓ Returns updated property object
- ✓ Only specified fields are updated
- ✓ `updatedBy` is set to current user
- ✓ `updatedAt` timestamp is current

### Test 8.4: List Properties with Pagination
**Endpoint:** `GET /api/v1/properties?page=1&limit=10`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X GET "http://localhost:5000/api/v1/properties?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validation:**
- ✓ Response status: `200 OK`
- ✓ Returns array of properties in `data` field
- ✓ `meta` object includes: `page`, `limit`, `total`, `totalPages`, `hasNextPage`, `hasPreviousPage`
- ✓ Properties are organization-scoped
- ✓ Soft-deleted properties not included (unless specifically requested)

### Test 8.5: Search Properties
**Endpoint:** `GET /api/v1/properties?search=Downtown`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X GET "http://localhost:5000/api/v1/properties?search=Downtown&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validation:**
- ✓ Response status: `200 OK`
- ✓ Searches by property name, code, and city
- ✓ Returns only matching properties
- ✓ Search is case-insensitive

### Test 8.6: Filter by Property Status
**Endpoint:** `GET /api/v1/properties?status=Active`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X GET "http://localhost:5000/api/v1/properties?status=Active&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validation:**
- ✓ Response status: `200 OK`
- ✓ Returns only properties with matching status
- ✓ Valid statuses: Draft, Active, Inactive, Archived

### Test 8.7: Filter by Property Type
**Endpoint:** `GET /api/v1/properties?propertyType=Commercial`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X GET "http://localhost:5000/api/v1/properties?propertyType=Commercial&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validation:**
- ✓ Response status: `200 OK`
- ✓ Returns only properties matching type
- ✓ Valid types: Apartment, Villa, Commercial, Office, Retail, Warehouse, Mixed Use, Land

### Test 8.8: Filter by Country
**Endpoint:** `GET /api/v1/properties?country=USA`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X GET "http://localhost:5000/api/v1/properties?country=USA&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validation:**
- ✓ Response status: `200 OK`
- ✓ Returns only properties from specified country

### Test 8.9: Sort Properties
**Endpoint:** `GET /api/v1/properties?sortBy=name&sortOrder=asc`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X GET "http://localhost:5000/api/v1/properties?sortBy=name&sortOrder=asc&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validation:**
- ✓ Response status: `200 OK`
- ✓ Valid sortBy values: createdAt, name, status, propertyType
- ✓ Valid sortOrder: asc, desc
- ✓ Properties returned in correct order

### Test 8.10: Get Property Statistics
**Endpoint:** `GET /api/v1/properties/stats`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X GET "http://localhost:5000/api/v1/properties/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validation:**
- ✓ Response status: `200 OK`
- ✓ Returns `total` count of properties
- ✓ Returns `byStatus` breakdown (e.g., {Draft: 2, Active: 5})
- ✓ Returns `byType` breakdown (e.g., {Commercial: 3, Apartment: 4})
- ✓ Statistics are organization-scoped

### Test 8.11: Delete Property (Soft Delete)
**Endpoint:** `DELETE /api/v1/properties/{id}`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X DELETE "http://localhost:5000/api/v1/properties/PROPERTY_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validation:**
- ✓ Response status: `200 OK`
- ✓ Property is soft-deleted (deletedAt set to current timestamp)
- ✓ GET request to deleted property returns `404`
- ✓ Property still exists in database but not visible in queries

### Test 8.12: Restore Deleted Property
**Endpoint:** `PATCH /api/v1/properties/{id}/restore`  
**Auth:** Required  
**Expected:** `200 OK`

```bash
curl -X PATCH "http://localhost:5000/api/v1/properties/DELETED_PROPERTY_ID/restore" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Validation:**
- ✓ Response status: `200 OK`
- ✓ Returns restored property object
- ✓ `deletedAt` is set back to null
- ✓ Property is now visible in list queries again

### Test 8.13: Validation - Duplicate Code
**Endpoint:** `POST /api/v1/properties`  
**Auth:** Required  
**Expected:** `409 Conflict`

```bash
curl -X POST http://localhost:5000/api/v1/properties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another Office",
    "code": "DT-OFFICE-001",
    "propertyType": "Commercial",
    "address": "456 Oak Ave",
    "city": "Boston",
    "state": "MA",
    "country": "USA",
    "postalCode": "02101"
  }'
```

**Validation:**
- ✓ Response status: `409 Conflict`
- ✓ Error message indicates code already exists
- ✓ Error is organization-scoped (same code allowed in different org)

### Test 8.14: Validation - Invalid Coordinates
**Endpoint:** `POST /api/v1/properties`  
**Auth:** Required  
**Expected:** `400 Bad Request`

```bash
curl -X POST http://localhost:5000/api/v1/properties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid Coordinates",
    "code": "INVALID-001",
    "propertyType": "Commercial",
    "address": "789 Elm St",
    "city": "Chicago",
    "state": "IL",
    "country": "USA",
    "postalCode": "60601",
    "latitude": 95.0,
    "longitude": -74.0
  }'
```

**Validation:**
- ✓ Response status: `400 Bad Request`
- ✓ Error indicates latitude must be between -90 and 90
- ✓ Validation errors include field names and messages

### Test 8.15: Validation - Invalid Property Type
**Endpoint:** `POST /api/v1/properties`  
**Auth:** Required  
**Expected:** `400 Bad Request`

```bash
curl -X POST http://localhost:5000/api/v1/properties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bad Type",
    "code": "BAD-001",
    "propertyType": "Mansion",
    "address": "000 Zero Ln",
    "city": "Lost",
    "state": "LA",
    "country": "USA",
    "postalCode": "00000"
  }'
```

**Validation:**
- ✓ Response status: `400 Bad Request`
- ✓ Error indicates "Mansion" is not a valid property type
- ✓ Valid types listed in error message: Apartment, Villa, Commercial, Office, Retail, Warehouse, Mixed Use, Land

### Test 8.16: Organization Isolation
**Endpoint:** `GET /api/v1/properties`  
**Auth:** Required (as different user in different org)  
**Expected:** `200 OK` (empty list or different properties)

```bash
# Login as user from different organization
curl -X GET "http://localhost:5000/api/v1/properties" \
  -H "Authorization: Bearer OTHER_ORG_TOKEN"
```

**Validation:**
- ✓ Response status: `200 OK`
- ✓ Returns only properties from user's organization
- ✓ Cannot see properties from other organizations
- ✓ Cannot access other org's property directly by ID

---

## Sprint UI-3: Property, Unit & Tenant Management

This section covers the new frontend features for managing Properties, Units, and Tenants.

### Section 10: Property Management UI

#### Test 10.1: Navigate to Properties List
- **URL:** `http://localhost:5173/properties`
- **Expected:** Properties list page loads with table
- **Validation:**
  - ✓ Page shows "Properties" header
  - ✓ Table displays existing properties
  - ✓ Search box is available
  - ✓ Filter dropdowns for status and type are present
  - ✓ "New Property" button is visible for authorized users

#### Test 10.2: Create Property (with Permission)
- **URL:** `http://localhost:5173/properties/create`
- **Steps:**
  1. Fill in property details (name, code, type, address, city, state, country, postal code)
  2. Click "Create Property"
- **Expected:** Property is created and user is redirected to property list
- **Validation:**
  - ✓ Form validation prevents empty required fields
  - ✓ Success message shows "Property created successfully"
  - ✓ New property appears in the list

#### Test 10.3: View Property Details
- **URL:** `http://localhost:5173/properties/:id`
- **Expected:** Property details page displays all information
- **Validation:**
  - ✓ Property name, code, and type are shown
  - ✓ Location information is displayed
  - ✓ Edit and Delete buttons are available for authorized users
  - ✓ Soft-deleted properties show restore button

#### Test 10.4: Edit Property
- **URL:** `http://localhost:5173/properties/:id/edit`
- **Steps:**
  1. Modify property details
  2. Click "Update Property"
- **Expected:** Property is updated successfully
- **Validation:**
  - ✓ Form pre-fills with existing property data
  - ✓ Changes are saved to backend
  - ✓ User is redirected to property details

#### Test 10.5: Delete Property (Soft Delete)
- **Location:** Property Details page
- **Steps:**
  1. Click "Delete" button
  2. Confirm deletion in dialog
- **Expected:** Property is soft-deleted
- **Validation:**
  - ✓ Yellow warning banner appears saying "This property has been deleted"
  - ✓ "Restore" button replaces "Delete" button
  - ✓ Property can still be viewed but is marked as deleted

#### Test 10.6: Restore Deleted Property
- **Location:** Property Details page (deleted property)
- **Steps:**
  1. Click "Restore" button
- **Expected:** Property is restored
- **Validation:**
  - ✓ Warning banner disappears
  - ✓ Delete button reappears
  - ✓ deletedAt timestamp is cleared

#### Test 10.7: Search Properties
- **Location:** Properties List page
- **Steps:**
  1. Type property name or code in search box
  2. List updates automatically
- **Expected:** Only matching properties are shown
- **Validation:**
  - ✓ Search is case-insensitive
  - ✓ Results update in real-time
  - ✓ Pagination resets to page 1

#### Test 10.8: Filter Properties by Status
- **Location:** Properties List page
- **Steps:**
  1. Select status from dropdown (Active, Draft, Inactive, Archived)
  2. List updates
- **Expected:** Only properties with selected status shown
- **Validation:**
  - ✓ Status badges are color-coded
  - ✓ Filter works in combination with search

#### Test 10.9: Property Pagination
- **Location:** Properties List page
- **Steps:**
  1. Scroll to bottom
  2. Click "Next" button
- **Expected:** Next page of properties loads
- **Validation:**
  - ✓ Previous/Next buttons are enabled/disabled appropriately
  - ✓ Page counter shows correct range
  - ✓ 10 properties per page (default)

### Section 11: Unit Management UI

#### Test 11.1: Navigate to Units List
- **URL:** `http://localhost:5173/units`
- **Expected:** Units list page loads with table
- **Validation:**
  - ✓ Table displays unit number, type, status, bedrooms, rent
  - ✓ Search and filter options available
  - ✓ "New Unit" button visible for authorized users

#### Test 11.2: Create Unit
- **URL:** `http://localhost:5173/units/create`
- **Steps:**
  1. Select property from dropdown
  2. Enter unit number (e.g., "101")
  3. Select unit type (Apartment, Villa, etc.)
  4. Fill in specifications (bedrooms, bathrooms, area)
  5. Fill in rental information (rent amount, security deposit)
  6. Click "Create Unit"
- **Expected:** Unit is created successfully
- **Validation:**
  - ✓ Property selector shows all available properties
  - ✓ Unit number must be unique per property
  - ✓ Form validation works for required fields
  - ✓ Success message appears

#### Test 11.3: View Unit Details
- **URL:** `http://localhost:5173/units/:id`
- **Expected:** Unit details page displays comprehensive information
- **Validation:**
  - ✓ Unit specifications are shown (bedrooms, bathrooms, area)
  - ✓ Financial information displayed (rent, deposit)
  - ✓ Property reference shown
  - ✓ Current availability status visible

#### Test 11.4: Edit Unit
- **URL:** `http://localhost:5173/units/:id/edit`
- **Steps:**
  1. Update unit status to "Occupied"
  2. Click "Update Unit"
- **Expected:** Unit status is updated
- **Validation:**
  - ✓ Form shows current unit data
  - ✓ All fields are editable
  - ✓ Changes persist after save

#### Test 11.5: Filter Units by Status
- **Location:** Units List page
- **Steps:**
  1. Select "Occupied" from status dropdown
- **Expected:** Only occupied units displayed
- **Validation:**
  - ✓ Status colors are consistent (Green=Available, Blue=Occupied, etc.)
  - ✓ Filter combines with property filter if applicable

#### Test 11.6: Search Units
- **Location:** Units List page
- **Steps:**
  1. Type "101" in search box
- **Expected:** Units matching search term appear
- **Validation:**
  - ✓ Search works on unit number and name
  - ✓ Results are instant

### Section 12: Tenant Management UI

#### Test 12.1: Navigate to Tenants List
- **URL:** `http://localhost:5173/tenants`
- **Expected:** Tenants list page loads with table
- **Validation:**
  - ✓ Table shows name, email, phone, status
  - ✓ Search and filter available
  - ✓ "New Tenant" button visible

#### Test 12.2: Create Tenant
- **URL:** `http://localhost:5173/tenants/create`
- **Steps:**
  1. Enter first name and last name
  2. Enter email address
  3. Enter phone number (optional)
  4. Select status (Active, Prospect, etc.)
  5. Optionally assign to unit
  6. Fill in optional fields (ID type, emergency contact, etc.)
  7. Click "Create Tenant"
- **Expected:** Tenant is created
- **Validation:**
  - ✓ Email must be unique per organization
  - ✓ Email format is validated
  - ✓ Required fields (name, email) are enforced
  - ✓ Tenant can be created without unit assignment

#### Test 12.3: View Tenant Details
- **URL:** `http://localhost:5173/tenants/:id`
- **Expected:** Tenant details page shows complete information
- **Validation:**
  - ✓ Personal information displayed
  - ✓ Government ID details shown
  - ✓ Employment information visible
  - ✓ Emergency contact information shown
  - ✓ Status badge color-coded

#### Test 12.4: Edit Tenant
- **URL:** `http://localhost:5173/tenants/:id/edit`
- **Steps:**
  1. Change tenant status to "Notice"
  2. Assign to a unit
  3. Click "Update Tenant"
- **Expected:** Tenant is updated
- **Validation:**
  - ✓ All fields can be updated
  - ✓ Unit assignment can be changed
  - ✓ Status change is reflected immediately

#### Test 12.5: Assign Unit to Tenant
- **Location:** Tenant Create/Edit form
- **Steps:**
  1. Click unit dropdown
  2. Select a unit
- **Expected:** Unit is assigned to tenant
- **Validation:**
  - ✓ Only available units shown
  - ✓ Unit selector shows unit number and floor

#### Test 12.6: Filter Tenants by Status
- **Location:** Tenants List page
- **Steps:**
  1. Select "Active" from status dropdown
- **Expected:** Only active tenants shown
- **Validation:**
  - ✓ Statuses: Prospect (blue), Active (green), Notice (yellow), Former (gray), Blacklisted (red)
  - ✓ Filter is applied immediately

#### Test 12.7: Search Tenants
- **Location:** Tenants List page
- **Steps:**
  1. Type tenant name or email in search box
- **Expected:** Matching tenants displayed
- **Validation:**
  - ✓ Search works on first name, last name, and email
  - ✓ Search is case-insensitive

### Section 13: RBAC Integration Tests

#### Test 13.1: Permission Checks - Create Property
- **Prerequisite:** User without `property:create` permission
- **Expected:** "New Property" button is hidden
- **Validation:**
  - ✓ Button not visible in UI
  - ✓ Cannot access `/properties/create` directly (returns 403 or redirects)

#### Test 13.2: Permission Checks - Edit Unit
- **Prerequisite:** User without `unit:update` permission
- **Expected:** "Edit" button is hidden on unit details
- **Validation:**
  - ✓ Edit button not visible
  - ✓ Cannot access `/units/:id/edit` directly

#### Test 13.3: Permission Checks - Delete Tenant
- **Prerequisite:** User without `tenant:delete` permission
- **Expected:** "Delete" button is hidden on tenant details
- **Validation:**
  - ✓ Delete button not visible
  - ✓ Soft-delete via API is prevented with 403 error

#### Test 13.4: Admin User Full Access
- **Prerequisite:** User with admin role (all permissions)
- **Expected:** All CRUD buttons visible
- **Validation:**
  - ✓ Create buttons visible on all list pages
  - ✓ Edit buttons visible on all detail pages
  - ✓ Delete buttons visible on all detail pages

### Section 14: Error Handling and Edge Cases

#### Test 14.1: Invalid Form Submission
- **Location:** Property Create form
- **Steps:**
  1. Leave required fields empty
  2. Click "Create Property"
- **Expected:** Form validation errors appear
- **Validation:**
  - ✓ Red error messages for empty required fields
  - ✓ Form doesn't submit
  - ✓ Errors clear when field is corrected

#### Test 14.2: Duplicate Unit Number
- **Location:** Unit Create form
- **Steps:**
  1. Select a property
  2. Enter a unit number that already exists for that property
  3. Click "Create Unit"
- **Expected:** API error is handled gracefully
- **Validation:**
  - ✓ Toast notification shows error message
  - ✓ Form remains populated with data

#### Test 14.3: Network Error Handling
- **Prerequisite:** Disconnect network or mock network error
- **Steps:**
  1. Try to load properties list
- **Expected:** Error state is displayed
- **Validation:**
  - ✓ Error message is user-friendly
  - ✓ Retry option available or page can be reloaded

#### Test 14.4: Pagination Edge Cases
- **Location:** Properties List with 25 properties
- **Steps:**
  1. Navigate to last page
  2. Try to click "Next"
- **Expected:** "Next" button is disabled
- **Validation:**
  - ✓ Button appears grayed out
  - ✓ No additional page loads

---

## Testing Complete

All Property, Unit, and Tenant management features are now verified. Sprint UI-3 is ready for production.

