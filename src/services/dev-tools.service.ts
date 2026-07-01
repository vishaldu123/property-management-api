import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/prisma';
import { ConflictError } from '../utils/errors';

export interface DevToolsDataCounts {
  properties: number;
  units: number;
  tenants: number;
  leases: number;
  payments: number;
  maintenanceRequests: number;
}

const DEMO_PREFIX = 'DEMO';

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0);
  return date;
}

function daysAgo(days: number): Date {
  return daysFromNow(-days);
}

/**
 * Remove all operational portfolio data for an organization.
 * Preserves users, roles, settings, and organization metadata.
 */
export async function resetOrganizationData(organizationId: string): Promise<DevToolsDataCounts> {
  await prisma.$transaction([
    prisma.maintenanceRequest.deleteMany({ where: { organizationId } }),
    prisma.payment.deleteMany({ where: { organizationId } }),
    prisma.lease.deleteMany({ where: { organizationId } }),
    prisma.tenant.deleteMany({ where: { organizationId } }),
    prisma.unit.deleteMany({ where: { organizationId } }),
    prisma.property.deleteMany({ where: { organizationId } }),
  ]);

  return {
    properties: 0,
    units: 0,
    tenants: 0,
    leases: 0,
    payments: 0,
    maintenanceRequests: 0,
  };
}

/**
 * Seed a realistic demo portfolio for dashboards, reports, and manual testing.
 */
