import * as React from 'react'
import type { MaintenanceRequest } from '@/shared/services'
import { buildMaintenanceTimeline, formatMaintenanceDate } from '../utils/maintenance.utils'

interface MaintenanceTimelineProps {
  request: MaintenanceRequest
}

const eventIcons: Record<string, string> = {
  created: '●',
  assigned: '👤',
  scheduled: '📅',
  started: '▶',
  paused: '⏸',
  completed: '✓',
  cancelled: '✕',
  notes: '📝',
}

export const MaintenanceTimeline: React.FC<MaintenanceTimelineProps> = ({ request }) => {
  const events = buildMaintenanceTimeline(request)

  return (
    <section aria-label="Maintenance timeline" className="space-y-4">
      <h3 className="font-semibold text-lg">Timeline</h3>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No timeline events yet.</p>
      ) : (
        <ol className="relative border-l border-muted pl-6 space-y-4">
          {events.map(event => (
            <li key={event.id} className="relative">
              <span
                className="absolute -left-[1.65rem] flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs"
                aria-hidden="true"
              >
                {eventIcons[event.type] ?? '•'}
              </span>
              <div>
                <p className="font-medium text-sm">{event.label}</p>
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
                <time className="text-xs text-muted-foreground" dateTime={event.timestamp}>
                  {formatMaintenanceDate(event.timestamp)}
                </time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
