import { describe, it, expect } from 'vitest'
import { unwrapApiResponse } from '@/shared/services/api-response'

describe('unwrapApiResponse', () => {
  it('unwraps a standard success envelope', () => {
    const result = unwrapApiResponse<{ id: string; email: string }>({
      success: true,
      message: 'Login successful',
      data: {
        id: 'user-1',
        email: 'test@example.com',
      },
    })

    expect(result).toEqual({
      id: 'user-1',
      email: 'test@example.com',
    })
  })

  it('unwraps auth tokens from the envelope', () => {
    const result = unwrapApiResponse<{ accessToken: string; refreshToken: string }>({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: 'user-1' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    })

    expect(result.accessToken).toBe('access-token')
    expect(result.refreshToken).toBe('refresh-token')
  })

  it('normalizes paginated responses with meta', () => {
    const result = unwrapApiResponse<{
      data: Array<{ id: string }>
      total: number
      page: number
      limit: number
      totalPages: number
    }>({
      success: true,
      message: 'Properties retrieved',
      data: [{ id: 'prop-1' }],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    })

    expect(result).toEqual({
      data: [{ id: 'prop-1' }],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    })
  })

  it('normalizes nested paginated RBAC responses', () => {
    const result = unwrapApiResponse<{
      data: Array<{ id: string; name: string }>
      total: number
      page: number
      limit: number
      totalPages: number
    }>({
      success: true,
      message: 'Permissions retrieved',
      data: {
        data: [{ id: 'perm-1', name: 'property.read' }],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          pages: 1,
        },
      },
    })

    expect(result).toEqual({
      data: [{ id: 'perm-1', name: 'property.read' }],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    })
  })

  it('returns non-envelope bodies unchanged', () => {
    const body = { hello: 'world' }
    expect(unwrapApiResponse(body)).toBe(body)
  })
})
