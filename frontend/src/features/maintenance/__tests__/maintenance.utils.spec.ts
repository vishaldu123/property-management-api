import { describe, it, expect } from 'vitest'
import {
  canTransition,
  getAllowedTransitions,
  generateRequestNumber,
  buildMaintenanceTimeline,
  filterByVendor,
  filterOpenRequests,
  getStatusBadgeClass,
} from '../utils/maintenance.utils'
import type { MaintenanceRequest } from '@/shared/services'

const mockRequest: MaintenanceRequest = {
  id: '1',
  organizationId: 'org-1',
  requestNumber: 'MR-001',
  title: 'Leaky faucet',
  description: 'Kitchen sink leaking',
  category: 'Plumbing',
  priority: 'High',
  status: 'In Progress',
  propertyId: 'prop-1',
  unitId: 'unit-1',
  tenantId: 'tenant-1',
  reportedBy: 'user-1',
  assignedTo: 'tech-1',
  requestedDate: '2025-01-01T00:00:00.000Z',
  scheduledDate: '2025-01-05T00:00:00.000Z',
  startedDate: '2025-01-06T00:00:00.000Z',
  estimatedCost: 150,
  vendor: 'ABC Plumbing',
  notes: 'Urgent fix needed',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-06T00:00:00.000Z',
}

describe('maintenance.utils', () => {
  it('returns allowed transitions for Open status', () => {
    expect(getAllowedTransitions('Open')).toEqual(['Assigned', 'Cancelled'])
  })

  it('validates status transitions', () => {
    expect(canTransition('Open', 'Assigned')).toBe(true)
    expect(canTransition('Open', 'Completed')).toBe(false)
    expect(canTransition('Cancelled', 'Open')).toBe(true)
  })

  it('generates unique request numbers', () => {
    const a = generateRequestNumber()
    const b = generateRequestNumber()
    expect(a).toMatch(/^MR-/)
    expect(a).not.toBe(b)
  })

  it('builds maintenance timeline', () => {
    const events = buildMaintenanceTimeline(mockRequest)
    expect(events.some(e => e.type === 'created')).toBe(true)
    expect(events.some(e => e.type === 'assigned')).toBe(true)
    expect(events.some(e => e.type === 'started')).toBe(true)
  })

  it('filters by vendor', () => {
    const requests = [
      { ...mockRequest, vendor: 'ABC Plumbing' },
      { ...mockRequest, id: '2', vendor: 'XYZ Electric' },
    ]
    expect(filterByVendor(requests, 'abc')).toHaveLength(1)
  })

  it('filters open requests', () => {
    const requests = [mockRequest, { ...mockRequest, id: '2', status: 'Completed' as const }]
    expect(filterOpenRequests(requests)).toHaveLength(1)
  })

  it('returns status badge classes', () => {
    expect(getStatusBadgeClass('Open')).toContain('blue')
    expect(getStatusBadgeClass('Completed')).toContain('green')
  })
})
