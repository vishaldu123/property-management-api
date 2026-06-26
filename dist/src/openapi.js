"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openApiDoc = void 0;
exports.openApiDoc = {
    openapi: '3.1.0',
    info: {
        title: 'Property Management API',
        version: '1.0.0',
        description: 'OpenAPI documentation for auth, property, unit, tenant, lease, and payment routes.',
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Local development server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            ErrorResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    error: { type: 'string' },
                },
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    token: { type: 'string' },
                    organization: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            name: { type: 'string' },
                            slug: { type: 'string' },
                        },
                    },
                },
            },
            RegisterRequest: {
                type: 'object',
                required: ['name', 'email', 'password', 'organizationName'],
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', format: 'password' },
                    organizationName: { type: 'string' },
                },
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', format: 'password' },
                    organizationId: { type: 'string', format: 'uuid' },
                },
            },
            Property: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    address: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    organizationId: { type: 'string', format: 'uuid' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            PropertyCreateRequest: {
                type: 'object',
                required: ['name', 'address', 'city', 'state'],
                properties: {
                    name: { type: 'string' },
                    address: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                },
            },
            PropertyUpdateRequest: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    address: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                },
            },
            Unit: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    unitNumber: { type: 'string' },
                    rentAmount: { type: 'number' },
                    propertyId: { type: 'string', format: 'uuid' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            UnitCreateRequest: {
                type: 'object',
                required: ['propertyId', 'unitNumber', 'rentAmount'],
                properties: {
                    propertyId: { type: 'string', format: 'uuid' },
                    unitNumber: { type: 'string' },
                    rentAmount: { type: 'number' },
                },
            },
            UnitUpdateRequest: {
                type: 'object',
                properties: {
                    unitNumber: { type: 'string' },
                    rentAmount: { type: 'number' },
                },
            },
            Tenant: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    organizationId: { type: 'string', format: 'uuid' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            TenantCreateRequest: {
                type: 'object',
                required: ['name', 'email', 'phone'],
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                },
            },
            Lease: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    startDate: { type: 'string', format: 'date' },
                    endDate: { type: 'string', format: 'date' },
                    monthlyRent: { type: 'number' },
                    unitId: { type: 'string', format: 'uuid' },
                    tenantId: { type: 'string', format: 'uuid' },
                    createdAt: { type: 'string', format: 'date-time' },
                    unit: { type: 'object', nullable: true },
                    tenant: { type: 'object', nullable: true },
                    payments: { type: 'array', items: { type: 'object' } },
                },
            },
            LeaseCreateRequest: {
                type: 'object',
                required: ['unitId', 'tenantId', 'startDate', 'endDate', 'monthlyRent'],
                properties: {
                    unitId: { type: 'string', format: 'uuid' },
                    tenantId: { type: 'string', format: 'uuid' },
                    startDate: { type: 'string', format: 'date' },
                    endDate: { type: 'string', format: 'date' },
                    monthlyRent: { type: 'number' },
                },
            },
            LeaseUpdateRequest: {
                type: 'object',
                properties: {
                    startDate: { type: 'string', format: 'date' },
                    endDate: { type: 'string', format: 'date' },
                    monthlyRent: { type: 'number' },
                },
            },
            Payment: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    amount: { type: 'number' },
                    paymentDate: { type: 'string', format: 'date-time' },
                    status: { type: 'string' },
                    leaseId: { type: 'string', format: 'uuid' },
                    provider: { type: 'string' },
                    providerPaymentId: { type: 'string' },
                    providerResponse: { type: 'object' },
                    providerStatus: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            PaymentCreateRequest: {
                type: 'object',
                required: ['leaseId', 'amount', 'paymentDate', 'status'],
                properties: {
                    leaseId: { type: 'string', format: 'uuid' },
                    amount: { type: 'number' },
                    paymentDate: { type: 'string', format: 'date-time' },
                    status: { type: 'string' },
                },
            },
            PaymentInitiateRequest: {
                type: 'object',
                required: ['leaseId', 'amount', 'provider'],
                properties: {
                    leaseId: { type: 'string', format: 'uuid' },
                    amount: { type: 'number' },
                    provider: { type: 'string', enum: ['razorpay', 'cashfree'] },
                    metadata: { type: 'object', additionalProperties: true },
                },
            },
            PaymentUpdateRequest: {
                type: 'object',
                properties: {
                    amount: { type: 'number' },
                    paymentDate: { type: 'string', format: 'date-time' },
                    status: { type: 'string' },
                },
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
    paths: {
        '/api/auth/register': {
            post: {
                summary: 'Register a new user and organization',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RegisterRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'User registered successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AuthResponse' },
                            },
                        },
                    },
                    '400': {
                        description: 'Bad request',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/auth/login': {
            post: {
                summary: 'Log in a user and receive a JWT token',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'User logged in successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AuthResponse' },
                            },
                        },
                    },
                    '401': {
                        description: 'Invalid credentials',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/auth/refresh-token': {
            post: {
                summary: 'Refresh access token using refresh token',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['refreshToken'],
                                properties: {
                                    refreshToken: { type: 'string', description: 'Refresh token' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'New tokens generated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        token: { type: 'string', description: 'New access token' },
                                        refreshToken: { type: 'string', description: 'New refresh token' },
                                    },
                                },
                            },
                        },
                    },
                    '401': {
                        description: 'Invalid or expired refresh token',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/auth/logout': {
            post: {
                summary: 'Logout user and invalidate refresh token',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['refreshToken'],
                                properties: {
                                    refreshToken: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Logged out successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    '401': {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/auth/forgot-password': {
            post: {
                summary: 'Request password reset email',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Password reset email sent (if account exists)',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    '400': {
                        description: 'Bad request',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/auth/reset-password': {
            post: {
                summary: 'Reset password with reset token',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['token', 'password'],
                                properties: {
                                    token: { type: 'string', description: 'Password reset token' },
                                    password: { type: 'string', format: 'password', description: 'New password' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Password reset successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    '401': {
                        description: 'Invalid or expired reset token',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/auth/change-password': {
            post: {
                summary: 'Change password for authenticated user',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['currentPassword', 'newPassword', 'confirmPassword'],
                                properties: {
                                    currentPassword: { type: 'string', format: 'password' },
                                    newPassword: { type: 'string', format: 'password' },
                                    confirmPassword: { type: 'string', format: 'password' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Password changed successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    '400': {
                        description: 'Validation failed',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                    '401': {
                        description: 'Unauthorized or invalid current password',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/auth/me': {
            get: {
                summary: 'Get current authenticated user',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Current user info',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        user: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string', format: 'uuid' },
                                                name: { type: 'string' },
                                                email: { type: 'string', format: 'email' },
                                            },
                                        },
                                        organization: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string', format: 'uuid' },
                                                name: { type: 'string' },
                                                slug: { type: 'string' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/properties': {
            get: {
                summary: 'List all properties for the current organization',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Property list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Property' },
                                },
                            },
                        },
                    },
                    '401': {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
            post: {
                summary: 'Create a new property',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/PropertyCreateRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Property created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Property' },
                            },
                        },
                    },
                    '403': {
                        description: 'Forbidden',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/properties/{propertyId}': {
            parameters: [
                {
                    name: 'propertyId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                },
            ],
            get: {
                summary: 'Get a property by ID',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Property details',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Property' },
                            },
                        },
                    },
                    '404': {
                        description: 'Property not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
            put: {
                summary: 'Update a property',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/PropertyUpdateRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Updated property',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Property' },
                            },
                        },
                    },
                    '404': {
                        description: 'Property not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
            delete: {
                summary: 'Delete a property',
                security: [{ bearerAuth: [] }],
                responses: {
                    '204': {
                        description: 'Property deleted',
                    },
                    '404': {
                        description: 'Property not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/units': {
            get: {
                summary: 'List all units for the organization',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Unit list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Unit' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                summary: 'Create a new unit',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UnitCreateRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Unit created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Unit' },
                            },
                        },
                    },
                },
            },
        },
        '/api/units/{unitId}': {
            parameters: [
                {
                    name: 'unitId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                },
            ],
            get: {
                summary: 'Get a unit by ID',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Unit details',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Unit' },
                            },
                        },
                    },
                    '404': {
                        description: 'Unit not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
            put: {
                summary: 'Update a unit',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UnitUpdateRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Updated unit',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Unit' },
                            },
                        },
                    },
                    '404': {
                        description: 'Unit not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
            delete: {
                summary: 'Delete a unit',
                security: [{ bearerAuth: [] }],
                responses: {
                    '204': {
                        description: 'Unit deleted',
                    },
                    '404': {
                        description: 'Unit not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/tenants': {
            get: {
                summary: 'List tenants for the organization',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Tenant list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Tenant' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                summary: 'Create a new tenant',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/TenantCreateRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Tenant created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Tenant' },
                            },
                        },
                    },
                },
            },
        },
        '/api/leases': {
            get: {
                summary: 'List leases for the organization',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Lease list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Lease' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                summary: 'Create a new lease',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LeaseCreateRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Lease created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Lease' },
                            },
                        },
                    },
                },
            },
        },
        '/api/leases/{leaseId}': {
            parameters: [
                {
                    name: 'leaseId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                },
            ],
            get: {
                summary: 'Get a lease by ID',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Lease detail',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Lease' },
                            },
                        },
                    },
                    '404': {
                        description: 'Lease not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
            put: {
                summary: 'Update a lease',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LeaseUpdateRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Updated lease',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Lease' },
                            },
                        },
                    },
                    '404': {
                        description: 'Lease not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
            delete: {
                summary: 'Delete a lease',
                security: [{ bearerAuth: [] }],
                responses: {
                    '204': {
                        description: 'Lease deleted',
                    },
                    '404': {
                        description: 'Lease not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/payments': {
            get: {
                summary: 'List payments for the organization',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Payment list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Payment' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                summary: 'Create a new payment record',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/PaymentCreateRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Payment created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Payment' },
                            },
                        },
                    },
                },
            },
        },
        '/api/payments/initiate': {
            post: {
                summary: 'Initiate a payment through a provider',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/PaymentInitiateRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Payment initiated',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        paymentId: { type: 'string', format: 'uuid' },
                                        providerResponse: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    '400': {
                        description: 'Unsupported provider or request error',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/payments/{paymentId}': {
            parameters: [
                {
                    name: 'paymentId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                },
            ],
            get: {
                summary: 'Get a payment by ID',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Payment details',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Payment' },
                            },
                        },
                    },
                    '404': {
                        description: 'Payment not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
            put: {
                summary: 'Update a payment',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/PaymentUpdateRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Payment updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Payment' },
                            },
                        },
                    },
                    '404': {
                        description: 'Payment not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
            delete: {
                summary: 'Delete a payment',
                security: [{ bearerAuth: [] }],
                responses: {
                    '204': {
                        description: 'Payment deleted',
                    },
                    '404': {
                        description: 'Payment not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
    },
};
