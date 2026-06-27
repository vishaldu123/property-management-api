import React, { useState } from 'react'
import { useOrganizations } from '@/shared/hooks'
import { organizationService } from '@/shared/services'
import { Button } from '@/shared/components/ui'
import { ChevronDownIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'

interface OrganizationSwitcherProps {
  currentOrganizationId?: string // eslint-disable-line @typescript-eslint/no-unused-vars
  onOrganizationChange?: (_organizationId: string) => void // eslint-disable-line @typescript-eslint/no-unused-vars
}

/**
 * Organization Switcher component
 * Displays available organizations and allows switching between them
 */
export const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  currentOrganizationId,
  onOrganizationChange,
}) => {
  const { data: organizationsData, isLoading } = useOrganizations(1, 50)
  const [isOpen, setIsOpen] = useState(false)

  const organizations = organizationsData?.data ?? []
  const currentOrg = organizations.find(org => org.id === currentOrganizationId)

  const handleSelectOrganization = (organizationId: string) => {
    organizationService.setCurrentOrganization(organizationId)
    onOrganizationChange?.(organizationId)
    setIsOpen(false)
  }

  if (organizations.length <= 1) {
    // If user only has one organization, just show it as text
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <BuildingOffice2Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{currentOrg?.name || 'Organization'}</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
      >
        <div className="flex items-center gap-2 truncate">
          <BuildingOffice2Icon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{currentOrg?.name || 'Select organization'}</span>
        </div>
        <ChevronDownIcon
          className={cn('w-4 h-4 flex-shrink-0 transition-transform', isOpen && 'rotate-180')}
        />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-lg py-1 z-40">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-muted-foreground">Loading organizations...</div>
          ) : organizations.length === 0 ? (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              No organizations available
            </div>
          ) : (
            organizations.map(org => (
              <button
                key={org.id}
                onClick={() => handleSelectOrganization(org.id)}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors',
                  currentOrganizationId === org.id && 'bg-muted font-medium'
                )}
              >
                {org.name}
                {currentOrganizationId === org.id && <span className="ml-2 text-primary">✓</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
