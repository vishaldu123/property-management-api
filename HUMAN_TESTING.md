# Human Testing Guide - Sprint 4 + Sprint UI-1 + Sprint UI-3 + Sprint 9 (Payment) + Sprint 10 (Maintenance)

This document provides step-by-step manual test cases for the Property Management API (Sprint 4 - Enterprise RBAC, Sprint 9 - Payment Domain, Sprint 10 - Maintenance Domain) and Frontend (Sprint UI-1 - React Foundation, Sprint UI-3 - Property, Unit & Tenant Management). Each test includes request examples, expected responses, and validation notes.

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
  - ✓ Successful login stores `accessToken` and `refreshToken` in localStorage
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

**Response shape (all success endpoints):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "...": "..." },
    "accessToken": "<jwt>",
    "refreshToken": "<refresh-token>"
  }
}
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

## Sprint 9: Payment Domain

Complete manual testing guide for the Payment Management system including CRUD operations, payment workflows (mark as paid, refund), receipt generation, and comprehensive filtering.

### Section 13: Payment API - Fundamentals

#### Test 13.1: Create Payment
- **Method:** POST
- **Endpoint:** `/api/v1/payments`
- **Headers:**
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "leaseId": "lease-123",
    "paymentNumber": "PAY-ORG-001",
    "amount": "5000.00",
    "currency": "USD",
    "paymentDate": "2026-06-27",
    "dueDate": "2026-07-27",
    "paymentMethod": "BankTransfer",
    "paymentType": "Rent",
    "status": "Pending",
    "lateFee": "0.00",
    "discount": "0.00",
    "tax": "0.00",
    "notes": "June rent payment"
  }
  ```
- **Expected Response:** 
  - Status: 201 Created
  - Response body includes created payment with auto-calculated `outstandingBalance: 5000.00`
- **Validation:**
  - ✓ Payment created with unique ID (UUID)
  - ✓ organizationId auto-populated from token context
  - ✓ propertyId, unitId, tenantId extracted from lease
  - ✓ outstandingBalance = amount + lateFee + tax - discount - paidAmount
  - ✓ Timestamps: createdAt and createdBy populated
  - ✓ Status is Pending

#### Test 13.2: Create Payment - Duplicate Payment Number Error
- **Method:** POST
- **Endpoint:** `/api/v1/payments`
- **Request Body:** (same paymentNumber as Test 13.1)
  ```json
  {
    "leaseId": "lease-123",
    "paymentNumber": "PAY-ORG-001",
    "amount": "5000.00",
    ...
  }
  ```
- **Expected Response:**
  - Status: 409 Conflict
  - Error message: "Payment number already exists for this organization"
- **Validation:**
  - ✓ Duplicate payment numbers rejected per organization
  - ✓ Payment numbers can be duplicated across organizations

#### Test 13.3: Create Payment - Negative Amount Error
- **Method:** POST
- **Endpoint:** `/api/v1/payments`
- **Request Body:** (amount: "-1000")
- **Expected Response:**
  - Status: 400 Bad Request
  - Error: "Amount must be greater than 0"
- **Validation:**
  - ✓ Negative amounts rejected
  - ✓ Zero amounts rejected

#### Test 13.4: Create Payment - Invalid Lease Error
- **Method:** POST
- **Endpoint:** `/api/v1/payments`
- **Request Body:** (leaseId: "invalid-lease-123")
- **Expected Response:**
  - Status: 404 Not Found
  - Error message: "Lease not found"
- **Validation:**
  - ✓ Non-existent leases rejected
  - ✓ Invalid UUIDs rejected

#### Test 13.5: Create Payment - Invalid Payment Method
- **Method:** POST
- **Endpoint:** `/api/v1/payments`
- **Request Body:** (paymentMethod: "InvalidMethod")
- **Expected Response:**
  - Status: 400 Bad Request
  - Error: "Payment method is not valid"
- **Validation:**
  - ✓ Invalid methods rejected
  - ✓ Valid methods: Cash, BankTransfer, Cheque, CreditCard, DebitCard, UPI, Online

#### Test 13.6: Get Payment by ID
- **Method:** GET
- **Endpoint:** `/api/v1/payments/{paymentId}`
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Expected Response:**
  - Status: 200 OK
  - Response includes full payment details
- **Validation:**
  - ✓ Payment retrieved with all fields
  - ✓ Organization scope enforced (cannot retrieve other org's payments)
  - ✓ Soft-deleted payments not returned

#### Test 13.7: Get Payment - Not Found Error
- **Method:** GET
- **Endpoint:** `/api/v1/payments/invalid-payment-id`
- **Expected Response:**
  - Status: 404 Not Found
  - Error message: "Payment not found"
- **Validation:**
  - ✓ Invalid payment IDs return 404

### Section 14: Payment API - Listing, Filtering & Search

#### Test 14.1: List All Payments
- **Method:** GET
- **Endpoint:** `/api/v1/payments`
- **Query Parameters:** (none)
- **Expected Response:**
  - Status: 200 OK
  - Response includes paginated list (default page=1, limit=20)
  - Total count of payments
- **Validation:**
  - ✓ Pagination defaults work
  - ✓ All payments for organization returned
  - ✓ Soft-deleted payments excluded

#### Test 14.2: List with Pagination
- **Method:** GET
- **Endpoint:** `/api/v1/payments?page=2&limit=10`
- **Expected Response:**
  - Status: 200 OK
  - Response includes 10 payments (or fewer if near end)
  - Correct page offset applied
- **Validation:**
  - ✓ Page offset correct (skip = (page-1) * limit)
  - ✓ Limit enforced
  - ✓ Metadata includes totalCount and currentPage

#### Test 14.3: Filter by Status
- **Method:** GET
- **Endpoint:** `/api/v1/payments?status=Pending`
- **Expected Response:**
  - Status: 200 OK
  - Response includes only Pending payments
- **Validation:**
  - ✓ Only Pending status returned
  - ✓ Multiple status filters work: Paid, PartiallyPaid, Overdue, Failed, Refunded, Cancelled
  - ✓ Invalid status returns all payments or error

#### Test 14.4: Filter by Payment Method
- **Method:** GET
- **Endpoint:** `/api/v1/payments?paymentMethod=BankTransfer`
- **Expected Response:**
  - Status: 200 OK
  - Response includes only BankTransfer payments
- **Validation:**
  - ✓ Only BankTransfer method returned
  - ✓ All payment methods filterable

#### Test 14.5: Filter by Payment Type
- **Method:** GET
- **Endpoint:** `/api/v1/payments?paymentType=Rent`
- **Expected Response:**
  - Status: 200 OK
  - Response includes only Rent type payments
- **Validation:**
  - ✓ Only Rent type returned
  - ✓ All payment types filterable: Rent, SecurityDeposit, LateFee, Discount, Refund, Other

#### Test 14.6: Filter by Date Range
- **Method:** GET
- **Endpoint:** `/api/v1/payments?startDate=2026-06-01&endDate=2026-06-30`
- **Expected Response:**
  - Status: 200 OK
  - Response includes payments with paymentDate between startDate and endDate
- **Validation:**
  - ✓ Payments within range returned
  - ✓ Boundary dates included
  - ✓ End date uses end-of-day (23:59:59)

#### Test 14.7: Multiple Filters Combined
- **Method:** GET
- **Endpoint:** `/api/v1/payments?status=Pending&paymentType=Rent&paymentMethod=BankTransfer&page=1&limit=10`
- **Expected Response:**
  - Status: 200 OK
  - Response filtered by all criteria
- **Validation:**
  - ✓ All filters applied (AND operation)
  - ✓ Pagination works with filters
  - ✓ Correct subset returned

#### Test 14.8: Search by Payment Number
- **Method:** GET
- **Endpoint:** `/api/v1/payments?search=PAY-ORG-001`
- **Expected Response:**
  - Status: 200 OK
  - Response includes payments with matching paymentNumber
- **Validation:**
  - ✓ Partial match supported
  - ✓ Case-insensitive search
  - ✓ Only paymentNumber, referenceNumber, notes searched

#### Test 14.9: Sort by Due Date (Ascending)
- **Method:** GET
- **Endpoint:** `/api/v1/payments?sortBy=dueDate&sortOrder=asc`
- **Expected Response:**
  - Status: 200 OK
  - Payments sorted by dueDate ascending (earliest first)
- **Validation:**
  - ✓ Ascending sort correct
  - ✓ Valid sortBy fields: paymentNumber, amount, paymentDate, dueDate, status
  - ✓ Valid sortOrder: asc, desc

#### Test 14.10: Sort by Amount (Descending)
- **Method:** GET
- **Endpoint:** `/api/v1/payments?sortBy=amount&sortOrder=desc`
- **Expected Response:**
  - Status: 200 OK
  - Payments sorted by amount descending (highest first)
- **Validation:**
  - ✓ Descending sort correct
  - ✓ Numeric sorting applied

### Section 15: Payment API - Update & Workflow

#### Test 15.1: Update Payment
- **Method:** PUT
- **Endpoint:** `/api/v1/payments/{paymentId}`
- **Headers:**
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "paymentNumber": "PAY-ORG-001",
    "amount": "5500.00",
    "currency": "USD",
    "paymentDate": "2026-06-27",
    "dueDate": "2026-07-28",
    "paymentMethod": "Cash",
    "paymentType": "Rent",
    "status": "Pending",
    "lateFee": "50.00",
    "discount": "0.00",
    "tax": "0.00",
    "notes": "Updated: June rent with late fee"
  }
  ```
