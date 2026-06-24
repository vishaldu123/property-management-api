"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDefaultRolePermissions = exports.getRolePermissions = exports.rolePermissionMap = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
exports.rolePermissionMap = {
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
const getRolePermissions = (role) => exports.rolePermissionMap[role] || [];
exports.getRolePermissions = getRolePermissions;
const seedDefaultRolePermissions = async () => {
    const allPermissions = Object.entries(exports.rolePermissionMap).flatMap(([role, permissions]) => permissions.map((permission) => ({ role: role, permission })));
    for (const item of allPermissions) {
        await prisma_1.default.rolePermission.upsert({
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
exports.seedDefaultRolePermissions = seedDefaultRolePermissions;
