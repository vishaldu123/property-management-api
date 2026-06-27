import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
  ArrowLeftOnRectangleIcon,
  UserIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/shared/components/ui'
import { useAuth, useTheme } from '@/shared/hooks'
import { cn } from '@/utils/cn'

export const TopNav: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleProfileClick = () => {
    navigate('/profile')
    setUserMenuOpen(false)
  }

  const handleSettingsClick = () => {
    navigate('/settings')
    setUserMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="hidden lg:flex items-center gap-4">
          <h2 className="text-sm font-medium text-foreground">
            Welcome back, {user?.firstName || 'User'}
          </h2>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" title="Notifications">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </Button>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              title="User menu"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <span className="text-sm font-semibold">{user?.firstName?.charAt(0) || 'U'}</span>
                </div>
                <div className="hidden sm:flex flex-col items-start gap-0.5">
                  <span className="text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </div>
              <ChevronDownIcon
                className={cn('w-4 h-4 transition-transform', userMenuOpen && 'rotate-180')}
              />
            </Button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-md shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>

                <button
                  onClick={handleProfileClick}
                  className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2 text-left"
                >
                  <UserIcon className="w-4 h-4" />
                  Profile
                </button>

                <button
                  onClick={handleSettingsClick}
                  className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2 text-left"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  Settings
                </button>

                <div className="border-t border-border mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2 text-left"
                  >
                    <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
