# Human Testing Guide

This document provides numbered manual test cases for the Property Management API. Each test case includes the request flow, expected results, and notes on validation.

## 1. Health Check

1. Send `GET /`.
2. Expected result:
   - `200 OK`
   - JSON body: `{ "success": true, "message": "Property Management API Running" }`

## 2. User Registration

1. Send `POST /api/auth/register` with JSON body:
   ```json
   {
     "name": "Alice Tenant",
     "email": "alice@example.com",
     "password": "Password123!",
     "organizationName": "Acme Properties"
   }
   ```
2. Expected result:
   - `201 Created`
   - JSON body contains `token`
   - JSON body contains `organization` with `id`, `name`, and `slug`

## 3. User Login

1. Send `POST /api/auth/login` with JSON body:
   ```json
   {
     "email": "alice@example.com",
     "password": "Password123!"
   }
   ```
2. Expected result:
   - `200 OK`
   - JSON body contains `token`
   - JSON body contains `organization` with the same `slug` from registration

## 4. Create Property

1. Use the bearer token from login.
2. Send `POST /api/properties` with JSON body:
   ```json
   {
     "name": "Acme Tower",
     "address": "123 Main St",
     "city": "Mumbai",
     "state": "Maharashtra"
   }
   ```
3. Expected result:
   - `201 Created`
   - JSON body contains `id`, `name`, `address`, `city`, `state`, and `organizationId`

## 5. List Properties

1. Send `GET /api/properties` with the same bearer token.
2. Expected result:
   - `200 OK`
   - JSON array includes the property created in test 4

## 6. Get Property by ID

1. Send `GET /api/properties/{propertyId}` with the property ID from test 4.
2. Expected result:
   - `200 OK`
   - JSON body contains matching `id` and `name`

## 7. Update Property

1. Send `PUT /api/properties/{propertyId}` with JSON body:
   ```json
   {
     "name": "Acme Tower Updated",
     "address": "123 Main St",
     "city": "Mumbai",
     "state": "Maharashtra"
   }
   ```
2. Expected result:
   - `200 OK`
   - JSON body contains updated `name`

## 8. Delete Property

1. Send `DELETE /api/properties/{propertyId}`.
2. Expected result:
   - `204 No Content`
   - Subsequent `GET /api/properties/{propertyId}` returns `404 Not Found`

## 9. Create Unit

1. Re-create or use an existing property ID.
2. Send `POST /api/units` with JSON body:
   ```json
   {
     "propertyId": "{propertyId}",
     "unitNumber": "101",
     "rentAmount": 50000
   }
   ```
3. Expected result:
   - `201 Created`
   - JSON body contains `id`, `propertyId`, `unitNumber`, `rentAmount`

## 10. List Units

1. Send `GET /api/units`.
2. Expected result:
   - `200 OK`
   - JSON array includes the unit created in test 9

## 11. Get Unit by ID

1. Send `GET /api/units/{unitId}`.
2. Expected result:
   - `200 OK`
   - JSON body contains matching `id` and `unitNumber`

## 12. Update Unit

1. Send `PUT /api/units/{unitId}` with JSON body:
   ```json
   {
     "unitNumber": "101A",
     "rentAmount": 52000
   }
   ```
2. Expected result:
   - `200 OK`
   - JSON body contains updated `unitNumber` and `rentAmount`

## 13. Delete Unit

1. Send `DELETE /api/units/{unitId}`.
2. Expected result:
   - `204 No Content`
   - Subsequent `GET /api/units/{unitId}` returns `404 Not Found`

## 14. Create Tenant

1. Send `POST /api/tenants` with JSON body:
   ```json
   {
     "name": "Bob Renter",
     "email": "bob@example.com",
     "phone": "+911234567890"
   }
   ```
2. Expected result:
   - `201 Created`
   - JSON body contains `id`, `email`, and `organizationId`

## 15. List Tenants

1. Send `GET /api/tenants`.
2. Expected result:
   - `200 OK`
   - JSON array includes the tenant created in test 14

## 16. Create Lease

1. Ensure a property, unit, and tenant exist in the same organization.
2. Send `POST /api/leases` with JSON body:
   ```json
   {
     "unitId": "{unitId}",
     "tenantId": "{tenantId}",
     "startDate": "2026-07-01",
     "endDate": "2027-06-30",
     "monthlyRent": 50000
   }
   ```
3. Expected result:
   - `201 Created`
   - JSON body contains `id`, `unitId`, `tenantId`, `startDate`, `endDate`, `monthlyRent`

## 17. List Leases

1. Send `GET /api/leases`.
2. Expected result:
   - `200 OK`
   - JSON array includes the lease created in test 16

## 18. Get Lease by ID

1. Send `GET /api/leases/{leaseId}`.
2. Expected result:
   - `200 OK`
   - JSON body contains the lease with included `unit`, `tenant`, and `payments`

## 19. Update Lease