export async function seedDemoData(
  organizationId: string,
  userId: string,
  options: { force?: boolean } = {}
): Promise<DevToolsDataCounts> {
  const existingProperties = await prisma.property.count({ where: { organizationId } });

  if (existingProperties > 0 && !options.force) {
    throw new ConflictError(
      'Organization already has portfolio data. Reset data first or pass force=true to replace it.'
    );
  }

  if (existingProperties > 0 && options.force) {
    await resetOrganizationData(organizationId);
  }

  const propertyA = await prisma.property.create({
    data: {
      organizationId,
      name: 'Sunset Gardens Apartments',
      code: `${DEMO_PREFIX}-PROP-001`,
      description: 'Mid-rise residential complex with garden courtyard',
      propertyType: 'Apartment',
      status: 'ACTIVE',
      address: '1200 Sunset Boulevard',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      postalCode: '78701',
      timezone: 'America/Chicago',
      totalUnits: 4,
      yearBuilt: 2018,
      createdBy: userId,
    },
  });

  const propertyB = await prisma.property.create({
    data: {
      organizationId,
      name: 'Oakwood Business Center',
      code: `${DEMO_PREFIX}-PROP-002`,
      description: 'Mixed-use commercial property with retail frontage',
      propertyType: 'Commercial',
      status: 'ACTIVE',
      address: '455 Oakwood Avenue',
      city: 'Dallas',
      state: 'TX',
      country: 'USA',
      postalCode: '75201',
      timezone: 'America/Chicago',
      totalUnits: 2,
      yearBuilt: 2015,
      createdBy: userId,
    },
  });

  const units = await Promise.all([
    prisma.unit.create({
      data: {
        organizationId,
        propertyId: propertyA.id,
        unitNumber: '101',
        name: 'Garden View Studio',
        floor: 1,
        unitType: 'Studio',
        status: 'Occupied',
        bedrooms: 0,
        bathrooms: 1,
        area: new Decimal('520'),
        rentAmount: new Decimal('1450'),
        securityDeposit: new Decimal('1450'),
        createdBy: userId,
      },
    }),
    prisma.unit.create({
      data: {
        organizationId,
        propertyId: propertyA.id,
        unitNumber: '102',
        name: 'Courtyard One Bedroom',
        floor: 1,
        unitType: 'Apartment',
        status: 'Occupied',
        bedrooms: 1,
        bathrooms: 1,
        area: new Decimal('780'),
        rentAmount: new Decimal('1850'),
        securityDeposit: new Decimal('1850'),
        createdBy: userId,
      },
    }),
    prisma.unit.create({
      data: {
        organizationId,
        propertyId: propertyA.id,
        unitNumber: '201',
        name: 'Balcony Two Bedroom',
        floor: 2,
        unitType: 'Apartment',
        status: 'Available',
        bedrooms: 2,
        bathrooms: 2,
        area: new Decimal('1050'),
        rentAmount: new Decimal('2400'),
        securityDeposit: new Decimal('2400'),
        availabilityDate: daysFromNow(7),
        createdBy: userId,
      },
    }),
    prisma.unit.create({
      data: {
        organizationId,
        propertyId: propertyA.id,
        unitNumber: '202',
        name: 'Penthouse Suite',
        floor: 2,
        unitType: 'Apartment',
        status: 'Reserved',
        bedrooms: 2,
        bathrooms: 2,
        area: new Decimal('1180'),
        rentAmount: new Decimal('2750'),
        securityDeposit: new Decimal('2750'),
        createdBy: userId,
      },
    }),
    prisma.unit.create({
      data: {
        organizationId,
        propertyId: propertyB.id,
        unitNumber: 'A-1',
        name: 'Retail Unit A',
        floor: 1,
        unitType: 'Shop',
        status: 'Occupied',
        area: new Decimal('1400'),
        rentAmount: new Decimal('4200'),
        securityDeposit: new Decimal('8400'),
        createdBy: userId,
      },
    }),
    prisma.unit.create({
      data: {
        organizationId,
        propertyId: propertyB.id,
        unitNumber: 'B-2',
        name: 'Office Suite B',
        floor: 2,
        unitType: 'Office',
        status: 'Under Maintenance',
        area: new Decimal('980'),
        rentAmount: new Decimal('3100'),
        securityDeposit: new Decimal('6200'),
        createdBy: userId,
      },
    }),
  ]);

  const [unit101, unit102, , , unitA1] = units;

  const tenants = await Promise.all([
    prisma.tenant.create({
      data: {
        organizationId,
        unitId: unit101.id,
        firstName: 'Emily',
        lastName: 'Chen',
        email: `${DEMO_PREFIX.toLowerCase()}.emily.chen@example.com`,
        phone: '+1-512-555-0101',
        status: 'Active',
        occupation: 'Software Engineer',
        employer: 'TechCorp',
        createdBy: userId,
      },
    }),
    prisma.tenant.create({
      data: {
        organizationId,
        unitId: unit102.id,
        firstName: 'Marcus',
        lastName: 'Johnson',
        email: `${DEMO_PREFIX.toLowerCase()}.marcus.johnson@example.com`,
        phone: '+1-512-555-0102',
        status: 'Active',
        occupation: 'Marketing Manager',
        employer: 'Bright Media',
        createdBy: userId,
      },
    }),
    prisma.tenant.create({
      data: {
        organizationId,
        firstName: 'Sofia',
        lastName: 'Ramirez',
        email: `${DEMO_PREFIX.toLowerCase()}.sofia.ramirez@example.com`,
        phone: '+1-512-555-0103',
        status: 'Prospect',
        createdBy: userId,
      },
    }),
    prisma.tenant.create({
      data: {
        organizationId,
        unitId: unitA1.id,
        firstName: 'David',
        lastName: 'Okonkwo',
        email: `${DEMO_PREFIX.toLowerCase()}.david.okonkwo@example.com`,
        phone: '+1-214-555-0201',
        status: 'Active',
        occupation: 'Retail Owner',
        employer: 'Oakwood Goods',
        createdBy: userId,
      },
    }),
  ]);

  const [tenantEmily, tenantMarcus, , tenantDavid] = tenants;

  const leases = await Promise.all([
    prisma.lease.create({
      data: {
        organizationId,
        propertyId: propertyA.id,
        unitId: unit101.id,
        tenantId: tenantEmily.id,
        leaseNumber: `${DEMO_PREFIX}-LEASE-001`,
        startDate: daysAgo(180),
        endDate: daysFromNow(185),
        moveInDate: daysAgo(175),
        monthlyRent: new Decimal('1450'),
        securityDeposit: new Decimal('1450'),
        status: 'Active',
        renewalOption: true,
        createdBy: userId,
      },
    }),
    prisma.lease.create({
      data: {
        organizationId,
        propertyId: propertyA.id,
        unitId: unit102.id,
        tenantId: tenantMarcus.id,
        leaseNumber: `${DEMO_PREFIX}-LEASE-002`,
        startDate: daysAgo(90),
        endDate: daysFromNow(45),
        moveInDate: daysAgo(88),
        monthlyRent: new Decimal('1850'),
        securityDeposit: new Decimal('1850'),
        status: 'Active',
        renewalOption: true,
        createdBy: userId,
      },
    }),
    prisma.lease.create({
      data: {
        organizationId,
        propertyId: propertyB.id,
        unitId: unitA1.id,
        tenantId: tenantDavid.id,
        leaseNumber: `${DEMO_PREFIX}-LEASE-003`,
        startDate: daysAgo(365),
        endDate: daysFromNow(30),
        moveInDate: daysAgo(360),
        monthlyRent: new Decimal('4200'),
        securityDeposit: new Decimal('8400'),
        status: 'Active',
        createdBy: userId,
      },
    }),
  ]);

  const [lease1, lease2, lease3] = leases;

  await Promise.all([
    prisma.payment.create({
      data: {
        organizationId,
        leaseId: lease1.id,
        propertyId: propertyA.id,
        unitId: unit101.id,
        tenantId: tenantEmily.id,
        paymentNumber: `${DEMO_PREFIX}-PAY-001`,
        amount: new Decimal('1450'),
        paymentDate: daysAgo(5),
        dueDate: daysAgo(5),
        status: 'Paid',
        paymentMethod: 'BankTransfer',
        paymentType: 'Rent',
        paidAt: daysAgo(5),
        paidAmount: new Decimal('1450'),
        createdBy: userId,
      },
    }),
    prisma.payment.create({
      data: {
        organizationId,
        leaseId: lease1.id,
        propertyId: propertyA.id,
        unitId: unit101.id,
        tenantId: tenantEmily.id,
        paymentNumber: `${DEMO_PREFIX}-PAY-002`,
        amount: new Decimal('1450'),
        paymentDate: daysAgo(35),
        dueDate: daysAgo(35),
        status: 'Paid',
        paymentMethod: 'Online',
        paymentType: 'Rent',
        paidAt: daysAgo(34),
        paidAmount: new Decimal('1450'),
        createdBy: userId,
      },
    }),
    prisma.payment.create({
      data: {
        organizationId,
        leaseId: lease2.id,
        propertyId: propertyA.id,
        unitId: unit102.id,
        tenantId: tenantMarcus.id,
        paymentNumber: `${DEMO_PREFIX}-PAY-003`,
        amount: new Decimal('1850'),
        paymentDate: daysAgo(2),
        dueDate: daysAgo(10),
        status: 'Overdue',
        paymentMethod: 'BankTransfer',
        paymentType: 'Rent',
        outstandingBalance: new Decimal('1850'),
        createdBy: userId,
      },
    }),
    prisma.payment.create({
      data: {
        organizationId,
        leaseId: lease2.id,
        propertyId: propertyA.id,
        unitId: unit102.id,
        tenantId: tenantMarcus.id,
        paymentNumber: `${DEMO_PREFIX}-PAY-004`,
        amount: new Decimal('1850'),
        paymentDate: daysFromNow(5),
        dueDate: daysFromNow(5),
        status: 'Pending',
        paymentMethod: 'BankTransfer',
        paymentType: 'Rent',
        outstandingBalance: new Decimal('1850'),
        createdBy: userId,
      },
    }),
    prisma.payment.create({
      data: {
        organizationId,
        leaseId: lease3.id,
        propertyId: propertyB.id,
        unitId: unitA1.id,
        tenantId: tenantDavid.id,
        paymentNumber: `${DEMO_PREFIX}-PAY-005`,
        amount: new Decimal('4200'),
        paymentDate: daysAgo(8),
        dueDate: daysAgo(8),
        status: 'Paid',
        paymentMethod: 'Cheque',
        paymentType: 'Rent',
        paidAt: daysAgo(7),
        paidAmount: new Decimal('4200'),
        createdBy: userId,
      },
    }),
  ]);

  await Promise.all([
    prisma.maintenanceRequest.create({
      data: {
        organizationId,
        propertyId: propertyA.id,
        unitId: unit102.id,
        tenantId: tenantMarcus.id,
        reportedBy: userId,
        requestNumber: `${DEMO_PREFIX}-MR-001`,
        title: 'Kitchen faucet leak',
        description: 'Slow drip under the kitchen sink; tenant reports increased water bill.',
        category: 'Plumbing',
        priority: 'Medium',
        status: 'Open',
        requestedDate: daysAgo(1),
        estimatedCost: new Decimal('175'),
        createdBy: userId,
      },
    }),
    prisma.maintenanceRequest.create({
      data: {
        organizationId,
        propertyId: propertyB.id,
        unitId: units[5].id,
        reportedBy: userId,
        requestNumber: `${DEMO_PREFIX}-MR-002`,
        title: 'HVAC not cooling office suite',
        description: 'Office suite B air handler running but not producing cold air.',
        category: 'HVAC',
        priority: 'High',
        status: 'In Progress',
        requestedDate: daysAgo(3),
        startedDate: daysAgo(1),
        estimatedCost: new Decimal('650'),
        vendor: 'CoolAir Services',
        createdBy: userId,
      },
    }),
    prisma.maintenanceRequest.create({
      data: {
        organizationId,
        propertyId: propertyA.id,
        unitId: unit101.id,
        tenantId: tenantEmily.id,
        reportedBy: userId,
        requestNumber: `${DEMO_PREFIX}-MR-003`,
        title: 'Replace hallway light fixture',
        description: 'Fixture replaced and tested successfully.',
        category: 'Electrical',
        priority: 'Low',
        status: 'Completed',
        requestedDate: daysAgo(14),
        completedDate: daysAgo(10),
        actualCost: new Decimal('95'),
        createdBy: userId,
      },
    }),
  ]);

  return {
    properties: 2,
    units: 6,
    tenants: 4,
    leases: 3,
    payments: 5,
    maintenanceRequests: 3,
  };
}

export async function getOrganizationDataCounts(organizationId: string): Promise<DevToolsDataCounts> {
  const [properties, units, tenants, leases, payments, maintenanceRequests] = await Promise.all([
    prisma.property.count({ where: { organizationId } }),
    prisma.unit.count({ where: { organizationId } }),
    prisma.tenant.count({ where: { organizationId } }),
    prisma.lease.count({ where: { organizationId } }),
    prisma.payment.count({ where: { organizationId } }),
    prisma.maintenanceRequest.count({ where: { organizationId } }),
  ]);

  return { properties, units, tenants, leases, payments, maintenanceRequests };
}
