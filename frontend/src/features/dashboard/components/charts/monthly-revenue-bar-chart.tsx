import React from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthlyRevenuePoint } from '../../types'
import { ChartContainer } from './chart-container'

interface MonthlyRevenueBarChartProps {
  data: MonthlyRevenuePoint[]
  isLoading?: boolean
}

export const MonthlyRevenueBarChart: React.FC<MonthlyRevenueBarChartProps> = ({
  data,
  isLoading,
}) => {
  const total = data.reduce((sum, item) => sum + item.revenue, 0)
  const summary = data.map(item => `${item.month}: $${item.revenue}`).join(', ')

  return (
    <ChartContainer
      title="Monthly Revenue"
      description="Paid revenue over the last 6 months"
      isLoading={isLoading}
      isEmpty={!isLoading && total === 0}
      ariaLabel={`Monthly revenue bar chart. ${summary}`}
      summary={summary}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
          <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
