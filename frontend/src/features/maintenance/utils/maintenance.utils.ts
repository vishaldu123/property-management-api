import type { MaintenanceRequest, MaintenanceStatus } from '@/shared/services'
import { VALID_STATUS_TRANSITIONS } from '../constants'

export function getAllowedTransitions(status: MaintenanceStatus): MaintenanceStatus[] {
  return VALID_STATUS_TRANSITIONS[status] ?? []
}

export function canTransition(from: MaintenanceStatus, to: MaintenanceStatus): boolean {
  return getAllowedTransitions(from).includes(to)
}

export function formatMaintenanceDate(date?: string): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatMaintenanceCurrency(amount?: number): string {
  if (amount === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function getStatusBadgeClass(status: MaintenanceStatus): string {
  switch (status) {
    case 'Open':
      return 'bg-blue-100 text-blue-800'
    case 'Assigned':
      return 'bg-indigo-100 text-indigo-800'
    case 'Scheduled':
      return 'bg-purple-100 text-purple-800'
    case 'In Progress':
      return 'bg-yellow-100 text-yellow-800'
    case 'On Hold':
      return 'bg-orange-100 text-orange-800'
    case 'Completed':
      return 'bg-green-100 text-green-800'
    case 'Cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case 'Emergency':
    case 'Urgent':
      return 'bg-red-100 text-red-800'
    case 'High':
      return 'bg-orange-100 text-orange-800'
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function generateRequestNumber(): string {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
  return `MR-${suffix}`
}

export function toIsoDateTime(dateValue: string): string {
  if (!dateValue) return new Date().toISOString()
  if (dateValue.includes('T')) return dateValue
  return new Date(`${dateValue}T12:00:00.000Z`).toISOString()
}

export interface MaintenanceTimelineEvent {
  id: string
  type: string
  label: string
  timestamp: string
  description?: string
}

export function buildMaintenanceTimeline(request: MaintenanceRequest): MaintenanceTimelineEvent[] {
  const events: MaintenanceTimelineEvent[] = [
    {
      id: 'created',
      type: 'created',
      label: 'Request Created',
      timestamp: request.createdAt,
      description: `${request.requestNumber} was created`,
    },
  ]

  if (request.assignedTo) {
    events.push({
      id: 'assigned',
      type: 'assigned',
      label: 'Technician Assigned',
      timestamp: request.updatedAt,
    })
  }

  if (request.scheduledDate) {
    events.push({
      id: 'scheduled',
      type: 'scheduled',
      label: 'Work Scheduled',
      timestamp: request.scheduledDate,
      description: formatMaintenanceDate(request.scheduledDate),
    })
  }

  if (request.startedDate) {
    events.push({
      id: 'started',
      type: 'started',
      label: 'Work Started',
      timestamp: request.startedDate,
    })
  }

  if (request.status === 'On Hold') {
    events.push({
      id: 'paused',
      type: 'paused',
      label: 'Work Paused',
      timestamp: request.updatedAt,
    })
  }

  if (request.completedDate) {
    events.push({
      id: 'completed',
      type: 'completed',
      label: 'Work Completed',
      timestamp: request.completedDate,
    })
  }

  if (request.status === 'Cancelled') {
    events.push({
      id: 'cancelled',
      type: 'cancelled',
      label: 'Request Cancelled',
      timestamp: request.updatedAt,
    })
  }

  if (request.notes) {
    events.push({
      id: 'notes',
      type: 'notes',
      label: 'Notes Added',
      timestamp: request.updatedAt,
      description: request.notes,
    })
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function filterByVendor(
  requests: MaintenanceRequest[],
  vendorSearch: string
): MaintenanceRequest[] {
  if (!vendorSearch.trim()) return requests
  const query = vendorSearch.toLowerCase()
  return requests.filter(r => r.vendor?.toLowerCase().includes(query) ?? false)
}

export function filterByTenant(
  requests: MaintenanceRequest[],
  tenantId: string
): MaintenanceRequest[] {
  if (!tenantId) return requests
  return requests.filter(r => r.tenantId === tenantId)
}

export function filterOpenRequests(requests: MaintenanceRequest[]): MaintenanceRequest[] {
  return requests.filter(r => !['Completed', 'Cancelled'].includes(r.status))
}

export function exportMaintenancePlaceholder(requests: MaintenanceRequest[]): string {
  const headers = [
    'Request Number',
    'Title',
    'Status',
    'Priority',
    'Category',
    'Property',
    'Estimated Cost',
    'Actual Cost',
  ]
  const rows = requests.map(r => [
    r.requestNumber,
    r.title,
    r.status,
    r.priority,
    r.category,
    r.propertyId,
    r.estimatedCost ?? '',
    r.actualCost ?? '',
  ])
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

export interface WorkflowAction {
  key: string
  label: string
  targetStatus: MaintenanceStatus
  permission: string
}

export function getWorkflowActions(status: MaintenanceStatus): WorkflowAction[] {
  const transitions = getAllowedTransitions(status)
  const actions: WorkflowAction[] = []

  const mapping: Partial<
    Record<MaintenanceStatus, { key: string; label: string; permission: string }>
  > = {
    Assigned: { key: 'assign', label: 'Assign', permission: 'maintenance:assign' },
    Scheduled: { key: 'schedule', label: 'Schedule', permission: 'maintenance:update' },
    'In Progress': { key: 'start', label: 'Start Work', permission: 'maintenance:update' },
    'On Hold': { key: 'pause', label: 'Pause', permission: 'maintenance:update' },
    Completed: { key: 'complete', label: 'Complete', permission: 'maintenance:update' },
    Cancelled: { key: 'cancel', label: 'Cancel', permission: 'maintenance:update' },
    Open: { key: 'reopen', label: 'Reopen', permission: 'maintenance:update' },
  }

  for (const target of transitions) {
    const meta = mapping[target]
    if (meta) {
      actions.push({ ...meta, targetStatus: target })
    }
  }

  if (status === 'On Hold' && transitions.includes('In Progress')) {
    actions.push({
      key: 'resume',
      label: 'Resume',
      targetStatus: 'In Progress',
      permission: 'maintenance:update',
    })
  }

  return actions
}
