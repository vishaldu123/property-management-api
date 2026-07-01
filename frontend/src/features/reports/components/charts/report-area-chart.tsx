import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { TimeSeriesPoint } from '../../types'

interface ReportAreaChartProps {
  data: TimeSeriesPoint[]
  ariaLabel: string
  valueLabel?: string
}

export const ReportAreaChart: React.FC<ReportAreaChartProps> = ({
  data,
  ariaLabel,
  valueLabel = 'Value',
}) => (
  <div role="img" aria-label={ariaLabel}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data.map(d => ({ name: d.label, value: d.value }))}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="value"
          name={valueLabel}
          stroke="hsl(var(--chart-2))"
          fill="hsl(var(--chart-2))"
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
)
