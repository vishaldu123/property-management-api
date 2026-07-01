export interface OrganizationMember {
  id: string
  userId: string
  organizationId: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'REMOVED'
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface OrganizationInvitation {
  id: string
  organizationId: string
  email: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED'
  invitedBy: string
  expiresAt: string
  createdAt: string
}

export interface ListMembersParams {
  page?: number
  limit?: number
  search?: string
  status?: OrganizationMember['status']
  role?: OrganizationMember['role']
  sort?: 'name' | 'email' | 'joinedAt' | 'status'
  order?: 'asc' | 'desc'
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  density: 'comfortable' | 'compact'
  sidebarCollapsed: boolean
  language: string
  notifications: {
    email: boolean
    browser: boolean
    maintenance: boolean
    payments: boolean
    leaseExpiration: boolean
    weeklySummary: boolean
  }
  profile: {
    phone: string
    avatarUrl: string
  }
}

export interface AuditLogEntry {
  id: string
  user: string
  action: string
  entity: string
  timestamp: string
}

export interface SystemInfo {
  frontendVersion: string
  backendVersion: string
  environment: string
  buildDate: string
  browser: string
}

export interface BrandingFormValues {
  logoUrl: string
  faviconUrl: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  theme: string
}
