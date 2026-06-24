import prisma from '../config/prisma';
import { Permission, UserRole } from '../middleware/auth.middleware';

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

export const getRolePermissions = (role: UserRole): Permission[] => rolePermissionMap[role] || [];

export const seedDefaultRolePermissions = async () => {
  const allPermissions = Object.entries(rolePermissionMap).flatMap(([role, permissions]) =>
    permissions.map((permission) => ({ role: role as UserRole, permission }))
  );

  for (const item of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: item.role,
          permissionId: item.permission,
        },
      },
      update: {},
      create: {
        roleId: item.role,
        permissionId: item.permission,
      },
    });
  }
};
