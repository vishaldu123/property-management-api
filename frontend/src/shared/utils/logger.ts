/* eslint-disable no-console */
/**
 * Production-safe logger.
 *
 * Debug/info logs are suppressed in production builds to avoid leaking
 * internal state to the browser console. Warnings and errors are always
 * emitted so they remain visible to monitoring tools.
 */
const isDev = import.meta.env.DEV

export const logger = {
  debug: (...args: unknown[]): void => {
    if (isDev) {
      console.debug(...args)
    }
  },
  info: (...args: unknown[]): void => {
    if (isDev) {
      console.info(...args)
    }
  },
  warn: (...args: unknown[]): void => {
    console.warn(...args)
  },
  error: (...args: unknown[]): void => {
    console.error(...args)
  },
}
