import React from 'react'
import { Outlet } from 'react-router-dom'
import { DashboardLayout } from '@/shared/components'

export const AppLayout: React.FC = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