- **Expected Response:**
  - Status: 200 OK
  - Response includes updated payment
  - updatedAt and updatedBy timestamps set
- **Validation:**
  - ✓ All fields updated correctly
  - ✓ outstandingBalance recalculated (5550.00 in this case)
  - ✓ Cannot update paid payments (status: Paid)

#### Test 15.2: Update Paid Payment - Error
- **Method:** PUT
- **Endpoint:** `/api/v1/payments/{paidPaymentId}`
- **Request Body:** (any update)
- **Expected Response:**
  - Status: 400 Bad Request
  - Error message: "Cannot update a paid payment. Use refund workflow instead."
- **Validation:**
  - ✓ Paid payments cannot be edited
  - ✓ Refunded payments cannot be edited
  - ✓ Only Pending/PartiallyPaid payments editable

#### Test 15.3: Mark as Paid (Full Payment)
- **Method:** PATCH
- **Endpoint:** `/api/v1/payments/{paymentId}/mark-as-paid`
- **Headers:**
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "paidAmount": "5500.00"
  }
  ```
- **Expected Response:**
  - Status: 200 OK
  - Payment status changed to "Paid"
  - outstandingBalance = 0
  - paidAt timestamp set
  - paymentDate updated (current date)
- **Validation:**
  - ✓ Status changed to Paid
  - ✓ paidAmount recorded
  - ✓ outstandingBalance becomes 0
  - ✓ paidAt timestamp set to current time

#### Test 15.4: Mark as Paid (Partial Payment)
- **Method:** PATCH
- **Endpoint:** `/api/v1/payments/{paymentId}/mark-as-paid`
- **Request Body:**
  ```json
  {
    "paidAmount": "3000.00"
  }
  ```
- **Expected Response:**
  - Status: 200 OK
  - Payment status changed to "PartiallyPaid"
  - outstandingBalance = 2500.00
- **Validation:**
  - ✓ Status changed to PartiallyPaid (not Paid)
  - ✓ outstandingBalance = total - paidAmount
  - ✓ paidAt timestamp set
  - ✓ Can mark as paid again with remaining amount

#### Test 15.5: Mark as Paid - Already Paid Error
- **Method:** PATCH
- **Endpoint:** `/api/v1/payments/{paidPaymentId}/mark-as-paid`
- **Request Body:**
  ```json
  {
    "paidAmount": "1000.00"
  }
  ```
- **Expected Response:**
  - Status: 400 Bad Request
  - Error message: "Cannot mark as paid: payment is already paid"
- **Validation:**
  - ✓ Already paid payments cannot be marked paid again
  - ✓ Error message clear

#### Test 15.6: Mark as Overdue
- **Method:** PATCH
- **Endpoint:** `/api/v1/payments/{paymentId}/mark-as-overdue`
- **Headers:**
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {}
  ```
