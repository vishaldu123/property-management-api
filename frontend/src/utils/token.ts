export const decodeToken = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const decoded = JSON.parse(atob(parts[1]))
    return decoded
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token)
  if (!decoded || typeof decoded.exp !== 'number') {
    return true
  }

  return decoded.exp * 1000 < Date.now()
}

export const getTokenExpiresIn = (token: string): number => {
  const decoded = decodeToken(token)
  if (!decoded || typeof decoded.exp !== 'number') {
    return 0
  }

  return Math.max(0, decoded.exp * 1000 - Date.now())
}
