import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, EmptyState } from '@/shared/components'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <EmptyState
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
        action={<Button onClick={() => navigate('/')}>Go to Home</Button>}
      />
    </div>
  )
}
