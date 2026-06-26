import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/shared/components/ui'
import { useAuth } from '@/shared/hooks'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />,
  },
]

interface SidebarProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ open = true, onOpenChange }) => {
  const location = useLocation()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onOpenChange?.(!open)}
        >
          {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
            <h1 className="text-xl font-bold text-primary">Property Management</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center justify-between px-4 py-2 rounded-md transition-colors',
                  location.pathname === item.href
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
            ))}
          </nav>

          {/* Logout button */}
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  )
}
