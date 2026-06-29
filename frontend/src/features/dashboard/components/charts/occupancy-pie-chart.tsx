import React from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { ChartDataPoint } from '../../types'
import { ChartContainer } from './chart-container'

interface OccupancyPieChartProps {
  data: ChartDataPoint[]
  isLoading?: boolean
}

export const OccupancyPieChart: React.FC<OccupancyPieChartProps> = ({ data, isLoading }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const summary = data.map(item => `${item.name}: ${item.value}`).join(', ')

  return (
    <ChartContainer
      title="Occupancy"
      description="Occupied vs vacant units"
      isLoading={isLoading}
      isEmpty={!isLoading && total === 0}
      ariaLabel={`Occupancy pie chart. ${summary}`}
      summary={summary}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
          >
            {data.map(entry => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
