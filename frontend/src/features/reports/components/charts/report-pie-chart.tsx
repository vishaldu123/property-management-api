import React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { ChartPoint } from '../../types'
import { CHART_COLORS } from '../../constants'

interface ReportPieChartProps {
  data: ChartPoint[]
  ariaLabel: string
}

export const ReportPieChart: React.FC<ReportPieChartProps> = ({ data, ariaLabel }) => (
  <div role="img" aria-label={ariaLabel}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={entry.fill ?? CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
)
