import React from 'react'
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'
import { Toast, ToastType } from '@/shared/services'

interface ToastProps extends Toast {
  onDismiss: (_id: string) => void // eslint-disable-line @typescript-eslint/no-unused-vars
}

const getToastStyles = (type: ToastType) => {
  const baseStyles =
    'flex items-start gap-3 p-4 rounded-lg shadow-lg border animate-in fade-in slide-in-from-right-5 duration-300'

  const typeStyles: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100',
    error: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100',
    info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100',
  }

  return cn(baseStyles, typeStyles[type])
}

const getToastIcon = (type: ToastType) => {
  const iconProps = 'w-5 h-5 flex-shrink-0'

  switch (type) {
    case 'success':
      return <CheckCircleIcon className={cn(iconProps, 'text-green-600 dark:text-green-400')} />
    case 'error':
      return <ExclamationCircleIcon className={cn(iconProps, 'text-red-600 dark:text-red-400')} />
    case 'info':
      return <InformationCircleIcon className={cn(iconProps, 'text-blue-600 dark:text-blue-400')} />
    case 'warning':
      return <ExclamationTriangleIcon className={cn(iconProps, 'text-yellow-600 dark:text-yellow-400')} />
  }
}

export const ToastItem: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id)
    }, 3000)

    return () => clearTimeout(timer)
  }, [id, onDismiss])

  return (
    <div className={getToastStyles(type)}>
      {getToastIcon(type)}
      <div className="flex-1">
        <p className="font-medium">{message}</p>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  )
}
