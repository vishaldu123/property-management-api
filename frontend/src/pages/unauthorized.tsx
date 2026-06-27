import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, EmptyState } from '@/shared/components'

/**
 * UnauthorizedPage - displayed when user is not authenticated
 */
export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <EmptyState
        title="Unauthorized"
        description="You need to be logged in to access this resource."
        action={
          <div className="flex gap-2">
            <Button onClick={() => navigate('/login')}>Sign In</Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </div>
        }
      />
    </div>
  )
}
