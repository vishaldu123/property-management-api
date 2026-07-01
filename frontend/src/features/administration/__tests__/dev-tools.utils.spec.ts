import { describe, it, expect, afterEach } from 'vitest'
import { isDevToolsEnabled } from '../utils/dev-tools.utils'

describe('dev-tools.utils', () => {
  const original = import.meta.env.VITE_ENABLE_DEV_TOOLS

  afterEach(() => {
    import.meta.env.VITE_ENABLE_DEV_TOOLS = original
  })

  it('isDevToolsEnabled returns true in test/dev builds', () => {
    expect(isDevToolsEnabled()).toBe(true)
  })

  it('isDevToolsEnabled respects VITE_ENABLE_DEV_TOOLS flag', () => {
    import.meta.env.VITE_ENABLE_DEV_TOOLS = 'true'
    expect(isDevToolsEnabled()).toBe(true)
  })
})
