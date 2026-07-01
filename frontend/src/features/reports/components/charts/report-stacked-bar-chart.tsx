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
} from 'recharts'

interface StackedSeries {
  key: string
  label: string
  fill: string
}

interface StackedBarPoint {
  name: string
  [key: string]: string | number
}

interface ReportStackedBarChartProps {
  data: StackedBarPoint[]
  series: StackedSeries[]
  ariaLabel: string
}

export const ReportStackedBarChart: React.FC<ReportStackedBarChartProps> = ({
  data,
  series,
  ariaLabel,
}) => (
  <div role="img" aria-label={ariaLabel}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip />
        <Legend />
        {series.map(s => (
          <Bar key={s.key} dataKey={s.key} name={s.label} stackId="stack" fill={s.fill} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </div>
)
