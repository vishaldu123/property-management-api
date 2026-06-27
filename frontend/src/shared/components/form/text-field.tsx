import * as React from 'react'
import { Input } from '../ui/input'
import { FormField } from './form-field'
import { cn } from '@/utils/cn'

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string
  control?: any
  label?: string
  error?: string
  required?: boolean
  rules?: any
  defaultValue?: any
  shouldUnregister?: any
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
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
        <Input ref={ref} {...field} {...inputProps} className={cn('mt-2', className)} />
      )}
    </FormField>
  )
)
TextField.displayName = 'TextField'

export { TextField }
