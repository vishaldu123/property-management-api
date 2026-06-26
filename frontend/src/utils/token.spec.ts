import { describe, it, expect } from 'vitest'
import { decodeToken, isTokenExpired, getTokenExpiresIn } from '@/utils/token'

describe('Token Utils', () => {
  const futureTime = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  const pastTime = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago

  const createToken = (exp: number): string => {
    const payload = { exp, sub: 'user-123' }
    return `header.${btoa(JSON.stringify(payload))}.signature`
  }

  describe('decodeToken', () => {
    it('decodes a valid token', () => {
      const token = createToken(futureTime)
      const decoded = decodeToken(token)

      expect(decoded).toBeDefined()
      expect(decoded?.exp).toBe(futureTime)
      expect(decoded?.sub).toBe('user-123')
    })

    it('returns null for invalid token', () => {
      const decoded = decodeToken('invalid-token')
      expect(decoded).toBeNull()
    })
  })

  describe('isTokenExpired', () => {
    it('returns false for non-expired token', () => {
      const token = createToken(futureTime)
      expect(isTokenExpired(token)).toBe(false)
    })

    it('returns true for expired token', () => {
      const token = createToken(pastTime)
      expect(isTokenExpired(token)).toBe(true)
    })

    it('returns true for invalid token', () => {
      expect(isTokenExpired('invalid-token')).toBe(true)
    })
  })

  describe('getTokenExpiresIn', () => {
    it('returns positive ms for non-expired token', () => {
      const token = createToken(futureTime)
      const expiresIn = getTokenExpiresIn(token)
      expect(expiresIn).toBeGreaterThan(0)
      expect(expiresIn).toBeLessThanOrEqual(3600 * 1000)
    })

    it('returns 0 for expired token', () => {
      const token = createToken(pastTime)
      expect(getTokenExpiresIn(token)).toBe(0)
    })
  })
})
