import type { MaintenanceStatus, MaintenancePriority, MaintenanceCategory } from '@/shared/services'

export const MAINTENANCE_STATUSES: MaintenanceStatus[] = [
  'Open',
  'Assigned',
  'Scheduled',
  'In Progress',
  'On Hold',
  'Completed',
  'Cancelled',
]

export const MAINTENANCE_PRIORITIES: MaintenancePriority[] = [
  'Low',
  'Medium',
  'High',
  'Urgent',
  'Emergency',
]

export const MAINTENANCE_CATEGORIES: MaintenanceCategory[] = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Structural',
  'Cleaning',
  'Pest Control',
  'Other',
]

export const OPEN_MAINTENANCE_STATUSES: MaintenanceStatus[] = [
  'Open',
  'Assigned',
  'Scheduled',
  'In Progress',
  'On Hold',
]

export const VALID_STATUS_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  Open: ['Assigned', 'Cancelled'],
  Assigned: ['Scheduled', 'Open', 'Cancelled'],
  Scheduled: ['In Progress', 'On Hold', 'Cancelled'],
  'In Progress': ['Completed', 'On Hold', 'Scheduled'],
  'On Hold': ['In Progress', 'Scheduled', 'Cancelled'],
  Completed: [],
  Cancelled: ['Open'],
}

export const MAINTENANCE_QUERY_KEYS = {
  all: ['maintenance'] as const,
  lists: () => [...MAINTENANCE_QUERY_KEYS.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...MAINTENANCE_QUERY_KEYS.lists(), params] as const,
  details: () => [...MAINTENANCE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...MAINTENANCE_QUERY_KEYS.details(), id] as const,
  stats: () => [...MAINTENANCE_QUERY_KEYS.all, 'stats'] as const,
}