1. Send `PUT /api/leases/{leaseId}` with JSON body:
   ```json
   {
     "monthlyRent": 52000
   }
   ```
2. Expected result:
   - `200 OK`
   - JSON body contains updated `monthlyRent`

## 20. Delete Lease

1. Send `DELETE /api/leases/{leaseId}`.
2. Expected result:
   - `204 No Content`
   - Subsequent `GET /api/leases/{leaseId}` returns `404 Not Found`

## 21. Create Payment Record

1. Create a lease and use its `leaseId`.
2. Send `POST /api/payments` with JSON body:
   ```json
   {
     "leaseId": "{leaseId}",
     "amount": 50000,
     "paymentDate": "2026-07-05",
     "status": "COMPLETED"
   }
   ```
3. Expected result:
   - `201 Created`
   - JSON body contains `id`, `leaseId`, `amount`, `status`

## 22. List Payments

1. Send `GET /api/payments`.
2. Expected result:
   - `200 OK`
   - JSON array includes payment records for organization leases

## 23. Get Payment by ID

1. Send `GET /api/payments/{paymentId}`.
2. Expected result:
   - `200 OK`
   - JSON body contains the requested payment and included lease

## 24. Update Payment

1. Send `PUT /api/payments/{paymentId}` with JSON body:
   ```json
   {
     "status": "COMPLETED",
     "amount": 52000
   }
   ```
2. Expected result:
   - `200 OK`
   - JSON body contains updated `status` and `amount`

## 25. Delete Payment

1. Send `DELETE /api/payments/{paymentId}`.
2. Expected result:
   - `204 No Content`
   - Subsequent `GET /api/payments/{paymentId}` returns `404 Not Found`

## 26. Initiate Payment via Provider

1. Ensure the organization has a lease.
2. Send `POST /api/payments/initiate` with JSON body:
   ```json
   {
     "leaseId": "{leaseId}",
     "amount": 50000,
     "provider": "razorpay",
     "metadata": { "source": "integration-test" }
   }
   ```
3. Expected result:
   - `201 Created`
   - JSON body contains `paymentId`
   - `providerResponse` is returned

## 27. Initiate Unsupported Provider

1. Send `POST /api/payments/initiate` with JSON body using `provider: "unknown"`.
2. Expected result:
   - `400 Bad Request`
   - JSON body contains `{ "message": "Unsupported provider" }`

## 28. Razorpay Webhook Signature Failure

1. Send `POST /api/payments/webhooks/razorpay` with invalid signature header.
2. Expected result:
   - `400 Bad Request`
   - JSON body contains `{ "message": "Invalid signature" }`

## 29. Cashfree Webhook Signature Failure

1. Send `POST /api/payments/webhooks/cashfree` with invalid signature header.
2. Expected result:
   - `400 Bad Request`
   - JSON body contains `{ "message": "Invalid signature" }`

## 30. Auth Guard Validation

1. Send any protected route request without `Authorization` header.
2. Expected result:
   - `401 Unauthorized`
   - JSON body contains `{ "message": "Authorization header missing or invalid" }`

## 31. Role Restriction Enforcement

1. Obtain a valid JWT for a user with role `MEMBER` only.
2. Attempt `POST /api/properties` or `POST /api/payments/initiate`.
3. Expected result:
   - `403 Forbidden`
   - JSON body contains `{ "message": "Insufficient permissions" }`

## 32. Owner Permissions

1. Use a valid JWT for a user with role `OWNER`.
2. Confirm the user can create, update, and delete properties, units, leases, and payments.
3. Expected result:
   - Success responses for all allowed routes
   - No `403 Forbidden` responses for valid owner actions

## 33. Staff Permission Denial

1. Use a valid JWT for a user with role `STAFF`.
2. Attempt `POST /api/properties` and `PUT /api/units/{unitId}`.
3. Expected result:
   - `403 Forbidden` for actions not allowed to staff
   - `200 OK` for read-only endpoints such as `GET /api/properties`

## 34. Accountant Payment Permissions

1. Use a valid JWT for a user with role `ACCOUNTANT`.
2. Attempt `POST /api/payments` and `POST /api/payments/initiate`.
3. Expected result:
   - Allowed payment creation/initiation if permitted by RBAC
   - `403 Forbidden` for unrelated write actions such as `DELETE /api/properties/{propertyId}`

## Notes
- Use a single organization and user session for most tests.
- If tests manipulate or delete resources, recreate linked entities as needed.
- Webhook testing can be performed with a simulated signature flow, but the key check is invalid signature handling.
- For manual verification of successful webhooks, use valid adapter signature logic if secrets are configured.

## Verify OpenAPI / Swagger UI

1. Start the server (`npm run dev`).
2. Visit `http://localhost:5000/api/docs` in a browser.
3. Confirm the UI loads and endpoints for `auth`, `properties`, `units`, `tenants`, `leases`, and `payments` are listed.
4. Optionally use the Swagger UI to try the `POST /api/auth/login` and other endpoints (provide bearer token when required).
