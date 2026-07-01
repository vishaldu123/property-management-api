import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components'
import { useRbac } from '@/shared/hooks'
import { ADMIN_SECTIONS } from '../constants'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'

export const AdministrationHomePage: React.FC = () => {
  const { canManageMembers, canManageRbac } = useRbac()
  const isAdmin = canManageMembers() || canManageRbac()

  const sections = useMemo(
    () => ADMIN_SECTIONS.filter(section => !section.adminOnly || isAdmin),
    [isAdmin]
  )

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Administration & Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage organization configuration, security, profile, and system preferences.
        </p>
      </header>

      <section
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        aria-label="Administration sections"
      >
        {sections.map(section => (
          <Link
            key={section.id}
            to={section.href}
            className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Open ${section.title}`}
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start gap-3">
                <Cog6ToothIcon className="h-6 w-6 text-primary shrink-0" aria-hidden="true" />
                <div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <CardDescription className="mt-1">{section.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-primary font-medium">Open →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  )
}
