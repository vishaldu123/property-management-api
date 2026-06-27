import * as React from 'react'
import { Controller } from 'react-hook-form'
import { Label } from '../ui/label'
import { cn } from '@/utils/cn'

interface FormFieldProps {
  className?: string
  name: string
  control?: any
  label?: string
  error?: string
  required?: boolean
  defaultValue?: any
  rules?: any
  shouldUnregister?: any
  children?: (_params: { field: any; fieldState: any }) => React.ReactNode // eslint-disable-line @typescript-eslint/no-unused-vars
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    { name, label, error, required, control, defaultValue, rules, shouldUnregister, children },
    ref
  ) => {
    return (
      <div ref={ref}>
        {label && (
          <Label
            className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}
          >
            {label}
          </Label>
        )}
        <Controller
          name={name as any}
          control={control}
          defaultValue={defaultValue}
          rules={rules}
          shouldUnregister={shouldUnregister}
          render={({ field, fieldState }) => {
            return (
              <div>
                {children ? children({ field, fieldState }) : null}
                {(error || fieldState.error) && (
                  <p className="mt-1 text-sm text-destructive">
                    {error || fieldState.error?.message}
                  </p>
                )}
              </div>
            )
          }}
        />
      </div>
    )
  }
)
FormField.displayName = 'FormField'

export { FormField }
