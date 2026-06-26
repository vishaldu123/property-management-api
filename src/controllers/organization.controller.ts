import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../shared/core/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { organizationService } from '../services/organization.service';
import {
  CreateOrganizationInput,
  ListOrganizationsQuery,
  UpdateOrganizationInput,
  listOrganizationsQuerySchema,
} from '../validators/organization.validators';
import { UnauthorizedError } from '../utils/errors';

const getActorContext = (req: AuthenticatedRequest) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  return {
    userId: req.user.userId,
    organizationId: req.user.organizationId,
  };
};

export const createOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const actorUserId = (req as AuthenticatedRequest).user?.userId;
    const organization = await organizationService.createOrganization(
      req.body as CreateOrganizationInput,
      actorUserId
    );

    ApiResponse.created(res, organization, 'Organization created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const organizationId = req.params.organizationId as string;
    const organization = await organizationService.updateOrganization(
      organizationId,
      req.body as UpdateOrganizationInput,
      context
    );

    ApiResponse.success(res, organization, 'Organization updated successfully');
  } catch (error) {
    next(error);
  }
};

export const softDeleteOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const organizationId = req.params.organizationId as string;
    const organization = await organizationService.softDeleteOrganization(
      organizationId,
      context
    );

    ApiResponse.success(res, organization, 'Organization deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const restoreOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const organizationId = req.params.organizationId as string;
    const organization = await organizationService.restoreOrganization(organizationId, context);

    ApiResponse.success(res, organization, 'Organization restored successfully');
  } catch (error) {
    next(error);
  }
};

export const getOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const organizationId = req.params.organizationId as string;
    const organization = await organizationService.getOrganization(organizationId, context);

    ApiResponse.success(res, organization, 'Organization retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const listOrganizations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const query = listOrganizationsQuerySchema.parse(req.query) as ListOrganizationsQuery;
    const organizations = await organizationService.listOrganizations(
      query,
      context
    );

    ApiResponse.paginated(res, organizations.data, organizations.meta, 'Organizations retrieved successfully');
  } catch (error) {
    next(error);
  }
};
