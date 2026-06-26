import * as React from 'react'
import { FieldPath, FieldValues, UseControllerProps } from 'react-hook-form'
import { Input } from '../ui/input'
import { FormField } from './form-field'
import { cn } from '@/utils/cn'

interface TextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'>,
    UseControllerProps<TFieldValues, TName> {
  label?: string
  error?: string
  required?: boolean
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
        <Input
          ref={ref}
          {...field}
          {...inputProps}
          className={cn('mt-2', className)}
        />
      )}
    </FormField>
  )
)
TextField.displayName = 'TextField'

export { TextField }