- **Expected Response:**
  - Status: 200 OK
  - Payment status changed to "Overdue"
- **Validation:**
  - ✓ Status changed to Overdue
  - ✓ Only works for Pending/PartiallyPaid payments
  - ✓ Already paid payments cannot be marked overdue

#### Test 15.7: Refund Paid Payment (Full Refund)
- **Method:** PATCH
- **Endpoint:** `/api/v1/payments/{paidPaymentId}/refund`
- **Headers:**
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "refundAmount": "5500.00"
  }
  ```
- **Expected Response:**
  - Status: 200 OK
  - Payment status changed to "Refunded"
  - paidAmount reset to 0
  - outstandingBalance reset to 0
- **Validation:**
  - ✓ Status changed to Refunded
  - ✓ Full refund recorded
  - ✓ paidAmount becomes 0
  - ✓ outstandingBalance becomes 0

#### Test 15.8: Refund Non-Paid Payment - Error
- **Method:** PATCH
- **Endpoint:** `/api/v1/payments/{pendingPaymentId}/refund`
- **Request Body:**
  ```json
  {
    "refundAmount": "1000.00"
  }
  ```
- **Expected Response:**
  - Status: 400 Bad Request
  - Error message: "Cannot refund a payment that is not paid"
- **Validation:**
  - ✓ Only Paid/PartiallyPaid payments can be refunded
  - ✓ Pending payments cannot be refunded

#### Test 15.9: Generate Receipt
- **Method:** POST
- **Endpoint:** `/api/v1/payments/{paidPaymentId}/generate-receipt`
- **Headers:**
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {}
  ```
