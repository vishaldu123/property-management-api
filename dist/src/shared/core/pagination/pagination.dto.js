"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationResponse = exports.PaginationRequest = void 0;
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
/**
 * Pagination Request DTO
 */
class PaginationRequest {
    page;
    limit;
    sort;
    order;
    search;
    constructor(page = constants_1.APP_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = constants_1.APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT, sort = constants_1.APP_CONSTANTS.PAGINATION.DEFAULT_SORT, order = constants_1.APP_CONSTANTS.PAGINATION.DEFAULT_ORDER, search) {
        const validated = utils_1.PaginationUtil.validateParams(page, limit, constants_1.APP_CONSTANTS.PAGINATION.MIN_LIMIT, constants_1.APP_CONSTANTS.PAGINATION.MAX_LIMIT);
        this.page = validated.page;
        this.limit = validated.limit;
        this.sort = sort;
        this.order = utils_1.SortUtil.validateOrder(order);
        this.search = search ? utils_1.SearchUtil.sanitize(search) : undefined;
    }
    /**
     * Get skip value for database queries
     */
    getSkip() {
        return utils_1.PaginationUtil.calculateSkip(this.page, this.limit);
    }
    /**
     * Get sort order object for Prisma
     */
    getSortOrder() {
        return utils_1.SortUtil.buildSortOrder(this.sort, this.order);
    }
    /**
     * Get search query object for Prisma
     */
    getSearchQuery(fields) {
        if (!this.search)
            return {};
        return utils_1.SearchUtil.buildSearchQuery(this.search, fields);
    }
    /**
     * Calculate metadata
     */
    getMeta(total) {
        return utils_1.PaginationUtil.calculateMeta(this.page, this.limit, total);
    }
}
exports.PaginationRequest = PaginationRequest;
/**
 * Pagination Response DTO
 */
class PaginationResponse {
    data;
    meta;
    constructor(data, page, limit, total) {
        this.data = data;
        this.meta = utils_1.PaginationUtil.calculateMeta(page, limit, total);
    }
}
exports.PaginationResponse = PaginationResponse;
