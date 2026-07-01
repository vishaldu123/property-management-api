import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { organizationService } from '@/shared/services'
import { useAuth } from '@/shared/hooks'
import { Modal, ModalFooter } from './modal'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'

interface AssignTechnicianDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading?: boolean
  onConfirm: (technicianId: string) => void
  title?: string
}

export const AssignTechnicianDialog: React.FC<AssignTechnicianDialogProps> = ({
  open,
  onOpenChange,
  isLoading,
  onConfirm,
  title = 'Assign Technician',
}) => {
  const { currentOrganization } = useAuth()
  const [technicianId, setTechnicianId] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const { data: membersData } = useQuery({
    queryKey: ['org-members', currentOrganization?.id],
    queryFn: () => organizationService.listMembers(currentOrganization!.id, { limit: 100 }),
    enabled: open && !!currentOrganization?.id,
  })

  React.useEffect(() => {
    if (open) {
      setTechnicianId('')
      setError(null)
    }
  }, [open])

  const handleConfirm = () => {
    if (!technicianId) {
      setError('Please select a technician')
      return
    }
    onConfirm(technicianId)
  }

  const members = membersData?.data ?? []

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Select a team member to assign"
    >
      <div className="space-y-2">
        <Label htmlFor="technician-select">Technician</Label>
        <select
          id="technician-select"
          value={technicianId}
          onChange={e => {
            setTechnicianId(e.target.value)
            setError(null)
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-invalid={!!error}
        >
          <option value="">Select technician</option>
          {members.map(member => (
            <option key={member.userId} value={member.userId}>
              {member.user?.name ?? member.user?.email ?? member.userId}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? 'Assigning...' : 'Assign'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
