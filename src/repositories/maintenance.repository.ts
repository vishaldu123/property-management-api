import prisma from '../config/prisma';
import {
  CreateMaintenanceInput,
  UpdateMaintenanceInput,
  PaginationOptions,
  MaintenanceFilter,
  MaintenanceSearchOptions,
} from '../validators/maintenance.validators';
import { MaintenanceRequest } from '@prisma/client';

/**
 * Maintenance Request Repository
 * Handles data access operations for maintenance requests with organization scoping
 */
export class MaintenanceRepository {
  /**
   * Create a new maintenance request
   */
  async create(
    organizationId: string,
    data: CreateMaintenanceInput,
    userId: string
  ): Promise<MaintenanceRequest> {
    return prisma.maintenanceRequest.create({
      data: {
        organizationId,
        propertyId: data.propertyId,
        unitId: data.unitId,
        tenantId: data.tenantId,
        reportedBy: userId,
        assignedTo: data.assignedTo,
        requestNumber: data.requestNumber,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: data.status,
        requestedDate: new Date(data.requestedDate),
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        estimatedCost: data.estimatedCost,
        vendor: data.vendor,
        notes: data.notes,
        createdBy: userId,
      },
    });
  }

  /**
   * Find maintenance request by ID and organization
   */
  async findByIdAndOrganizationId(
    id: string,
    organizationId: string
  ): Promise<MaintenanceRequest | null> {
    return prisma.maintenanceRequest.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });
  }

  /**
   * List maintenance requests with filtering, sorting, and search
   */
  async listWithFilters(
    organizationId: string,
    options: PaginationOptions,
    filter?: MaintenanceFilter,
    search?: MaintenanceSearchOptions
  ): Promise<{
    requests: MaintenanceRequest[];
    total: number;
  }> {
    const skip = ((options.page || 1) - 1) * (options.limit || 20);
    const take = options.limit || 20;

    const whereClause: any = {
      organizationId,
      deletedAt: null,
    };

    // Apply filters
    if (filter) {
      if (filter.status) whereClause.status = filter.status;
      if (filter.priority) whereClause.priority = filter.priority;
      if (filter.category) whereClause.category = filter.category;
      if (filter.propertyId) whereClause.propertyId = filter.propertyId;
      if (filter.unitId) whereClause.unitId = filter.unitId;
      if (filter.assignedTo) whereClause.assignedTo = filter.assignedTo;

      // Date range filter
      if (filter.startDate || filter.endDate) {
        whereClause.requestedDate = {};
        if (filter.startDate) {
          whereClause.requestedDate.$gte = new Date(filter.startDate);
        }
        if (filter.endDate) {
          const endDate = new Date(filter.endDate);
          endDate.setHours(23, 59, 59, 999);
          whereClause.requestedDate.$lte = endDate;
        }
      }
    }

    // Apply search
    if (search?.query) {
      whereClause.OR = [
        { requestNumber: { contains: search.query, mode: 'insensitive' } },
        { title: { contains: search.query, mode: 'insensitive' } },
        { description: { contains: search.query, mode: 'insensitive' } },
        { notes: { contains: search.query, mode: 'insensitive' } },
      ];
    }

    // Build sort clause
    const orderBy: any = {};
    if (options.sortBy) {
      const sortField = options.sortBy as keyof MaintenanceRequest;
      orderBy[sortField] = options.sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.requestedDate = 'desc'; // Default sort
    }

    const [requests, total] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where: whereClause,
        orderBy,
        skip,
        take,
      }),
      prisma.maintenanceRequest.count({
        where: whereClause,
      }),
    ]);

    return { requests, total };
  }

  /**
   * Update maintenance request
   */
  async update(
    id: string,
    organizationId: string,
    data: UpdateMaintenanceInput,
    userId: string
  ): Promise<MaintenanceRequest> {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    if (data.scheduledDate !== undefined) updateData.scheduledDate = data.scheduledDate ? new Date(data.scheduledDate) : null;
    if (data.startedDate !== undefined) updateData.startedDate = data.startedDate ? new Date(data.startedDate) : null;
    if (data.completedDate !== undefined) updateData.completedDate = data.completedDate ? new Date(data.completedDate) : null;
    if (data.estimatedCost !== undefined) updateData.estimatedCost = data.estimatedCost;
    if (data.actualCost !== undefined) updateData.actualCost = data.actualCost;
    if (data.vendor !== undefined) updateData.vendor = data.vendor;
    if (data.notes !== undefined) updateData.notes = data.notes;

    updateData.updatedBy = userId;

    return prisma.maintenanceRequest.update({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: updateData,
    });
  }

  /**
   * Assign technician to maintenance request
   */
  async assignTechnician(
    id: string,
    organizationId: string,
    assignedTo: string,
    userId: string
  ): Promise<MaintenanceRequest> {
    return prisma.maintenanceRequest.update({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: {
        assignedTo,
        status: 'Assigned',
        updatedBy: userId,
      },
    });
  }

  /**
   * Change status of maintenance request
   */
  async changeStatus(
    id: string,
    organizationId: string,
    status: string,
    userId: string
  ): Promise<MaintenanceRequest> {
    const updateData: any = {
      status,
      updatedBy: userId,
    };

    // Auto-set dates based on status
    if (status === 'In Progress') {
      updateData.startedDate = new Date();
    } else if (status === 'Completed') {
      updateData.completedDate = new Date();
    }

    return prisma.maintenanceRequest.update({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: updateData,
    });
  }

  /**
   * Find maintenance requests by property
   */
  async findByPropertyId(
    organizationId: string,
    propertyId: string,
    options?: PaginationOptions
  ): Promise<MaintenanceRequest[]> {
    const skip = options ? ((options.page || 1) - 1) * (options.limit || 20) : 0;
    const take = options?.limit || 20;

    return prisma.maintenanceRequest.findMany({
      where: {
        organizationId,
        propertyId,
        deletedAt: null,
      },
      skip,
      take,
      orderBy: { requestedDate: 'desc' },
    });
  }

  /**
   * Find maintenance requests by unit
   */
  async findByUnitId(
    organizationId: string,
    unitId: string
  ): Promise<MaintenanceRequest[]> {
    return prisma.maintenanceRequest.findMany({
      where: {
        organizationId,
        unitId,
        deletedAt: null,
      },
      orderBy: { requestedDate: 'desc' },
    });
  }

  /**
   * Get organization-level maintenance statistics
   */
  async getOrganizationStatistics(organizationId: string): Promise<any> {
    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
    });

    const totalRequests = requests.length;
    const byStatus = {
      Open: requests.filter(r => r.status === 'Open').length,
      Assigned: requests.filter(r => r.status === 'Assigned').length,
      Scheduled: requests.filter(r => r.status === 'Scheduled').length,
      'In Progress': requests.filter(r => r.status === 'In Progress').length,
      'On Hold': requests.filter(r => r.status === 'On Hold').length,
      Completed: requests.filter(r => r.status === 'Completed').length,
      Cancelled: requests.filter(r => r.status === 'Cancelled').length,
    };

    const byPriority = {
      Low: requests.filter(r => r.priority === 'Low').length,
      Medium: requests.filter(r => r.priority === 'Medium').length,
      High: requests.filter(r => r.priority === 'High').length,
      Urgent: requests.filter(r => r.priority === 'Urgent').length,
      Emergency: requests.filter(r => r.priority === 'Emergency').length,
    };

    const totalEstimatedCost = requests.reduce(
      (sum, r) => sum + (r.estimatedCost?.toNumber() || 0),
      0
    );
    const totalActualCost = requests.reduce(
      (sum, r) => sum + (r.actualCost?.toNumber() || 0),
      0
    );

    return {
      totalRequests,
      byStatus,
      byPriority,
      totalEstimatedCost,
      totalActualCost,
    };
  }

  /**
   * Get property-level maintenance statistics
   */
  async getPropertyStatistics(
    organizationId: string,
    propertyId: string
  ): Promise<any> {
    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        organizationId,
        propertyId,
        deletedAt: null,
      },
    });

    const totalRequests = requests.length;
    const openRequests = requests.filter(r => r.status === 'Open').length;
    const completedRequests = requests.filter(r => r.status === 'Completed').length;

    const totalEstimatedCost = requests.reduce(
      (sum, r) => sum + (r.estimatedCost?.toNumber() || 0),
      0
    );

    return {
      totalRequests,
      openRequests,
      completedRequests,
      totalEstimatedCost,
    };
  }

  /**
   * Soft delete maintenance request
   */
  async softDelete(
    id: string,
    organizationId: string,
    userId: string
  ): Promise<MaintenanceRequest> {
    return prisma.maintenanceRequest.update({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  }

  /**
   * Restore deleted maintenance request
   */
  async restore(
    id: string,
    organizationId: string,
    userId: string
  ): Promise<MaintenanceRequest> {
    return prisma.maintenanceRequest.update({
      where: {
        id,
        organizationId,
      },
      data: {
        deletedAt: null,
        updatedBy: userId,
      },
    });
  }
}

export const maintenanceRepository = new MaintenanceRepository();
