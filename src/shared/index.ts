/**
 * Shared exports - Single entry point for all shared infrastructure
 */

// Constants
export { APP_CONSTANTS } from './constants';

// Exceptions
export {
  AppException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  InternalServerErrorException,
  ServiceUnavailableException,
  ValidationException,
} from './exceptions';

// Types
export {
  IUser,
  IOrganization,
  IPaginationMeta,
  IPaginatedResponse,
  IFilterOptions as IFilteringOptions,
  IAuditFields,
  ISoftDeleteable,
  IBaseEntity,
  IRequestContext,
} from './types';

// Utilities
export {
  UUIDGenerator,
  PasswordUtil,
  TokenUtil,
  DateUtil,
  PaginationUtil,
  SearchUtil,
  SortUtil,
  ValidationUtil,
} from './utils';

// Core Modules
export { ApiResponse } from './core/response';
export { PaginationRequest, PaginationResponse } from './core/pagination';
export { FilterBuilder, type IFilter } from './core/filtering';
export { BaseRepository } from './core/repository';
export { RequestContextManager, requestContextMiddleware } from './core/context';
export { LoggerService, loggerMiddleware } from './logger';
export { ValidationSchemas, validate, validateOrThrow } from './validation';