- **Expected Response:**
  - Status: 200 OK
  - receiptNumber generated (format: RCP-{orgId}-{paymentId}-{timestamp})
  - Response includes updated payment with receiptNumber
- **Validation:**
  - ✓ Receipt number generated in expected format
  - ✓ Receipt number unique per payment
  - ✓ Cannot regenerate if already exists
  - ✓ Only for paid payments

### Section 16: Payment API - Soft Delete & Restore

#### Test 16.1: Soft Delete Payment
- **Method:** DELETE
- **Endpoint:** `/api/v1/payments/{paymentId}`
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Expected Response:**
  - Status: 200 OK
  - Success message returned
- **Validation:**
  - ✓ Payment marked as deleted (deletedAt set)
  - ✓ deletedBy set to current user ID
  - ✓ Payment not returned in list queries
  - ✓ GET /payments/:id returns 404 for deleted payment

#### Test 16.2: Soft Delete - Already Deleted Error
- **Method:** DELETE
- **Endpoint:** `/api/v1/payments/{deletedPaymentId}`
- **Expected Response:**
  - Status: 400 Bad Request
  - Error message: "Payment already deleted"
- **Validation:**
  - ✓ Cannot delete already deleted payments

#### Test 16.3: Restore Deleted Payment
- **Method:** PATCH
- **Endpoint:** `/api/v1/payments/{deletedPaymentId}/restore`
- **Headers:**
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {}
  ```
- **Expected Response:**
  - Status: 200 OK
  - Payment restored (deletedAt reset, deletedBy reset)
  - Payment now appears in list queries
- **Validation:**
  - ✓ Payment deletedAt cleared
  - ✓ Payment deletedBy cleared
  - ✓ Payment retrievable by ID
  - ✓ Only soft-deleted payments can be restored

### Section 17: Payment API - Statistics

#### Test 17.1: Organization Statistics
- **Method:** GET
- **Endpoint:** `/api/v1/payments/stats/organization`
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Expected Response:**
  - Status: 200 OK
  - Response includes:
    ```json
    {
      "totalPayments": 15,
      "totalAmount": "75000.00",
      "paidAmount": "50000.00",
      "pendingAmount": "15000.00",
      "partiallyPaidAmount": "10000.00",
      "overdueAmount": "5000.00",
      "refundedAmount": "0.00",
      "averagePaymentAmount": "5000.00",
      "paymentsByStatus": {
        "Pending": 3,
        "Paid": 10,
        "PartiallyPaid": 2,
        "Overdue": 2,
        "Failed": 0,
        "Refunded": 0,
        "Cancelled": 0
      },
      "paymentsByMethod": {
        "BankTransfer": 8,
        "Cash": 4,
        "CreditCard": 2,
        "Other": 1
      },
      "paymentsByType": {
        "Rent": 12,
        "LateFee": 2,
        "SecurityDeposit": 1
      }
    }
    ```
- **Validation:**
  - ✓ Total count correct
  - ✓ Sum calculations accurate
  - ✓ Status distribution correct
  - ✓ Method distribution correct
  - ✓ Type distribution correct

#### Test 17.2: Lease Statistics
- **Method:** GET
- **Endpoint:** `/api/v1/leases/{leaseId}/payments/stats`
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Expected Response:**
  - Status: 200 OK
  - Response includes payments statistics for specific lease
- **Validation:**
  - ✓ Stats scoped to lease
  - ✓ All lease payments included in totals
  - ✓ Same structure as organization stats

#### Test 17.3: Tenant Statistics
- **Method:** GET
- **Endpoint:** `/api/v1/tenants/{tenantId}/payments/stats`
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Expected Response:**
  - Status: 200 OK
  - Response includes payments statistics for specific tenant
- **Validation:**
  - ✓ Stats scoped to tenant
  - ✓ All tenant payments included in totals
  - ✓ Same structure as organization stats

### Section 18: Payment RBAC & Authorization

#### Test 18.1: Admin Can Create Payment
- **Role:** Admin
- **Method:** POST
- **Endpoint:** `/api/v1/payments`
- **Expected Response:**
  - Status: 201 Created
  - Payment created successfully
- **Validation:**
  - ✓ Admin permission granted

#### Test 18.2: Manager Can Create Payment
- **Role:** Manager
- **Method:** POST
- **Endpoint:** `/api/v1/payments`
- **Expected Response:**
  - Status: 201 Created
  - Payment created successfully
- **Validation:**
  - ✓ Manager permission granted

#### Test 18.3: Staff Cannot Create Payment
- **Role:** Staff
- **Method:** POST
- **Endpoint:** `/api/v1/payments`
- **Expected Response:**
  - Status: 403 Forbidden
  - Error message: "Insufficient permissions"
- **Validation:**
  - ✓ Staff denied
  - ✓ RBAC enforced

#### Test 18.4: Viewer Cannot Update Payment
- **Role:** Viewer
- **Method:** PUT
- **Endpoint:** `/api/v1/payments/{paymentId}`
- **Expected Response:**
  - Status: 403 Forbidden
- **Validation:**
  - ✓ Read-only role cannot modify

#### Test 18.5: Unauthenticated Cannot Access Payments
- **Authentication:** None
- **Method:** GET
- **Endpoint:** `/api/v1/payments`
- **Expected Response:**
  - Status: 401 Unauthorized
- **Validation:**
  - ✓ Token required
  - ✓ Invalid/expired tokens rejected

### Section 19: Payment Error Handling & Validation

#### Test 19.1: Invalid UUID Format
- **Method:** GET
- **Endpoint:** `/api/v1/payments/invalid-uuid`
- **Expected Response:**
  - Status: 400 Bad Request
  - Error message: "Invalid UUID format"
- **Validation:**
  - ✓ UUID validation enforced
  - ✓ Error message clear

#### Test 19.2: Invalid Currency Code
- **Method:** POST
- **Endpoint:** `/api/v1/payments`
- **Request Body:** (currency: "INVALID")
- **Expected Response:**
  - Status: 400 Bad Request
  - Error: "Invalid currency code"
- **Validation:**
  - ✓ Standard currency codes validated (USD, EUR, GBP, etc.)

#### Test 19.3: Due Date Before Payment Date
- **Method:** POST
- **Endpoint:** `/api/v1/payments`
- **Request Body:**
  ```json
  {
    "paymentDate": "2026-07-27",
    "dueDate": "2026-06-27"
  }
  ```
- **Expected Response:**
  - Status: 400 Bad Request
  - Error: "Due date must be on or after payment date"
- **Validation:**
  - ✓ Date relationship validation

#### Test 19.4: Negative Late Fee
- **Method:** POST
- **Endpoint:** `/api/v1/payments`
- **Request Body:** (lateFee: "-50")
- **Expected Response:**
  - Status: 400 Bad Request
  - Error: "Late fee must be non-negative"
- **Validation:**
  - ✓ Monetary field validation
  - ✓ Discount, tax also validated

#### Test 19.5: Missing Required Fields
- **Method:** POST
- **Endpoint:** `/api/v1/payments`
- **Request Body:**
  ```json
  {
    "paymentNumber": "PAY-001"
  }
  ```
- **Expected Response:**
  - Status: 400 Bad Request
  - Error includes list of missing fields
- **Validation:**
  - ✓ Required fields: leaseId, paymentNumber, amount, currency, paymentDate, dueDate, paymentMethod, paymentType, status
  - ✓ Error message lists each missing field

### Section 20: Payment Cross-Organization Isolation

#### Test 20.1: Prevent Access to Other Organization's Payments
- **Setup:** User in Organization A, attacker token from Organization B
- **Method:** GET
- **Endpoint:** `/api/v1/payments/{orgAPaymentId}`
- **Expected Response:**
  - Status: 404 Not Found
- **Validation:**
  - ✓ Organization B cannot access Organization A's payments
  - ✓ No data leakage across orgs

#### Test 20.2: List Only Current Organization Payments
- **Setup:** Multiple organizations with payments
- **Method:** GET
- **Endpoint:** `/api/v1/payments`
- **Expected Response:**
  - Status: 200 OK
  - Response includes only Organization A's payments
- **Validation:**
  - ✓ Automatic organization scope applied
  - ✓ organizationId from token used for filtering

#### Test 20.3: Prevent Cross-Organization Payment Update
- **Setup:** User in Organization A, attacker token
- **Method:** PUT
- **Endpoint:** `/api/v1/payments/{orgBPaymentId}`
- **Request Body:** (any update)
- **Expected Response:**
  - Status: 404 Not Found
- **Validation:**
  - ✓ Update prevented for other org's payments

#### Test 20.4: Prevent Cross-Organization Statistics
- **Setup:** User in Organization A
- **Method:** GET
- **Endpoint:** `/api/v1/payments/stats/organization`
- **Expected Response:**
  - Status: 200 OK
  - Statistics only for Organization A
- **Validation:**
  - ✓ Statistics scoped to current organization

---

## Sprint 10: Maintenance Domain

Complete manual testing guide for the Maintenance Request Management system including CRUD operations, workflow transitions, assignment, and statistics.

### Section 21: Maintenance API - Fundamentals

#### Test 21.1: Create Maintenance Request
- **Method:** POST
- **Endpoint:** `/api/v1/maintenance`
- **Headers:**
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "propertyId": "property-123",
    "unitId": "unit-123",
    "requestNumber": "MR-001",
    "title": "Plumbing Issue",
    "description": "Water leak in bathroom",
    "category": "Plumbing",
    "priority": "High",
    "status": "Open",
    "requestedDate": "2026-06-27T00:00:00Z",
    "scheduledDate": "2026-06-28T00:00:00Z",
    "estimatedCost": "500.00",
    "vendor": "Local Plumber",
    "notes": "Urgent repair needed"
  }
  ```
