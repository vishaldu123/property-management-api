import { useState, useEffect } from 'react'
import { toastManager, Toast } from '@/shared/services'

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>(toastManager.getAll())

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts)
    return () => unsubscribe()
  }, [])

  return toasts
}
