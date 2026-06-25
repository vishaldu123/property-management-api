/**
 * RBAC Service
 * Role-based access control definitions and utilities
 * Note: Actual RBAC implementation (seeding, checking permissions) is deferred to Phase 2
 */

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'ACCOUNTANT' | 'MEMBER';

export type Permission =
  | 'PROPERTY_CREATE'
  | 'PROPERTY_READ'
  | 'PROPERTY_UPDATE'
  | 'PROPERTY_DELETE'
  | 'UNIT_CREATE'
  | 'UNIT_READ'
  | 'UNIT_UPDATE'
  | 'UNIT_DELETE'
  | 'TENANT_CREATE'
  | 'TENANT_READ'
  | 'LEASE_CREATE'
  | 'LEASE_READ'
  | 'LEASE_UPDATE'
  | 'LEASE_DELETE'
  | 'PAYMENT_CREATE'
  | 'PAYMENT_READ'
  | 'PAYMENT_INITIATE'
  | 'PAYMENT_UPDATE'
  | 'PAYMENT_DELETE';

/**
 * Default role-permission mapping
 * Used for reference during Phase 2 RBAC implementation
 */
export const rolePermissionMap: Record<UserRole, Permission[]> = {
  OWNER: [
    'PROPERTY_CREATE',
    'PROPERTY_READ',
    'PROPERTY_UPDATE',
    'PROPERTY_DELETE',
    'UNIT_CREATE',
    'UNIT_READ',
    'UNIT_UPDATE',
    'UNIT_DELETE',
    'TENANT_CREATE',
    'TENANT_READ',
    'LEASE_CREATE',
    'LEASE_READ',
    'LEASE_UPDATE',
    'LEASE_DELETE',
    'PAYMENT_CREATE',
    'PAYMENT_READ',
    'PAYMENT_INITIATE',
    'PAYMENT_UPDATE',
    'PAYMENT_DELETE',
  ],
  ADMIN: [
    'PROPERTY_CREATE',
    'PROPERTY_READ',
    'PROPERTY_UPDATE',
    'PROPERTY_DELETE',
    'UNIT_CREATE',
    'UNIT_READ',
    'UNIT_UPDATE',
    'UNIT_DELETE',
    'TENANT_CREATE',
    'TENANT_READ',
    'LEASE_CREATE',
    'LEASE_READ',
    'LEASE_UPDATE',
    'LEASE_DELETE',
    'PAYMENT_CREATE',
    'PAYMENT_READ',
    'PAYMENT_INITIATE',
    'PAYMENT_UPDATE',
    'PAYMENT_DELETE',
  ],
  MANAGER: [
    'PROPERTY_CREATE',
    'PROPERTY_READ',
    'PROPERTY_UPDATE',
    'UNIT_CREATE',
    'UNIT_READ',
    'UNIT_UPDATE',
    'TENANT_CREATE',
    'TENANT_READ',
    'LEASE_CREATE',
    'LEASE_READ',
    'LEASE_UPDATE',
    'PAYMENT_CREATE',
    'PAYMENT_READ',
    'PAYMENT_INITIATE',
    'PAYMENT_UPDATE',
  ],
  STAFF: [
    'PROPERTY_READ',
    'UNIT_READ',
    'TENANT_READ',
    'LEASE_READ',
    'PAYMENT_READ',
  ],
  ACCOUNTANT: [
    'PROPERTY_READ',
    'UNIT_READ',
    'TENANT_READ',
    'LEASE_READ',
    'PAYMENT_CREATE',
    'PAYMENT_READ',
    'PAYMENT_INITIATE',
    'PAYMENT_UPDATE',
    'PAYMENT_DELETE',
  ],
  MEMBER: [
    'PROPERTY_READ',
    'UNIT_READ',
    'TENANT_READ',
    'LEASE_READ',
    'PAYMENT_READ',
  ],
};

/**
 * Get permissions for a given role
 * @param role User role
 * @returns Array of permissions for the role
 */
export const getRolePermissions = (role: UserRole): Permission[] => {
  return rolePermissionMap[role] || [];
};

// TODO: Phase 2 - Implement RBAC seeding with proper database persistence
// export const seedDefaultRolePermissions = async () => { ... }

