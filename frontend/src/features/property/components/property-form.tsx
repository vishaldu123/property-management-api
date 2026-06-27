import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextField, NumberField, TextAreaField, SelectField } from '@/shared/components/form'
import { Button } from '@/shared/components/ui/button'

const propertyFormSchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  code: z.string().min(1, 'Property code is required'),
  description: z.string().optional(),
  propertyType: z.string().min(1, 'Property type is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  timezone: z.string().optional(),
  totalUnits: z.number().optional(),
  yearBuilt: z.number().optional(),
  notes: z.string().optional(),
})

export type PropertyFormData = z.infer<typeof propertyFormSchema>

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData) => Promise<void>
  onCancel?: () => void
  defaultValues?: Partial<PropertyFormData>
  isLoading?: boolean
  submitLabel?: string
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  submitLabel = 'Save Property',
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          name="name"
          label="Property Name"
          control={control}
          required
          error={errors.name?.message}
          placeholder="Enter property name"
        />
        <TextField
          name="code"
          label="Property Code"
          control={control}
          required
          error={errors.code?.message}
          placeholder="Enter property code"
        />
      </div>

      <TextAreaField
        name="description"
        label="Description"
        control={control}
        error={errors.description?.message}
        placeholder="Enter property description"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          name="propertyType"
          label="Property Type"
          control={control}
          required
          error={errors.propertyType?.message}
          options={[
            { label: 'Apartment', value: 'Apartment' },
            { label: 'Villa', value: 'Villa' },
            { label: 'Commercial', value: 'Commercial' },
            { label: 'Office', value: 'Office' },
            { label: 'Retail', value: 'Retail' },
          ]}
        />
        <TextField
          name="address"
          label="Address"
          control={control}
          required
          error={errors.address?.message}
          placeholder="Enter street address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TextField
          name="city"
          label="City"
          control={control}
          required
          error={errors.city?.message}
          placeholder="Enter city"
        />
        <TextField
          name="state"
          label="State"
          control={control}
          required
          error={errors.state?.message}
          placeholder="Enter state"
        />
        <TextField
          name="country"
          label="Country"
          control={control}
          required
          error={errors.country?.message}
          placeholder="Enter country"
        />
        <TextField
          name="postalCode"
          label="Postal Code"
          control={control}
          required
          error={errors.postalCode?.message}
          placeholder="Enter postal code"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          name="timezone"
          label="Timezone"
          control={control}
          error={errors.timezone?.message}
          options={[
            { label: 'UTC', value: 'UTC' },
            { label: 'EST', value: 'EST' },
            { label: 'CST', value: 'CST' },
            { label: 'MST', value: 'MST' },
            { label: 'PST', value: 'PST' },
          ]}
        />
        <NumberField
          name="totalUnits"
          label="Total Units"
          control={control}
          error={errors.totalUnits?.message}
          placeholder="Enter total units"
        />
        <NumberField
          name="yearBuilt"
          label="Year Built"
          control={control}
          error={errors.yearBuilt?.message}
          placeholder="Enter year built"
        />
      </div>

      <TextAreaField
        name="notes"
        label="Notes"
        control={control}
        error={errors.notes?.message}
        placeholder="Enter additional notes"
      />

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
