import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts'
import type { ChartPoint } from '../../types'
import { CHART_COLORS } from '../../constants'

interface ReportBarChartProps {
  data: ChartPoint[]
  ariaLabel: string
  valueLabel?: string
}

export const ReportBarChart: React.FC<ReportBarChartProps> = ({
  data,
  ariaLabel,
  valueLabel = 'Value',
}) => (
  <div role="img" aria-label={ariaLabel}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" name={valueLabel} radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={entry.fill ?? CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
)
