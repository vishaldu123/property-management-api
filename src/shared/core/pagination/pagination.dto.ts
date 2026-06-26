import { APP_CONSTANTS } from '../../constants';
import { PaginationUtil, SearchUtil, SortUtil } from '../../utils';

/**
 * Pagination Request DTO
 */

export class PaginationRequest {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;

  constructor(
    page: number = APP_CONSTANTS.PAGINATION.DEFAULT_PAGE,
    limit: number = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
    sort: string = APP_CONSTANTS.PAGINATION.DEFAULT_SORT,
    order: 'asc' | 'desc' = APP_CONSTANTS.PAGINATION.DEFAULT_ORDER as any,
    search?: string
  ) {
    const validated = PaginationUtil.validateParams(
      page,
      limit,
      APP_CONSTANTS.PAGINATION.MIN_LIMIT,
      APP_CONSTANTS.PAGINATION.MAX_LIMIT
    );

    this.page = validated.page;
    this.limit = validated.limit;
    this.sort = sort;
    this.order = SortUtil.validateOrder(order);
    this.search = search ? SearchUtil.sanitize(search) : undefined;
  }

  /**
   * Get skip value for database queries
   */
  getSkip(): number {
    return PaginationUtil.calculateSkip(this.page, this.limit);
  }

  /**
   * Get sort order object for Prisma
   */
  getSortOrder(): Record<string, 'asc' | 'desc'> {
    return SortUtil.buildSortOrder(this.sort, this.order);
  }

  /**
   * Get search query object for Prisma
   */
  getSearchQuery(fields: string[]): Record<string, any> {
    if (!this.search) return {};
    return SearchUtil.buildSearchQuery(this.search, fields);
  }

  /**
   * Calculate metadata
   */
  getMeta(total: number) {
    return PaginationUtil.calculateMeta(this.page, this.limit, total);
  }
}

/**
 * Pagination Response DTO
 */

export class PaginationResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  constructor(
    data: T[],
    page: number,
    limit: number,
    total: number
  ) {
    this.data = data;
    this.meta = PaginationUtil.calculateMeta(page, limit, total);
  }
}
