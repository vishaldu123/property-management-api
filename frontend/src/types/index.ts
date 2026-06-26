export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  avatar?: string
  roles: UserRole[]
  organizations: UserOrganization[]
  createdAt: string
  updatedAt: string
}

export interface UserRole {
  id: string
  userId: string
  organizationId: string
  roleId: string
  role?: Role
  createdAt: string
  updatedAt: string
}

export interface UserOrganization {
  id: string
  userId: string
  organizationId: string
  joinedAt: string
  organization?: Organization
}

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  favicon?: string
  ownerId: string
  settings?: OrganizationSettings
  branding?: OrganizationBranding
  preferences?: OrganizationPreferences
  createdAt: string
  updatedAt: string
}

export interface OrganizationSettings {
  id: string
  organizationId: string
  timezone: string
  currency: string
  dateFormat: string
  timeFormat: string
  language: string
  measurementUnit: string
  createdAt: string
  updatedAt: string
}

export interface OrganizationBranding {
  id: string
  organizationId: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  theme: 'light' | 'dark' | 'auto'
  customCss?: string
  createdAt: string
  updatedAt: string
}

export interface OrganizationPreferences {
  id: string
  organizationId: string
  emailNotificationsEnabled: boolean
  digestFrequency: 'daily' | 'weekly' | 'monthly' | 'never'
  twoFactorAuthRequired: boolean
  dataRetentionDays: number
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  organizationId: string
  name: string
  description?: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  organizationId: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface ApiError {
  statusCode: number
  message: string
  error?: string
  details?: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
