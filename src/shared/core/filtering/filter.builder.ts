/**
 * Filtering Interface and Utilities
 */

export interface IFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: any;
}

export interface IFilterOptions {
  filters?: IFilter[];
  search?: string;
  searchFields?: string[];
  sort?: string;
  order?: 'asc' | 'desc';
}

export class FilterBuilder {
  /**
   * Build Prisma where clause from filters
   */
  static buildWhereClause(filters: IFilter[]): Record<string, any> {
    const whereClause: Record<string, any> = {};

    for (const filter of filters) {
      const operatorMap: Record<string, any> = {
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
  static parseFilterString(filterString: string): IFilter[] {
    const filters: IFilter[] = [];

    if (!filterString) return filters;

    const filterParts = filterString.split(',');

    for (const part of filterParts) {
      const [field, operator, value] = part.split(':');

      if (field && operator && value) {
        filters.push({
          field: field.trim(),
          operator: operator as any,
          value: this.parseValue(value),
        });
      }
    }

    return filters;
  }

  /**
   * Parse filter value based on type
   */
  private static parseValue(value: string): any {
    // Try to parse as number
    if (!isNaN(Number(value)) && value !== '') {
      return Number(value);
    }

    // Try to parse as boolean
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Try to parse as JSON (for arrays/objects)
    if (value.startsWith('[') || value.startsWith('{')) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    return value;
  }
}
