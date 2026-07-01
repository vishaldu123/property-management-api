export const ADMIN_QUERY_KEY = ['administration'] as const

export const USER_PREFERENCES_KEY = 'user-preferences'

export const ADMIN_SECTIONS = [
  {
    id: 'organization-settings',
    title: 'Organization Settings',
    description: 'Name, contact details, timezone, currency, and language',
    href: '/admin/organization/settings',
    adminOnly: true,
  },
  {
    id: 'organization-branding',
    title: 'Organization Branding',
    description: 'Logo, colors, and visual identity preview',
    href: '/admin/organization/branding',
    adminOnly: true,
  },
  {
    id: 'users',
    title: 'User Management',
    description: 'Members, roles, status, and team actions',
    href: '/admin/users',
    adminOnly: true,
  },
  {
    id: 'invitations',
    title: 'Invitation Management',
    description: 'Invite users and manage pending invitations',
    href: '/admin/invitations',
    adminOnly: true,
  },
  {
    id: 'roles',
    title: 'Role Assignment',
    description: 'Assign roles and view permission summaries',
    href: '/admin/roles',
    adminOnly: true,
  },
  {
    id: 'security',
    title: 'Security Settings',
    description: 'Password, sessions, MFA, and API keys',
    href: '/admin/security',
    adminOnly: false,
  },
  {
    id: 'profile',
    title: 'Profile Settings',
    description: 'Personal information and preferences',
    href: '/admin/profile',
    adminOnly: false,
  },
  {
    id: 'appearance',
    title: 'Appearance Settings',
    description: 'Theme, density, sidebar, and language',
    href: '/admin/appearance',
    adminOnly: false,
  },
  {
    id: 'notifications',
    title: 'Notification Preferences',
    description: 'Email, browser, and event notifications',
    href: '/admin/notifications',
    adminOnly: false,
  },
  {
    id: 'audit',
    title: 'Audit Log Viewer',
    description: 'Organization activity and change history',
    href: '/admin/audit',
    adminOnly: true,
  },
  {
    id: 'about',
    title: 'About / System Information',
    description: 'Version, environment, and build details',
    href: '/admin/about',
    adminOnly: false,
  },
] as const

export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Australia/Sydney',
]

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD']

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
]
