import * as React from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message?: string
  action?: React.ReactNode
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      className,
      title = 'Something went wrong',
      message = 'Please try again later or contact support.',
      action,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn('flex flex-col items-center justify-center py-12 text-center', className)}
      {...props}
    >
      <ExclamationCircleIcon className="w-12 h-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
)
ErrorState.displayName = 'ErrorState'

export { ErrorState }
