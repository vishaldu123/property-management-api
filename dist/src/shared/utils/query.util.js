"use strict";
/**
 * Pagination Utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortUtil = exports.SearchUtil = exports.PaginationUtil = void 0;
class PaginationUtil {
    /**
     * Calculate pagination metadata
     */
    static calculateMeta(page, limit, total) {
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
    static calculateSkip(page, limit) {
        return (page - 1) * limit;
    }
    /**
     * Validate pagination params
     */
    static validateParams(page, limit, minLimit = 1, maxLimit = 100) {
        return {
            page: Math.max(1, page),
            limit: Math.max(minLimit, Math.min(limit, maxLimit)),
        };
    }
}
exports.PaginationUtil = PaginationUtil;
/**
 * Search Utilities
 */
class SearchUtil {
    /**
     * Build search query for Prisma
     */
    static buildSearchQuery(search, fields) {
        if (!search)
            return {};
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
    static sanitize(search) {
        return search
            .trim()
            .replace(/[%_\\]/g, '\\$&')
            .slice(0, 255);
    }
}
exports.SearchUtil = SearchUtil;
/**
 * Sorting Utilities
 */
class SortUtil {
    /**
     * Build sort order for Prisma
     */
    static buildSortOrder(sort, order) {
        // Prevent injection by validating sort field
        if (!/^[a-zA-Z0-9_\.]+$/.test(sort)) {
            return { createdAt: order };
        }
        return { [sort]: order };
    }
    /**
     * Validate sort order
     */
    static validateOrder(order) {
        return order === 'asc' ? 'asc' : 'desc';
    }
}
exports.SortUtil = SortUtil;
