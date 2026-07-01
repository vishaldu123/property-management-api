import { describe, it, expect, vi, afterEach } from 'vitest'
import { logger } from '@/shared/utils/logger'

describe('logger', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('always forwards warnings and errors', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    logger.warn('warn message')
    logger.error('error message')

    expect(warnSpy).toHaveBeenCalledWith('warn message')
    expect(errorSpy).toHaveBeenCalledWith('error message')
  })

  it('exposes debug and info helpers', () => {
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.info).toBe('function')
    // Should not throw when invoked
    expect(() => logger.debug('x')).not.toThrow()
    expect(() => logger.info('y')).not.toThrow()
  })
})
