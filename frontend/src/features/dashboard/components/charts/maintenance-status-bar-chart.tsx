import React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartDataPoint } from '../../types'
import { ChartContainer } from './chart-container'

interface MaintenanceStatusBarChartProps {
  data: ChartDataPoint[]
  isLoading?: boolean
}

export const MaintenanceStatusBarChart: React.FC<MaintenanceStatusBarChartProps> = ({
  data,
  isLoading,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const summary = data.map(item => `${item.name}: ${item.value}`).join(', ')

  return (
    <ChartContainer
      title="Maintenance Status"
      description="Requests by workflow status"
      isLoading={isLoading}
      isEmpty={!isLoading && total === 0}
      ariaLabel={`Maintenance status bar chart. ${summary}`}
      summary={summary}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map(entry => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
