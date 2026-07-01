import * as React from 'react'
import type { MaintenanceRequest } from '@/shared/services'
import { formatMaintenanceCurrency } from '../utils/maintenance.utils'

interface CostTrackingCardProps {
  request: MaintenanceRequest
}

export const CostTrackingCard: React.FC<CostTrackingCardProps> = ({ request }) => {
  const estimated = request.estimatedCost ?? 0
  const actual = request.actualCost ?? 0
  const variance = actual - estimated

  return (
    <section
      aria-label="Cost tracking summary"
      className="rounded-lg border bg-muted/30 p-4 space-y-3"
    >
      <h3 className="font-semibold">Cost Tracking</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Estimated Cost</p>
          <p className="text-xl font-bold">{formatMaintenanceCurrency(estimated)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Actual Cost</p>
          <p className="text-xl font-bold">{formatMaintenanceCurrency(actual)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Variance</p>
          <p
            className={`text-xl font-bold ${variance > 0 ? 'text-destructive' : variance < 0 ? 'text-green-700' : ''}`}
          >
            {formatMaintenanceCurrency(variance)}
          </p>
        </div>
      </div>
    </section>
  )
}
