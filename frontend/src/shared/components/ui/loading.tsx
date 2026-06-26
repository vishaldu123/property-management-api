import * as React from 'react'
import { cn } from '@/utils/cn'

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeClass = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
    }[size]

    return (
      <div ref={ref} className={cn('flex items-center justify-center', className)} {...props}>
        <div className={cn('animate-spin', sizeClass)}>
          <div className="h-full w-full border-4 border-transparent border-t-primary rounded-full" />
        </div>
      </div>
    )
  }
)
Loading.displayName = 'Loading'

export { Loading }
