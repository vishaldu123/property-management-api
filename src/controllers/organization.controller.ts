import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../shared/core/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { organizationService } from '../services/organization.service';
import {
  CreateOrganizationInput,
  ListOrganizationsQuery,
  UpdateOrganizationInput,
  OrganizationSettingsInput,
  OrganizationBrandingInput,
  OrganizationPreferencesInput,
  listOrganizationsQuerySchema,
  organizationSettingsSchema,
  organizationBrandingSchema,
  organizationPreferencesSchema,
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

// Organization Settings Controllers
export const getOrganizationSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const organizationId = req.params.organizationId as string;
    const settings = await organizationService.getOrganizationSettings(organizationId, context);

    ApiResponse.success(res, settings, 'Organization settings retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateOrganizationSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const organizationId = req.params.organizationId as string;
    const payload = organizationSettingsSchema.parse(req.body) as OrganizationSettingsInput;
    const settings = await organizationService.updateOrganizationSettings(organizationId, payload, context);

    ApiResponse.success(res, settings, 'Organization settings updated successfully');
  } catch (error) {
    next(error);
  }
};

// Organization Branding Controllers
export const getOrganizationBranding = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const organizationId = req.params.organizationId as string;
    const branding = await organizationService.getOrganizationBranding(organizationId, context);

    ApiResponse.success(res, branding, 'Organization branding retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateOrganizationBranding = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const organizationId = req.params.organizationId as string;
    const payload = organizationBrandingSchema.parse(req.body) as OrganizationBrandingInput;
    const branding = await organizationService.updateOrganizationBranding(organizationId, payload, context);

    ApiResponse.success(res, branding, 'Organization branding updated successfully');
  } catch (error) {
    next(error);
  }
};

// Organization Preferences Controllers
export const getOrganizationPreferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const organizationId = req.params.organizationId as string;
    const preferences = await organizationService.getOrganizationPreferences(organizationId, context);

    ApiResponse.success(res, preferences, 'Organization preferences retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateOrganizationPreferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const context = getActorContext(req);
    const organizationId = req.params.organizationId as string;
    const payload = organizationPreferencesSchema.parse(req.body) as OrganizationPreferencesInput;
    const preferences = await organizationService.updateOrganizationPreferences(organizationId, payload, context);

    ApiResponse.success(res, preferences, 'Organization preferences updated successfully');
  } catch (error) {
    next(error);
  }
};
