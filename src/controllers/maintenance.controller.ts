import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { maintenanceService } from '../services/maintenance.service';
import { ApiResponse } from '../shared/core/response';
import logger from '../utils/logger';
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  listMaintenanceSchema,
  maintenanceIdParamSchema,
  propertyIdParamSchema,
  assignTechnicianSchema,
  changeStatusSchema,
  addNotesSchema,
  reopenRequestSchema,
} from '../validators/maintenance.validators';

/**
 * Helper function to extract actor context from request
 */
function getActorContext(req: AuthenticatedRequest) {
  return {
    userId: req.user?.userId || '',
    organizationId: req.user?.organizationId || '',
  };
}

/**
 * Helper function to safely extract parameter
 */
function getParam(param: any): string | undefined {
  return typeof param === 'string' ? param : undefined;
}

/**
 * Create a new maintenance request
 * POST /api/v1/maintenance
 */
export const createMaintenance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = getActorContext(req);

    const validation = createMaintenanceSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const request = await maintenanceService.createRequest(
      ctx.organizationId,
      validation.data,
      ctx.userId
    );

    ApiResponse.created(
      res,
      request,
      'Maintenance request created successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get maintenance request by ID
 * GET /api/v1/maintenance/:maintenanceId
 */
export const getMaintenance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = maintenanceIdParamSchema.safeParse({
      maintenanceId: getParam(req.params.maintenanceId),
    });
    if (!paramValidation.success) {
      const errors = paramValidation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const request = await maintenanceService.getRequest(
      paramValidation.data.maintenanceId,
      ctx.organizationId
    );

    ApiResponse.success(res, request, 'Maintenance request retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * List maintenance requests with filtering
 * GET /api/v1/maintenance
 */
export const listMaintenance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = getActorContext(req);

    const validation = listMaintenanceSchema.safeParse(req.query);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const { page, limit, sortBy, sortOrder, ...filterData } = validation.data;

    const filter: any = {};
    if (filterData.status) filter.status = filterData.status;
    if (filterData.priority) filter.priority = filterData.priority;
    if (filterData.category) filter.category = filterData.category;
    if (filterData.propertyId) filter.propertyId = filterData.propertyId;
    if (filterData.unitId) filter.unitId = filterData.unitId;
    if (filterData.assignedTo) filter.assignedTo = filterData.assignedTo;
    if (filterData.startDate) filter.startDate = filterData.startDate;
    if (filterData.endDate) filter.endDate = filterData.endDate;

    const { requests, total } = await maintenanceService.listRequests(
      ctx.organizationId,
      { page, limit, sortBy, sortOrder },
      Object.keys(filter).length > 0 ? filter : undefined,
      filterData.search ? { query: filterData.search } : undefined
    );

    ApiResponse.success(res, {
      data: requests,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / (limit || 20)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update maintenance request
 * PUT /api/v1/maintenance/:maintenanceId
 */
export const updateMaintenance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = maintenanceIdParamSchema.safeParse({
      maintenanceId: getParam(req.params.maintenanceId),
    });
    if (!paramValidation.success) {
      const errors = paramValidation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const bodyValidation = updateMaintenanceSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      const errors = bodyValidation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const request = await maintenanceService.updateRequest(
      paramValidation.data.maintenanceId,
      ctx.organizationId,
      bodyValidation.data,
      ctx.userId
    );

    ApiResponse.success(res, request, 'Maintenance request updated');
  } catch (error) {
    next(error);
  }
};

/**
 * Assign technician to maintenance request
 * PATCH /api/v1/maintenance/:maintenanceId/assign
 */
export const assignTechnician = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = maintenanceIdParamSchema.safeParse({
      maintenanceId: getParam(req.params.maintenanceId),
    });
    if (!paramValidation.success) {
      const errors = paramValidation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const bodyValidation = assignTechnicianSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      const errors = bodyValidation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const request = await maintenanceService.assignTechnician(
      paramValidation.data.maintenanceId,
      ctx.organizationId,
      bodyValidation.data.assignedTo,
      ctx.userId
    );

    ApiResponse.success(res, request, 'Technician assigned successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Change status of maintenance request
 * PATCH /api/v1/maintenance/:maintenanceId/change-status
 */
export const changeStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = maintenanceIdParamSchema.safeParse({
      maintenanceId: getParam(req.params.maintenanceId),
    });
    if (!paramValidation.success) {
      const errors = paramValidation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const bodyValidation = changeStatusSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      const errors = bodyValidation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const request = await maintenanceService.changeStatus(
      paramValidation.data.maintenanceId,
      ctx.organizationId,
      bodyValidation.data.status,
      ctx.userId
    );

    ApiResponse.success(res, request, 'Status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add notes to maintenance request
 * PATCH /api/v1/maintenance/:maintenanceId/notes
 */
export const addNotes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = maintenanceIdParamSchema.safeParse({
      maintenanceId: getParam(req.params.maintenanceId),
    });
    if (!paramValidation.success) {
      const errors = paramValidation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const bodyValidation = addNotesSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      const errors = bodyValidation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const request = await maintenanceService.updateRequest(
      paramValidation.data.maintenanceId,
      ctx.organizationId,
      { notes: bodyValidation.data.notes },
      ctx.userId
    );

    ApiResponse.success(res, request, 'Notes added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get organization maintenance statistics
 * GET /api/v1/maintenance/stats/organization
 */
export const getOrganizationStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = getActorContext(req);

    const stats = await maintenanceService.getOrganizationStatistics(
      ctx.organizationId
    );

    ApiResponse.success(res, stats, 'Organization statistics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get property maintenance statistics
 * GET /api/v1/maintenance/properties/:propertyId/stats
 */
export const getPropertyStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = propertyIdParamSchema.safeParse({
      propertyId: getParam(req.params.propertyId),
    });
    if (!paramValidation.success) {
      const errors = paramValidation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const stats = await maintenanceService.getPropertyStatistics(
      ctx.organizationId,
      paramValidation.data.propertyId
    );

    ApiResponse.success(res, stats, 'Property statistics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete maintenance request
 * DELETE /api/v1/maintenance/:maintenanceId
 */
export const deleteMaintenance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = maintenanceIdParamSchema.safeParse({
      maintenanceId: getParam(req.params.maintenanceId),
    });
    if (!paramValidation.success) {
      const errors = paramValidation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    await maintenanceService.deleteRequest(
      paramValidation.data.maintenanceId,
      ctx.organizationId,
      ctx.userId
    );

    ApiResponse.success(
      res,
      null,
      'Maintenance request deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Restore deleted maintenance request
 * PATCH /api/v1/maintenance/:maintenanceId/restore
 */
export const restoreMaintenance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = maintenanceIdParamSchema.safeParse({
      maintenanceId: getParam(req.params.maintenanceId),
    });
    if (!paramValidation.success) {
      const errors = paramValidation.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const request = await maintenanceService.restoreRequest(
      paramValidation.data.maintenanceId,
      ctx.organizationId,
      ctx.userId
    );

    ApiResponse.success(
      res,
      request,
      'Maintenance request restored successfully'
    );
  } catch (error) {
    next(error);
  }
};
