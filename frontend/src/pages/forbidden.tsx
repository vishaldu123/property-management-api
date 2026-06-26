import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, EmptyState } from '@/shared/components'

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <EmptyState
        title="Access Denied"
        description="You don't have permission to access this resource."
        action={
          <Button onClick={() => navigate('/')}>
            Go to Home
          </Button>
        }
      />
    </div>
  )
}