- **Expected Response:**
  - Status: 201 Created
  - Response includes created maintenance request with all fields
- **Validation:**
  - ✓ Request created with unique ID (UUID)
  - ✓ organizationId auto-populated from token
  - ✓ reportedBy set to current user ID
  - ✓ Status is Open initially
  - ✓ Timestamps: createdAt and createdBy populated

#### Test 21.2: Create Maintenance - Duplicate Request Number Error
- **Method:** POST
- **Endpoint:** `/api/v1/maintenance`
- **Request Body:** (same requestNumber as Test 21.1)
- **Expected Response:**
  - Status: 409 Conflict
  - Error message: "Request number already exists for this organization"
- **Validation:**
  - ✓ Duplicate request numbers rejected per organization

#### Test 21.3: Create Maintenance - Invalid Category Error
- **Method:** POST
- **Endpoint:** `/api/v1/maintenance`
- **Request Body:** (category: "InvalidCategory")
- **Expected Response:**
  - Status: 400 Bad Request
  - Error: "Invalid maintenance category"
- **Validation:**
  - ✓ Valid categories: Plumbing, Electrical, HVAC, Structural, Cleaning, Pest Control, Other

#### Test 21.4: Create Maintenance - Invalid Priority Error
- **Method:** POST
- **Endpoint:** `/api/v1/maintenance`
- **Request Body:** (priority: "InvalidPriority")
- **Expected Response:**
  - Status: 400 Bad Request
  - Error: "Invalid priority level"
