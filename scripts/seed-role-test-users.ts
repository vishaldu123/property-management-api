/**
 * Seeds one test user per system RBAC role in a shared organization.
 *
 * Usage: npm run seed:role-users
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from '../src/config/prisma';
import { rbacService } from '../src/services/rbac.service';
import { roleRepository } from '../src/repositories/role.repository';
import { userRoleRepository } from '../src/repositories/user-role.repository';

const PASSWORD = 'Admin@123';
const EMAIL_LOCAL = 'vishal.du123';
const EMAIL_DOMAIN = 'gmail.com';
const ORG_NAME = 'Vishal Role Test Organization';
const ORG_SLUG = 'vishal-role-test';

const ROLE_USERS = [
  { key: 'super_admin', name: 'Super Admin', membershipRole: 'ADMIN' as const, isOwner: false },
  { key: 'organization_owner', name: 'Organization Owner', membershipRole: 'OWNER' as const, isOwner: true },
  { key: 'organization_admin', name: 'Organization Admin', membershipRole: 'ADMIN' as const, isOwner: false },
  { key: 'property_manager', name: 'Property Manager', membershipRole: 'MEMBER' as const, isOwner: false },
  { key: 'accountant', name: 'Accountant', membershipRole: 'MEMBER' as const, isOwner: false },
  { key: 'maintenance_manager', name: 'Maintenance Manager', membershipRole: 'MEMBER' as const, isOwner: false },
  { key: 'staff', name: 'Staff', membershipRole: 'MEMBER' as const, isOwner: false },
  { key: 'read_only', name: 'Read Only', membershipRole: 'MEMBER' as const, isOwner: false },
];

function emailForRole(roleKey: string): string {
  return `${EMAIL_LOCAL}+${roleKey}@${EMAIL_DOMAIN}`;
}

async function upsertUser(email: string, displayName: string, passwordHash: string) {
  const existing = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { name: displayName, password: passwordHash },
    });
  }

  return prisma.user.create({
    data: { email, name: displayName, password: passwordHash },
  });
}

async function ensureMembership(
  organizationId: string,
  userId: string,
  membershipRole: string,
  isOwner: boolean,
  createdBy: string
) {
  const existing = await prisma.organizationUser.findFirst({
    where: { organizationId, userId, deletedAt: null },
  });

  if (existing) {
    return prisma.organizationUser.update({
      where: { id: existing.id },
      data: { role: membershipRole, isOwner, status: 'ACTIVE' },
    });
  }

  return prisma.organizationUser.create({
    data: {
      organizationId,
      userId,
      role: membershipRole,
      isOwner,
      status: 'ACTIVE',
      createdBy,
    },
  });
}

async function assignRoleByKey(organizationId: string, userId: string, roleKey: string, assignedBy: string) {
  const role = await roleRepository.findByOrganizationAndKey(organizationId, roleKey);
  if (!role) {
    throw new Error(`Role not found: ${roleKey}`);
  }

  await prisma.userRole.updateMany({
    where: { organizationId, userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  const hasDuplicate = await userRoleRepository.hasDuplicate(organizationId, userId, role.id);
  if (!hasDuplicate) {
    await userRoleRepository.assignRole({
      organizationId,
      userId,
      roleId: role.id,
      assignedBy,
    });
  }
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  let organization = await prisma.organization.findFirst({
    where: { slug: ORG_SLUG, deletedAt: null },
  });

  const ownerConfig = ROLE_USERS.find(r => r.key === 'organization_owner')!;
  const ownerUser = await upsertUser(
    emailForRole(ownerConfig.key),
    ownerConfig.name,
    passwordHash
  );

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: ORG_NAME,
        slug: ORG_SLUG,
        email: emailForRole(ownerConfig.key),
        createdBy: ownerUser.id,
      },
    });
    console.log(`Created organization: ${ORG_NAME} (${organization.id})`);
  } else {
    console.log(`Using existing organization: ${ORG_NAME} (${organization.id})`);
  }

  await ensureMembership(organization.id, ownerUser.id, 'OWNER', true, ownerUser.id);
  await rbacService.seedSystemRoles(organization.id, ownerUser.id);

  const credentials: Array<{ role: string; email: string; password: string }> = [];

  for (const roleUser of ROLE_USERS) {
    const email = emailForRole(roleUser.key);
    const user = await upsertUser(email, roleUser.name, passwordHash);

    await ensureMembership(
      organization.id,
      user.id,
      roleUser.membershipRole,
      roleUser.isOwner,
      ownerUser.id
    );

    await assignRoleByKey(organization.id, user.id, roleUser.key, ownerUser.id);

    credentials.push({
      role: roleUser.key,
      email,
      password: PASSWORD,
    });

    console.log(`Ready: ${roleUser.key} -> ${email}`);
  }

  console.log('\n--- Test credentials (shared org) ---');
  console.log(`Organization: ${ORG_NAME}`);
  console.log(`Password (all users): ${PASSWORD}\n`);
  console.table(credentials);
}

main()
  .catch(error => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
