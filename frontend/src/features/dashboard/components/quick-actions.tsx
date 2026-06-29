import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BuildingOffice2Icon,
  HomeModernIcon,
  UserPlusIcon,
  DocumentPlusIcon,
  BanknotesIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components'
import { Button } from '@/shared/components/ui/button'
import { usePermissionGate } from '@/shared/hooks'

interface QuickAction {
  label: string
  href: string
  permission: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'New Property',
    href: '/properties/create',
    permission: 'property:create',
    icon: BuildingOffice2Icon,
  },
  {
    label: 'New Unit',
    href: '/units/create',
    permission: 'unit:create',
    icon: HomeModernIcon,
  },
  {
    label: 'New Tenant',
    href: '/tenants/create',
    permission: 'tenant:create',
    icon: UserPlusIcon,
  },
  {
    label: 'New Lease',
    href: '/leases',
    permission: 'lease:create',
    icon: DocumentPlusIcon,
  },
  {
    label: 'Record Payment',
    href: '/payments',
    permission: 'payment:create',
    icon: BanknotesIcon,
  },
  {
    label: 'Create Maintenance Request',
    href: '/maintenance',
    permission: 'maintenance:create',
    icon: WrenchIcon,
  },
]

export const QuickActions: React.FC = () => {
  const navigate = useNavigate()
  const { canPerform } = usePermissionGate()

  const visibleActions = QUICK_ACTIONS.filter(action => canPerform(action.permission))

  if (visibleActions.length === 0) {
    return null
  }

  return (
    <Card aria-label="Quick actions">
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
        <CardDescription>Common tasks for your organization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {visibleActions.map(action => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => navigate(action.href)}
                aria-label={action.label}
              >
                <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
                {action.label}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