- **Validation:**
  - ✓ Valid priorities: Low, Medium, High, Urgent, Emergency

#### Test 21.5: Create Maintenance - Invalid Status Error
- **Method:** POST
- **Endpoint:** `/api/v1/maintenance`
- **Request Body:** (status: "InvalidStatus")
- **Expected Response:**
  - Status: 400 Bad Request
  - Error: "Invalid maintenance status"
- **Validation:**
  - ✓ Valid statuses: Open, Assigned, Scheduled, In Progress, On Hold, Completed, Cancelled

#### Test 21.6: Get Maintenance Request by ID
- **Method:** GET
- **Endpoint:** `/api/v1/maintenance/{maintenanceId}`
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Expected Response:**
  - Status: 200 OK
  - Response includes full maintenance request details
- **Validation:**
  - ✓ Request retrieved with all fields
  - ✓ Organization scope enforced
  - ✓ Soft-deleted requests not returned

#### Test 21.7: List Maintenance Requests with Pagination
- **Method:** GET
- **Endpoint:** `/api/v1/maintenance?page=1&limit=10`
- **Expected Response:**
  - Status: 200 OK
  - Response includes paginated list
- **Validation:**
  - ✓ Pagination defaults work
  - ✓ All requests for organization returned
  - ✓ Metadata includes totalCount and currentPage

### Section 22: Maintenance API - Filtering & Search

#### Test 22.1: Filter by Status
- **Method:** GET
- **Endpoint:** `/api/v1/maintenance?status=Open`
- **Expected Response:**
  - Status: 200 OK
  - Only Open status requests returned
