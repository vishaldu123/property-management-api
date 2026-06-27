import * as React from 'react'
import { FormField } from './form-field'
import { cn } from '@/utils/cn'

interface TextAreaFieldProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'name'
> {
  name: string
  control?: any
  label?: string
  error?: string
  required?: boolean
  rules?: any
  defaultValue?: any
  shouldUnregister?: any
}

const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  (
    { name, label, error, required, control, defaultValue, rules, className, ...textareaProps },
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
        <textarea
          ref={ref}
          {...field}
          {...textareaProps}
          className={cn(
            'mt-2 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className
          )}
        />
      )}
    </FormField>
  )
)
TextAreaField.displayName = 'TextAreaField'

export { TextAreaField }
