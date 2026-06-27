import React from 'react'
import { useToast } from '@/shared/hooks'
import { toastService } from '@/shared/services'
import { ToastItem } from '@/shared/components/ui'

export const ToastContainer: React.FC = () => {
  const toasts = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} {...toast} onDismiss={toastService.dismiss} />
      ))}
    </div>
  )
}