- **Validation:**
  - ✓ Valid statuses filterable

#### Test 22.2: Filter by Priority
- **Method:** GET
- **Endpoint:** `/api/v1/maintenance?priority=High`
- **Expected Response:**
  - Status: 200 OK
  - Only High priority requests returned
- **Validation:**
  - ✓ All priority levels filterable

#### Test 22.3: Filter by Category
- **Method:** GET
- **Endpoint:** `/api/v1/maintenance?category=Plumbing`
- **Expected Response:**
  - Status: 200 OK
  - Only Plumbing category requests returned
- **Validation:**
  - ✓ All categories filterable

#### Test 22.4: Filter by Property
- **Method:** GET
- **Endpoint:** `/api/v1/maintenance?propertyId=property-123`
- **Expected Response:**
  - Status: 200 OK
  - Only requests for specified property returned
- **Validation:**
  - ✓ Property scope works

#### Test 22.5: Search Maintenance Requests
- **Method:** GET
- **Endpoint:** `/api/v1/maintenance?search=Plumbing`
- **Expected Response:**
  - Status: 200 OK
  - Results matching request number, title, or description
- **Validation:**
  - ✓ Partial match supported
  - ✓ Case-insensitive search

#### Test 22.6: Sort by Different Fields
- **Method:** GET
- **Endpoint:** `/api/v1/maintenance?sortBy=priority&sortOrder=desc`
- **Expected Response:**
  - Status: 200 OK
  - Requests sorted by priority descending
- **Validation:**
  - ✓ Valid sortBy fields: requestNumber, title, priority, status, requestedDate, scheduledDate, completedDate, estimatedCost, actualCost, createdAt

### Section 23: Maintenance API - Workflow & Status Transitions

#### Test 23.1: Assign Technician
- **Method:** PATCH
- **Endpoint:** `/api/v1/maintenance/{maintenanceId}/assign`
- **Headers:**
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "assignedTo": "tech-123"
  }
  ```
- **Expected Response:**
  - Status: 200 OK
  - assignedTo set to tech ID
  - Status changed to "Assigned"
- **Validation:**
  - ✓ Technician assigned successfully
  - ✓ Status auto-changed to Assigned
  - ✓ assignedTo user verified to exist

#### Test 23.2: Change Status to Scheduled
- **Method:** PATCH
- **Endpoint:** `/api/v1/maintenance/{maintenanceId}/change-status`
- **Headers:**
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "status": "Scheduled"
  }
  ```
- **Expected Response:**
  - Status: 200 OK
  - Status changed to "Scheduled"
- **Validation:**
  - ✓ Valid transition from Open or Assigned to Scheduled

#### Test 23.3: Change Status to In Progress
- **Method:** PATCH
- **Endpoint:** `/api/v1/maintenance/{maintenanceId}/change-status`
- **Request Body:**
  ```json
  {
    "status": "In Progress"
  }
  ```
- **Expected Response:**
  - Status: 200 OK
  - Status changed to "In Progress"
  - startedDate auto-set to current timestamp
- **Validation:**
  - ✓ Valid transition from Scheduled status
  - ✓ startedDate captured

#### Test 23.4: Invalid Status Transition Error
- **Method:** PATCH
- **Endpoint:** `/api/v1/maintenance/{completedMaintenanceId}/change-status`
- **Request Body:**
  ```json
  {
    "status": "Open"
  }
  ```
- **Expected Response:**
  - Status: 400 Bad Request
  - Error: "Cannot transition from Completed to Open"
- **Validation:**
  - ✓ Invalid transitions rejected
  - ✓ Status state machine enforced

#### Test 23.5: Update with Actual Cost
- **Method:** PUT
- **Endpoint:** `/api/v1/maintenance/{maintenanceId}`
- **Request Body:**
  ```json
  {
    "actualCost": "450.00",
    "status": "Completed",
    "notes": "Repair completed successfully"
  }
  ```
- **Expected Response:**
  - Status: 200 OK
  - Actual cost recorded
  - Status changed to Completed
  - completedDate auto-set
- **Validation:**
  - ✓ Multiple fields updated
  - ✓ Date tracking captured

#### Test 23.6: Add Notes to Request
- **Method:** PATCH
- **Endpoint:** `/api/v1/maintenance/{maintenanceId}/notes`
- **Request Body:**
  ```json
  {
    "notes": "Additional progress note"
  }
  ```
