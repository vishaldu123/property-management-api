import * as React from 'react'
import { Controller, FieldPath, FieldValues, UseControllerProps } from 'react-hook-form'
import { Label } from './label'
import { cn } from '@/utils/cn'

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends UseControllerProps<TFieldValues, TName> {
  label?: string
  error?: string
  required?: boolean
  children?: (props: { field: any; fieldState: any }) => React.ReactNode
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    { name, label, error, required, control, defaultValue, rules, shouldUnregister, children, ...props },
    ref
  ) => {
    return (
      <div ref={ref} {...props}>
        {label && (
          <Label className={cn(required && 'after:content-[\'*\'] after:ml-0.5 after:text-destructive')}>
            {label}
          </Label>
        )}
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue}
          rules={rules}
          shouldUnregister={shouldUnregister}
          render={({ field, fieldState }) => {
            return (
              <div>
                {children ? children({ field, fieldState }) : null}
                {(error || fieldState.error) && (
                  <p className="mt-1 text-sm text-destructive">{error || fieldState.error?.message}</p>
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
