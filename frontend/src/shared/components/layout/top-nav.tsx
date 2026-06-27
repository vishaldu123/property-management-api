import React from 'react'
import { BellIcon, MoonIcon, SunIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { Button } from '@/shared/components/ui'
import { useAuth, useTheme } from '@/shared/hooks'
import { cn } from '@/utils/cn'

export const TopNav: React.FC = () => {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="hidden lg:flex items-center gap-4">
          <h2 className="text-sm text-muted-foreground">Welcome back</h2>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </Button>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-medium">{user?.displayName}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
              <ChevronDownIcon
                className={cn('w-4 h-4 transition-transform', userMenuOpen && 'rotate-180')}
              />
            </Button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg py-2">
                <p className="px-4 py-2 text-xs text-muted-foreground">Logged in as</p>
                <p className="px-4 py-1 text-sm font-medium">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
