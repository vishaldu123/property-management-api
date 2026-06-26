"use strict";
/**
 * Filtering Interface and Utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterBuilder = void 0;
class FilterBuilder {
    /**
     * Build Prisma where clause from filters
     */
    static buildWhereClause(filters) {
        const whereClause = {};
        for (const filter of filters) {
            const operatorMap = {
                eq: filter.value,
                ne: { not: filter.value },
                gt: { gt: filter.value },
                gte: { gte: filter.value },
                lt: { lt: filter.value },
                lte: { lte: filter.value },
                contains: { contains: filter.value, mode: 'insensitive' },
                in: { in: Array.isArray(filter.value) ? filter.value : [filter.value] },
            };
            whereClause[filter.field] = operatorMap[filter.operator] || filter.value;
        }
        return whereClause;
    }
    /**
     * Parse filter string (e.g., "status:eq:ACTIVE,createdAt:gte:2024-01-01")
     */
    static parseFilterString(filterString) {
        const filters = [];
        if (!filterString)
            return filters;
        const filterParts = filterString.split(',');
        for (const part of filterParts) {
            const [field, operator, value] = part.split(':');
            if (field && operator && value) {
                filters.push({
                    field: field.trim(),
                    operator: operator,
                    value: this.parseValue(value),
                });
            }
        }
        return filters;
    }
    /**
     * Parse filter value based on type
     */
    static parseValue(value) {
        // Try to parse as number
        if (!isNaN(Number(value)) && value !== '') {
            return Number(value);
        }
        // Try to parse as boolean
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        // Try to parse as JSON (for arrays/objects)
        if (value.startsWith('[') || value.startsWith('{')) {
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        }
        return value;
    }
}
exports.FilterBuilder = FilterBuilder;
