import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Squares2X2Icon,
  Cog6ToothIcon,
  UsersIcon,
  KeyIcon,
  BuildingOfficeIcon,
  DocumentIcon,
  CreditCardIcon,
  WrenchIcon,
  ChartBarSquareIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'
import { Button } from '@/shared/components/ui'
import { useAuth } from '@/shared/hooks'
import { OrganizationSwitcher } from '@/shared/components'
import { getRoleNames } from '@/shared/utils/rbac'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  requiredRoles?: string[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Squares2X2Icon className="w-5 h-5" />,
  },
  {
    label: 'Properties',
    href: '/properties',
    icon: <BuildingOfficeIcon className="w-5 h-5" />,
  },
  {
    label: 'Leases',
    href: '/leases',
    icon: <DocumentIcon className="w-5 h-5" />,
  },
  {
    label: 'Payments',
    href: '/payments',
    icon: <CreditCardIcon className="w-5 h-5" />,
  },
  {
    label: 'Maintenance',
    href: '/maintenance',
    icon: <WrenchIcon className="w-5 h-5" />,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: <ChartBarSquareIcon className="w-5 h-5" />,
  },
  {
    label: 'Team',
    href: '/organization/members',
    icon: <UsersIcon className="w-5 h-5" />,
    requiredRoles: ['organization_admin', 'organization_owner'],
  },
  {
    label: 'Roles & Permissions',
    href: '/rbac',
    icon: <KeyIcon className="w-5 h-5" />,
    requiredRoles: ['organization_admin', 'organization_owner'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Cog6ToothIcon className="w-5 h-5" />,
  },
]

interface SidebarProps {
  open?: boolean
  onOpenChange?: (_isOpen: boolean) => void // eslint-disable-line @typescript-eslint/no-unused-vars
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onOpenChange }) => {
  const location = useLocation()
  const { user, currentOrganization } = useAuth()

  // Get user's roles for the current organization
  const userRoles = user?.roles || []
  const roleNames = getRoleNames(userRoles)

  // Filter nav items based on user's roles
  const visibleNavItems = navItems.filter(item => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true
    }
    return item.requiredRoles.some(role => roleNames.includes(role))
  })

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button variant="outline" size="icon" onClick={() => onOpenChange?.(!open)}>
          {open ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => onOpenChange?.(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform duration-200 lg:translate-x-0 lg:static',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8 mt-4 lg:mt-0">
            <h1 className="text-xl font-bold text-primary">Property Mgmt</h1>
          </div>

          {/* Organization Switcher */}
          {currentOrganization && (
            <div className="mb-6 pb-6 border-b border-border">
              <OrganizationSwitcher
                currentOrganizationId={currentOrganization.id}
                onOrganizationChange={() => onOpenChange?.(false)}
              />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto">
            {visibleNavItems.map(item => {
              const isActive =
                location.pathname === item.href || location.pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center justify-between px-4 py-2 rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                  onClick={() => onOpenChange?.(false)}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="text-xs font-semibold bg-destructive text-destructive-foreground rounded-full px-2 py-1">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground px-4">
              Organization: {currentOrganization?.name || 'None selected'}
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
