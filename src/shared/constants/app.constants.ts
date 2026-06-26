/**
 * Application-wide constants
 */

export const APP_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MIN_LIMIT: 1,
    MAX_LIMIT: 100,
    DEFAULT_SORT: 'createdAt',
    DEFAULT_ORDER: 'desc' as const,
  },

  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\d\s\-\+\(\)]{10,}$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  },

  LENGTHS: {
    NAME_MIN: 2,
    NAME_MAX: 100,
    EMAIL_MIN: 5,
    EMAIL_MAX: 100,
    PASSWORD_MIN: 8,
    PASSWORD_MAX: 128,
    SLUG_MIN: 3,
    SLUG_MAX: 50,
    DESCRIPTION_MIN: 0,
    DESCRIPTION_MAX: 5000,
    PHONE_MIN: 10,
    PHONE_MAX: 20,
  },

  STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    PENDING: 'PENDING',
    DELETED: 'DELETED',
  },

  ROLES: {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    STAFF: 'STAFF',
    ACCOUNTANT: 'ACCOUNTANT',
    TENANT: 'TENANT',
  },

  SORT_ORDERS: {
    ASC: 'asc',
    DESC: 'desc',
  } as const,

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  DATE: {
    JWT_EXPIRY: {
      ACCESS_TOKEN: '15m',
      REFRESH_TOKEN: '7d',
      RESET_TOKEN: '15m',
    },
    DEFAULT_TIMEZONE: 'Asia/Kolkata',
  },

  MESSAGE: {
    SUCCESS: 'Operation successful',
    CREATED: 'Created successfully',
    UPDATED: 'Updated successfully',
    DELETED: 'Deleted successfully',
    NOT_FOUND: 'Resource not found',
    INVALID_INPUT: 'Invalid input provided',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Forbidden',
    CONFLICT: 'Resource already exists',
    INTERNAL_ERROR: 'Internal server error',
  },
} as const;
