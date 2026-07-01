import React from 'react'
import { useNavigate } from 'react-router-dom'
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

const STATUS_SLUG: Record<string, string> = {
  Open: 'Open',
  Assigned: 'Assigned',
  Scheduled: 'Scheduled',
  'In Progress': 'In Progress',
  'On Hold': 'On Hold',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
}

export const MaintenanceStatusBarChart: React.FC<MaintenanceStatusBarChartProps> = ({
  data,
  isLoading,
}) => {
  const navigate = useNavigate()
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const summary = data.map(item => `${item.name}: ${item.value}`).join(', ')

  const handleBarClick = (entry: ChartDataPoint) => {
    const status = STATUS_SLUG[entry.name]
    if (status) navigate(`/maintenance?status=${encodeURIComponent(status)}`)
    else navigate('/maintenance')
  }

  return (
    <ChartContainer
      title="Maintenance Status"
      description="Requests by workflow status — click a bar to filter"
      isLoading={isLoading}
      isEmpty={!isLoading && total === 0}
      ariaLabel={`Maintenance status bar chart. ${summary}`}
      summary={summary}
    >
      <div
        role="button"
        tabIndex={0}
        className="h-full cursor-pointer"
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') navigate('/maintenance?open=true')
        }}
        aria-label="View maintenance list"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              onClick={(_data, index) => {
                if (typeof index === 'number' && data[index]) handleBarClick(data[index])
              }}
            >
              {data.map(entry => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  )
}
