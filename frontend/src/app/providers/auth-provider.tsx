import React, { createContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react'
import { User, Organization } from '@/types'
import { authService, organizationService } from '@/shared/services'
import { logger } from '@/shared/utils/logger'

export interface AuthContextType {
  user: User | null
  currentOrganization: Organization | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (_email: string, _password: string) => Promise<void> // eslint-disable-line @typescript-eslint/no-unused-vars
  register: (
    _email: string,
    _password: string,
    _firstName: string,
    _lastName: string
  ) => Promise<void> // eslint-disable-line @typescript-eslint/no-unused-vars
  logout: () => Promise<void>
  refresh: () => Promise<void>
  setCurrentOrganization: (_org: Organization) => void // eslint-disable-line @typescript-eslint/no-unused-vars
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Initialize auth state from storage and fetch current user
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        logger.debug('[AuthProvider] Initializing auth')
        const tokens = authService.getTokens()
        if (tokens && tokens.accessToken && tokens.refreshToken) {
          setIsAuthenticated(true)
          try {
            const currentUser = await authService.getCurrentUser()
            setUser(currentUser)

            // Try to load previously selected organization or select first one
            const savedOrgId = organizationService.getCurrentOrganization()
            if (
              savedOrgId &&
              currentUser.organizations.some(o => o.organizationId === savedOrgId)
            ) {
              try {
                const org = await organizationService.get(savedOrgId)
                setCurrentOrganizationState(org)
              } catch (orgError) {
                logger.error('[AuthProvider] Failed to load saved organization', orgError)
              }
            } else if (currentUser.organizations.length > 0) {
              // Select first organization
              try {
                const org = await organizationService.get(
                  currentUser.organizations[0].organizationId
                )
                organizationService.setCurrentOrganization(org.id)
                setCurrentOrganizationState(org)
              } catch (orgError) {
                logger.error('[AuthProvider] Failed to load first organization', orgError)
              }
            }
          } catch (userError) {
            logger.error('[AuthProvider] Failed to fetch current user', userError)
            // If we can't fetch the user, clear auth
            authService.clearSession()
            setIsAuthenticated(false)
            setUser(null)
            setCurrentOrganizationState(null)
          }
        } else {
          setIsAuthenticated(false)
          setUser(null)
          setCurrentOrganizationState(null)
        }
      } catch (error) {
        logger.error('[AuthProvider] Failed to initialize auth', error)
        authService.clearSession()
        setIsAuthenticated(false)
        setUser(null)
        setCurrentOrganizationState(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password })
      setUser(response.user)
      setIsAuthenticated(true)

      // Set first organization if available
      if (response.user.organizations.length > 0) {
        try {
          const org = await organizationService.get(response.user.organizations[0].organizationId)
          organizationService.setCurrentOrganization(org.id)
          setCurrentOrganizationState(org)
        } catch (orgError) {
          logger.error('[AuthProvider] Failed to fetch organization after login', orgError)
          // Don't fail login if org fails - just skip setting org
          // User will still be authenticated and can navigate
        }
      }
    } catch (error) {
      logger.error('[AuthProvider] Login failed', error)
      throw error
    }
  }, [])

  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      try {
        const response = await authService.register({ email, password, firstName, lastName })
        setUser(response.user)
        setIsAuthenticated(true)

        // Set first organization if available
        if (response.user.organizations.length > 0) {
          const org = await organizationService.get(response.user.organizations[0].organizationId)
          organizationService.setCurrentOrganization(org.id)
          setCurrentOrganizationState(org)
        }
      } catch (error) {
        logger.error('Registration failed', error)
        throw error
      }
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
      setCurrentOrganizationState(null)
    } catch (error) {
      logger.error('Logout failed', error)
      setUser(null)
      setIsAuthenticated(false)
      setCurrentOrganizationState(null)
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      await authService.refresh()
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      setIsAuthenticated(true)
    } catch (error) {
      logger.error('Token refresh failed', error)
      authService.clearSession()
      setIsAuthenticated(false)
      setUser(null)
      setCurrentOrganizationState(null)
      throw error
    }
  }, [])

  const setCurrentOrganization = useCallback((organization: Organization) => {
    organizationService.setCurrentOrganization(organization.id)
    setCurrentOrganizationState(organization)
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      currentOrganization,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      refresh,
      setCurrentOrganization,
    }),
    [
      user,
      currentOrganization,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      refresh,
      setCurrentOrganization,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
