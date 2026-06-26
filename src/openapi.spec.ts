/**
 * OpenAPI / Swagger Configuration
 * API documentation for the Property Management SaaS
 */

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Property Management API',
    version: '1.0.0',
    description: 'Enterprise-grade multi-tenant property management system',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
    {
      url: 'https://api.propertymanagement.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer token for API authentication',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
          },
          message: {
            type: 'string',
          },
          data: {
            type: 'object',
          },
        },
        required: ['success', 'message'],
      },
      ApiErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
        },
        required: ['success', 'message'],
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Validation failed',
          },
          errors: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            example: {
              email: ['Email is required', 'Invalid email format'],
              password: ['Password must be at least 8 characters'],
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          isActive: {
            type: 'boolean',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Organization: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
          },
          slug: {
            type: 'string',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          city: {
            type: 'string',
          },
          country: {
            type: 'string',
          },
          subscriptionPlan: {
            type: 'string',
            enum: ['FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE'],
          },
          subscriptionStatus: {
            type: 'string',
            enum: ['TRIAL', 'ACTIVE', 'PAUSED', 'CANCELLED'],
          },
          isActive: {
            type: 'boolean',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT access token',
          },
          refreshToken: {
            type: 'string',
            description: 'Refresh token for getting new access token',
          },
          user: {
            $ref: '#/components/schemas/User',
          },
          organization: {
            $ref: '#/components/schemas/Organization',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Unauthorized - Missing or invalid authentication',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiErrorResponse',
            },
            example: {
              success: false,
              message: 'Unauthorized',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Forbidden - User does not have access',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiErrorResponse',
            },
            example: {
              success: false,
              message: 'Access denied',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Not Found - Resource does not exist',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiErrorResponse',
            },
            example: {
              success: false,
              message: 'Resource not found',
            },
          },
        },
      },
      ValidationErrorResponse: {
        description: 'Bad Request - Validation failed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ValidationError',
            },
          },
        },
      },
      RateLimitError: {
        description: 'Too Many Requests - Rate limit exceeded',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiErrorResponse',
            },
            example: {
              success: false,
              message: 'Too many requests from this IP, please try again later.',
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiErrorResponse',
            },
            example: {
              success: false,
              message: 'Internal server error',
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Basic health check endpoint',
        responses: {
          '200': {
            description: 'Application is healthy',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
        },
      },
    },
    '/health/live': {
      get: {
        tags: ['Health'],
        summary: 'Liveness probe',
        description: 'Kubernetes liveness probe - checks if application is running',
        responses: {
          '200': {
            description: 'Application is running',
          },
          '503': {
            description: 'Application is not running',
          },
        },
      },
    },
    '/health/ready': {
      get: {
        tags: ['Health'],
        summary: 'Readiness probe',
        description: 'Kubernetes readiness probe - checks if application is ready to accept traffic',
        responses: {
          '200': {
            description: 'Application is ready',
          },
          '503': {
            description: 'Application is not ready',
          },
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user and organization',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'organizationName'],
                properties: {
                  name: {
                    type: 'string',
                    example: 'John Doe',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'john@example.com',
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    description: 'Must contain uppercase, lowercase, digit, and special character',
                    example: 'SecurePass123!',
                  },
                  organizationName: {
                    type: 'string',
                    example: 'Acme Properties',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User and organization created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationErrorResponse',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'john@example.com',
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    example: 'SecurePass123!',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationErrorResponse',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '429': {
            $ref: '#/components/responses/RateLimitError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          '200': {
            description: 'Current user information',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/v1/organizations': {
      get: {
        tags: ['Organizations'],
        summary: 'List organizations',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: {
              type: 'integer',
              default: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              default: 10,
            },
          },
          {
            name: 'search',
            in: 'query',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Organizations retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      post: {
        tags: ['Organizations'],
        summary: 'Create organization',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: {
                    type: 'string',
                  },
                  slug: {
                    type: 'string',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                  },
                  city: {
                    type: 'string',
                  },
                  country: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Organization created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationErrorResponse',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/v1/organizations/{organizationId}': {
      get: {
        tags: ['Organizations'],
        summary: 'Get organization by ID',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'organizationId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Organization retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      put: {
        tags: ['Organizations'],
        summary: 'Update organization',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'organizationId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  city: {
                    type: 'string',
                  },
                  country: {
                    type: 'string',
                  },
                  subscriptionPlan: {
                    type: 'string',
                    enum: ['FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE'],
                  },
                  subscriptionStatus: {
                    type: 'string',
                    enum: ['TRIAL', 'ACTIVE', 'PAUSED', 'CANCELLED'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Organization updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationErrorResponse',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      delete: {
        tags: ['Organizations'],
        summary: 'Delete organization (soft delete)',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'organizationId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Organization deleted successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '403': {
            $ref: '#/components/responses/ForbiddenError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/v1/rbac/permissions': {
      get: {
        tags: ['RBAC - Permissions'],
        summary: 'List permissions',
        description: 'Get all permissions in the organization with pagination and search',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Page number for pagination',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
            description: 'Results per page',
          },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', default: 'createdAt:desc' },
            description: 'Sort field and direction',
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search in permission key and description',
          },
        ],
        responses: {
          '200': {
            description: 'List of permissions',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      post: {
        tags: ['RBAC - Permissions'],
        summary: 'Create permission',
        description: 'Create a new permission (resource:action format)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  key: {
                    type: 'string',
                    example: 'property:read',
                  },
                  description: {
                    type: 'string',
                    example: 'View property details',
                  },
                },
                required: ['key'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Permission created',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationErrorResponse',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/v1/rbac/permissions/{permissionId}': {
      get: {
        tags: ['RBAC - Permissions'],
        summary: 'Get permission',
        description: 'Get a specific permission by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'permissionId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Permission details',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      put: {
        tags: ['RBAC - Permissions'],
        summary: 'Update permission',
        description: 'Update a permission',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'permissionId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  description: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Permission updated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      delete: {
        tags: ['RBAC - Permissions'],
        summary: 'Delete permission',
        description: 'Delete a permission (soft delete)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'permissionId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Permission deleted',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/v1/rbac/roles': {
      get: {
        tags: ['RBAC - Roles'],
        summary: 'List roles',
        description: 'Get all roles in the organization with pagination and search',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
          },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', default: 'createdAt:desc' },
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'List of roles',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      post: {
        tags: ['RBAC - Roles'],
        summary: 'Create role',
        description: 'Create a new role',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  key: {
                    type: 'string',
                    example: 'property_manager',
                  },
                  name: {
                    type: 'string',
                    example: 'Property Manager',
                  },
                  description: {
                    type: 'string',
                    example: 'Manages properties and tenants',
                  },
                },
                required: ['key', 'name'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Role created',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationErrorResponse',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/v1/rbac/roles/{roleId}': {
      get: {
        tags: ['RBAC - Roles'],
        summary: 'Get role',
        description: 'Get a specific role by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'roleId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Role details',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      put: {
        tags: ['RBAC - Roles'],
        summary: 'Update role',
        description: 'Update a role',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'roleId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Role updated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      delete: {
        tags: ['RBAC - Roles'],
        summary: 'Delete role',
        description: 'Delete a role (soft delete)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'roleId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Role deleted',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/v1/rbac/roles/{roleId}/clone': {
      post: {
        tags: ['RBAC - Roles'],
        summary: 'Clone role',
        description: 'Clone a role with all its permissions',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'roleId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  key: { type: 'string', example: 'custom_manager' },
                  name: { type: 'string', example: 'Custom Manager' },
                },
                required: ['key', 'name'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Role cloned',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/v1/rbac/roles/{roleId}/permissions': {
      post: {
        tags: ['RBAC - Role Permissions'],
        summary: 'Assign permission to role',
        description: 'Assign a single permission to a role',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'roleId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  permissionId: { type: 'string', format: 'uuid' },
                },
                required: ['permissionId'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Permission assigned',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      delete: {
        tags: ['RBAC - Role Permissions'],
        summary: 'Remove permission from role',
        description: 'Remove a permission from a role',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'roleId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'permissionId',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Permission removed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/v1/rbac/roles/{roleId}/permissions/bulk': {
      post: {
        tags: ['RBAC - Role Permissions'],
        summary: 'Assign multiple permissions to role',
        description: 'Assign multiple permissions to a role at once',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'roleId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  permissionIds: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                  },
                },
                required: ['permissionIds'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Permissions assigned',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/v1/rbac/users/roles': {
      post: {
        tags: ['RBAC - User Roles'],
        summary: 'Assign role to user',
        description: 'Assign a role to a user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'string', format: 'uuid' },
                  roleId: { type: 'string', format: 'uuid' },
                },
                required: ['userId', 'roleId'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Role assigned to user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationErrorResponse',
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      put: {
        tags: ['RBAC - User Roles'],
        summary: 'Replace user roles',
        description: 'Replace all roles for a user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'string', format: 'uuid' },
                  roleIds: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                  },
                },
                required: ['userId', 'roleIds'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User roles replaced',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/v1/rbac/users/{userId}/roles': {
      get: {
        tags: ['RBAC - User Roles'],
        summary: 'Get user roles',
        description: 'Get all roles assigned to a user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'User roles',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
      delete: {
        tags: ['RBAC - User Roles'],
        summary: 'Remove role from user',
        description: 'Remove a role from a user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'roleId',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Role removed from user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
    '/api/v1/rbac/users/{userId}/permissions': {
      get: {
        tags: ['RBAC - User Permissions'],
        summary: 'Get user permissions',
        description: 'Get all permissions granted to a user through their roles',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'User permissions',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError',
          },
          '404': {
            $ref: '#/components/responses/NotFoundError',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },
  },
};

export default openApiSpec;