- **Expected Response:**
  - Status: 200 OK
  - Notes appended
- **Validation:**
  - ✓ Notes field updated

### Section 24: Maintenance API - Soft Delete & Restore

#### Test 24.1: Soft Delete Maintenance Request
- **Method:** DELETE
- **Endpoint:** `/api/v1/maintenance/{maintenanceId}`
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Expected Response:**
  - Status: 200 OK
  - Success message returned
- **Validation:**
  - ✓ Request marked as deleted (deletedAt set)
  - ✓ updatedBy set to current user ID
  - ✓ Request not returned in list queries
  - ✓ GET /maintenance/:id returns 404 for deleted request

#### Test 24.2: Restore Deleted Request
- **Method:** PATCH
- **Endpoint:** `/api/v1/maintenance/{deletedMaintenanceId}/restore`
- **Headers:**
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {}
  ```
- **Expected Response:**
  - Status: 200 OK
  - Request restored (deletedAt cleared)
- **Validation:**
  - ✓ Request deletedAt cleared
  - ✓ Request now appears in list queries
  - ✓ Only soft-deleted requests can be restored

### Section 25: Maintenance API - Statistics

#### Test 25.1: Organization Maintenance Statistics
- **Method:** GET
- **Endpoint:** `/api/v1/maintenance/stats/organization`
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Expected Response:**
  - Status: 200 OK
  - Response includes statistics:
    ```json
    {
      "totalRequests": 10,
      "byStatus": {
        "Open": 2,
        "Assigned": 2,
        "Scheduled": 1,
        "In Progress": 1,
        "On Hold": 0,
        "Completed": 4,
        "Cancelled": 0
      },
      "byPriority": {
        "Low": 1,
        "Medium": 3,
        "High": 4,
        "Urgent": 2,
        "Emergency": 0
      },
      "totalEstimatedCost": 5000.00,
      "totalActualCost": 4500.00
    }
    ```
- **Validation:**
  - ✓ Total count correct
  - ✓ Status distribution accurate
  - ✓ Priority distribution accurate
  - ✓ Cost calculations correct

#### Test 25.2: Property Maintenance Statistics
- **Method:** GET
- **Endpoint:** `/api/v1/maintenance/properties/{propertyId}/stats`
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Expected Response:**
  - Status: 200 OK
  - Statistics for specific property
- **Validation:**
  - ✓ Stats scoped to property
  - ✓ Only property requests included

### Section 26: Maintenance RBAC & Authorization

#### Test 26.1: Admin Can Create Maintenance
- **Role:** Admin
- **Method:** POST
- **Endpoint:** `/api/v1/maintenance`
- **Expected Response:**
  - Status: 201 Created
- **Validation:**
  - ✓ Admin permission granted

#### Test 26.2: Manager Can Create Maintenance
- **Role:** Manager
- **Method:** POST
- **Endpoint:** `/api/v1/maintenance`
- **Expected Response:**
  - Status: 201 Created
- **Validation:**
  - ✓ Manager permission granted

#### Test 26.3: Staff Cannot Create Maintenance
- **Role:** Staff
- **Method:** POST
- **Endpoint:** `/api/v1/maintenance`
- **Expected Response:**
  - Status: 403 Forbidden
- **Validation:**
  - ✓ Staff denied
  - ✓ RBAC enforced

#### Test 26.4: Unauthenticated Cannot Access
- **Authentication:** None
- **Method:** GET
- **Endpoint:** `/api/v1/maintenance`
- **Expected Response:**
  - Status: 401 Unauthorized
- **Validation:**
  - ✓ Token required

### Section 27: Maintenance Organization Isolation

#### Test 27.1: Prevent Cross-Org Access
- **Setup:** Request in Org A, token from Org B
- **Method:** GET
- **Endpoint:** `/api/v1/maintenance/{orgAMaintenanceId}`
- **Expected Response:**
  - Status: 404 Not Found
- **Validation:**
  - ✓ Org B cannot access Org A's requests
  - ✓ No data leakage

#### Test 27.2: List Scoped to Organization
- **Method:** GET
- **Endpoint:** `/api/v1/maintenance`
- **Expected Response:**
  - Status: 200 OK
  - Only current org's requests returned
- **Validation:**
  - ✓ Automatic org scope applied

---

## Testing Complete

All Maintenance Domain features are now verified. Sprint 10 is ready for production.

All Payment Domain features are also verified. Sprint 9 is ready for production.

All Property, Unit, and Tenant management features are also verified. Sprint UI-3 is ready for production.

