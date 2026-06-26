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
            Organization: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    slug: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string', nullable: true },
                    website: { type: 'string', nullable: true },
                    logo: { type: 'string', nullable: true },
                    address: { type: 'string', nullable: true },
                    city: { type: 'string', nullable: true },
                    state: { type: 'string', nullable: true },
                    country: { type: 'string', nullable: true },
                    postalCode: { type: 'string', nullable: true },
                    timezone: { type: 'string', nullable: true },
                    currency: { type: 'string', nullable: true },
                    subscriptionPlan: { type: 'string' },
                    subscriptionStatus: { type: 'string' },
                    isActive: { type: 'boolean' },
                    createdBy: { type: 'string', nullable: true },
                    updatedBy: { type: 'string', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    deletedAt: { type: 'string', format: 'date-time', nullable: true },
                },
            },
            OrganizationCreateRequest: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                    name: { type: 'string' },
                    slug: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    website: { type: 'string', format: 'uri' },
                    logo: { type: 'string', format: 'uri' },
                    address: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    country: { type: 'string' },
                    postalCode: { type: 'string' },
                    timezone: { type: 'string' },
                    currency: { type: 'string' },
                    subscriptionPlan: { type: 'string' },
                    subscriptionStatus: { type: 'string' },
                    isActive: { type: 'boolean' },
                },
            },
            OrganizationUpdateRequest: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    slug: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    website: { type: 'string', format: 'uri' },
                    logo: { type: 'string', format: 'uri' },
                    address: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    country: { type: 'string' },
                    postalCode: { type: 'string' },
                    timezone: { type: 'string' },
                    currency: { type: 'string' },
                    subscriptionPlan: { type: 'string' },
                    subscriptionStatus: { type: 'string' },
                    isActive: { type: 'boolean' },
                },
            },
            OrganizationSettings: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    organizationId: { type: 'string', format: 'uuid' },
                    timezone: { type: 'string', description: 'Timezone identifier (e.g., UTC, America/New_York)' },
                    currency: { type: 'string', description: 'ISO 4217 currency code (e.g., USD, EUR, INR)' },
                    dateFormat: { type: 'string', enum: ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'] },
                    timeFormat: { type: 'string', enum: ['HH:mm:ss', 'HH:mm', '12h'] },
                    language: { type: 'string', description: 'Language code (e.g., en, es, fr)' },
                    measurementUnit: { type: 'string', enum: ['metric', 'imperial'] },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            OrganizationSettingsInput: {
                type: 'object',
                properties: {
                    timezone: { type: 'string', description: 'Timezone identifier' },
                    currency: { type: 'string', description: 'ISO 4217 currency code' },
                    dateFormat: { type: 'string', enum: ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'] },
                    timeFormat: { type: 'string', enum: ['HH:mm:ss', 'HH:mm', '12h'] },
                    language: { type: 'string', description: 'Language code' },
                    measurementUnit: { type: 'string', enum: ['metric', 'imperial'] },
                },
            },
            OrganizationBranding: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    organizationId: { type: 'string', format: 'uuid' },
                    logoUrl: { type: 'string', format: 'uri', nullable: true, description: 'URL to the organization logo' },
                    logoAltText: { type: 'string', nullable: true, description: 'Alt text for the logo' },
                    faviconUrl: { type: 'string', format: 'uri', nullable: true, description: 'URL to the favicon' },
                    primaryColor: { type: 'string', pattern: '^#[0-9A-F]{6}$', description: 'Primary brand color in hex format' },
                    secondaryColor: { type: 'string', pattern: '^#[0-9A-F]{6}$', description: 'Secondary brand color' },
                    accentColor: { type: 'string', pattern: '^#[0-9A-F]{6}$', description: 'Accent color' },
                    theme: { type: 'string', enum: ['light', 'dark'], description: 'Theme preference' },
                    customCss: { type: 'string', nullable: true, description: 'Custom CSS styles (max 5000 chars)' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            OrganizationBrandingInput: {
                type: 'object',
                properties: {
                    logoUrl: { type: 'string', format: 'uri', nullable: true },
                    logoAltText: { type: 'string', nullable: true },
                    faviconUrl: { type: 'string', format: 'uri', nullable: true },
                    primaryColor: { type: 'string', pattern: '^#[0-9A-F]{6}$' },
                    secondaryColor: { type: 'string', pattern: '^#[0-9A-F]{6}$' },
                    accentColor: { type: 'string', pattern: '^#[0-9A-F]{6}$' },
                    theme: { type: 'string', enum: ['light', 'dark'] },
                    customCss: { type: 'string', nullable: true },
                },
            },
            OrganizationPreferences: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    organizationId: { type: 'string', format: 'uuid' },
                    emailNotifications: { type: 'boolean', description: 'Enable/disable email notifications' },
                    emailDigest: { type: 'string', enum: ['off', 'daily', 'weekly', 'monthly'], description: 'Email digest frequency' },
                    twoFactorAuth: { type: 'boolean', description: 'Enable/disable two-factor authentication' },
                    dataRetention: { type: 'integer', minimum: 1, maximum: 3650, description: 'Data retention period in days' },
                    backupFrequency: { type: 'string', enum: ['daily', 'weekly', 'monthly'], description: 'Backup frequency' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            OrganizationPreferencesInput: {
                type: 'object',
                properties: {
                    emailNotifications: { type: 'boolean' },
                    emailDigest: { type: 'string', enum: ['off', 'daily', 'weekly', 'monthly'] },
                    twoFactorAuth: { type: 'boolean' },
                    dataRetention: { type: 'integer', minimum: 1, maximum: 3650 },
                    backupFrequency: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
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
        '/api/organizations': {
            post: {
                summary: 'Create organization',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/OrganizationCreateRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Organization created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Organization' },
                            },
                        },
                    },
                    '409': {
                        description: 'Slug or email already exists',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
            get: {
                summary: 'List organizations (scoped to current organization)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'sort', in: 'query', schema: { type: 'string' } },
                    { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
                    { name: 'filters', in: 'query', schema: { type: 'string' } },
                    { name: 'includeDeleted', in: 'query', schema: { type: 'boolean' } },
                ],
                responses: {
                    '200': {
                        description: 'Organization list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Organization' },
                                        },
                                        meta: {
                                            type: 'object',
                                            properties: {
                                                page: { type: 'integer' },
                                                limit: { type: 'integer' },
                                                total: { type: 'integer' },
                                                totalPages: { type: 'integer' },
                                                hasNextPage: { type: 'boolean' },
                                                hasPreviousPage: { type: 'boolean' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/organizations/{organizationId}': {
            parameters: [
                {
                    name: 'organizationId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                },
            ],
            get: {
                summary: 'Get organization by ID',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Organization details',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Organization' },
                            },
                        },
                    },
                    '403': {
                        description: 'Forbidden for cross-organization access',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                    '404': {
                        description: 'Organization not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
            put: {
                summary: 'Update organization',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/OrganizationUpdateRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Organization updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Organization' },
                            },
                        },
                    },
                },
            },
            delete: {
                summary: 'Soft delete organization',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Organization soft deleted',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Organization' },
                            },
                        },
                    },
                },
            },
        },
        '/api/organizations/{organizationId}/restore': {
            parameters: [
                {
                    name: 'organizationId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                },
            ],
            post: {
                summary: 'Restore soft deleted organization',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Organization restored',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Organization' },
                            },
                        },
                    },
                    '404': {
                        description: 'Organization not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/organizations/{organizationId}/settings': {
            parameters: [
                {
                    name: 'organizationId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                },
            ],
            get: {
                summary: 'Get organization settings',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Organization settings retrieved',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/OrganizationSettings' },
                            },
                        },
                    },
                    '404': {
                        description: 'Organization not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
            put: {
                summary: 'Update organization settings',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/OrganizationSettingsInput' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Organization settings updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/OrganizationSettings' },
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
        '/api/organizations/{organizationId}/branding': {
            parameters: [
                {
                    name: 'organizationId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                },
            ],
            get: {
                summary: 'Get organization branding',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Organization branding retrieved',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/OrganizationBranding' },
                            },
                        },
                    },
                    '404': {
                        description: 'Organization not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
            put: {
                summary: 'Update organization branding',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/OrganizationBrandingInput' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Organization branding updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/OrganizationBranding' },
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
        '/api/organizations/{organizationId}/preferences': {
            parameters: [
                {
                    name: 'organizationId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                },
            ],
            get: {
                summary: 'Get organization preferences',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Organization preferences retrieved',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/OrganizationPreferences' },
                            },
                        },
                    },
                    '404': {
                        description: 'Organization not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                            },
                        },
                    },
                },
            },
            put: {
                summary: 'Update organization preferences',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/OrganizationPreferencesInput' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Organization preferences updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/OrganizationPreferences' },
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
    },
};
