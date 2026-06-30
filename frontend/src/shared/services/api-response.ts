import type {
  ApiResponse,
  NestedPaginatedPayload,
  PaginatedResult,
  PaginationMeta,
} from '@/types/api'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toPaginatedResult<T>(items: T[], meta: PaginationMeta): PaginatedResult<T> {
  return {
    data: items,
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
    totalPages: meta.totalPages ?? meta.pages ?? 0,
  }
}

function isNestedPaginatedPayload<T>(value: unknown): value is NestedPaginatedPayload<T> {
  if (!isRecord(value) || !Array.isArray(value.data) || !isRecord(value.pagination)) {
    return false
  }

  const { pagination } = value
  return (
    typeof pagination.page === 'number' &&
    typeof pagination.limit === 'number' &&
    typeof pagination.total === 'number'
  )
}

function isFlatPaginatedPayload<T>(value: unknown): value is {
  data: T[]
  total: number
  pages?: number
  page?: number
  limit?: number
} {
  if (!isRecord(value) || !Array.isArray(value.data) || typeof value.total !== 'number') {
    return false
  }

  return !isRecord(value.pagination)
}

/**
 * Unwraps the backend API envelope into the payload consumed by frontend services.
 */
export function unwrapApiResponse<T>(body: unknown): T {
  if (!isRecord(body) || body.success !== true || !('data' in body)) {
    return body as T
  }

  const envelope = body as unknown as ApiResponse<unknown>
  const { data, meta } = envelope

  if (meta && Array.isArray(data)) {
    return toPaginatedResult(data, meta) as T
  }

  if (isNestedPaginatedPayload(data)) {
    return toPaginatedResult(data.data, {
      page: data.pagination.page,
      limit: data.pagination.limit,
      total: data.pagination.total,
      totalPages: data.pagination.totalPages ?? data.pagination.pages,
    }) as T
  }

  if (isFlatPaginatedPayload(data)) {
    const limit = (data.limit ?? data.data.length) || 10
    const page = data.page ?? 1
    return toPaginatedResult(data.data, {
      page,
      limit,
      total: data.total,
      totalPages: data.pages ?? Math.ceil(data.total / Math.max(limit, 1)),
    }) as T
  }

  return data as T
}
