import * as React from 'react'
import { FormField } from './form-field'
import { cn } from '@/utils/cn'

interface DateFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string
  control?: any
  label?: string
  error?: string
  required?: boolean
  rules?: any
  defaultValue?: any
  shouldUnregister?: any
}

const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
  (
    { name, label, error, required, control, defaultValue, rules, className, ...inputProps },
    ref
  ) => (
    <FormField
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={rules}
      label={label}
      error={error}
      required={required}
    >
      {({ field }) => (
        <input
          ref={ref}
          type="date"
          {...field}
          {...inputProps}
          className={cn(
            'mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className
          )}
        />
      )}
    </FormField>
  )
)
DateField.displayName = 'DateField'

export { DateField }
