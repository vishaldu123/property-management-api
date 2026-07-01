import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { TimeSeriesPoint } from '../../types'

interface ReportLineChartProps {
  data: TimeSeriesPoint[]
  ariaLabel: string
  valueLabel?: string
}

export const ReportLineChart: React.FC<ReportLineChartProps> = ({
  data,
  ariaLabel,
  valueLabel = 'Value',
}) => (
  <div role="img" aria-label={ariaLabel}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data.map(d => ({ name: d.label, value: d.value }))}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          name={valueLabel}
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
)
