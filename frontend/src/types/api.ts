/**
 * Backend API envelope types.
 * All successful API responses use: { success, message, data, meta? }
 */

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: PaginationMeta
  errors?: Record<string, string[]>
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages?: number
  pages?: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
}

/** Nested pagination shape used by RBAC and maintenance list endpoints */
export interface NestedPaginatedPayload<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages?: number
    totalPages?: number
  }
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
