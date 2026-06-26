/**
 * Pagination Utilities
 */

export class PaginationUtil {
  /**
   * Calculate pagination metadata
   */
  static calculateMeta(
    page: number,
    limit: number,
    total: number
  ): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Calculate skip value for database queries
   */
  static calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Validate pagination params
   */
  static validateParams(
    page: number,
    limit: number,
    minLimit: number = 1,
    maxLimit: number = 100
  ): { page: number; limit: number } {
    return {
      page: Math.max(1, page),
      limit: Math.max(minLimit, Math.min(limit, maxLimit)),
    };
  }
}

/**
 * Search Utilities
 */

export class SearchUtil {
  /**
   * Build search query for Prisma
   */
  static buildSearchQuery(search: string, fields: string[]): Record<string, any> {
    if (!search) return {};

    return {
      OR: fields.map((field) => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      })),
    };
  }

  /**
   * Sanitize search input
   */
  static sanitize(search: string): string {
    return search
      .trim()
      .replace(/[%_\\]/g, '\\$&')
      .slice(0, 255);
  }
}

/**
 * Sorting Utilities
 */

export class SortUtil {
  /**
   * Build sort order for Prisma
   */
  static buildSortOrder(
    sort: string,
    order: 'asc' | 'desc'
  ): Record<string, 'asc' | 'desc'> {
    // Prevent injection by validating sort field
    if (!/^[a-zA-Z0-9_\.]+$/.test(sort)) {
      return { createdAt: order };
    }

    return { [sort]: order };
  }

  /**
   * Validate sort order
   */
  static validateOrder(order: any): 'asc' | 'desc' {
    return order === 'asc' ? 'asc' : 'desc';
  }
}
