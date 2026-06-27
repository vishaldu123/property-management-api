import * as React from 'react'
import { FormField } from './form-field'
import { cn } from '@/utils/cn'

interface SelectOption {
  label: string
  value: string
}

interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  name: string
  control?: any
  label?: string
  error?: string
  required?: boolean
  rules?: any
  defaultValue?: any
  shouldUnregister?: any
  options?: SelectOption[]
}

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      name,
      label,
      error,
      required,
      control,
      defaultValue,
      rules,
      className,
      options = [],
      ...selectProps
    },
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
        <select
          ref={ref}
          {...field}
          {...selectProps}
          className={cn(
            'mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className
          )}
        >
          <option value="">Select an option</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  )
)
SelectField.displayName = 'SelectField'

export { SelectField, type SelectOption }
