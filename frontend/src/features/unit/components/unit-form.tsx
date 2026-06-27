import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { TextField, NumberField, TextAreaField, SelectField } from '@/shared/components/form'
import { Button } from '@/shared/components/ui/button'
import { propertyService } from '@/shared/services'
import { Loading } from '@/shared/components/ui/loading'

const unitFormSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  unitNumber: z.string().min(1, 'Unit number is required'),
  name: z.string().optional(),
  floor: z.number().optional(),
  block: z.string().optional(),
  unitType: z.string().optional(),
  status: z.string().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  area: z.number().optional(),
  areaUnit: z.string().optional(),
  rentAmount: z.number().optional(),
  securityDeposit: z.number().optional(),
  availabilityDate: z.string().optional(),
  notes: z.string().optional(),
})

export type UnitFormData = z.infer<typeof unitFormSchema>

interface UnitFormProps {
  onSubmit: (data: UnitFormData) => Promise<void>
  onCancel?: () => void
  defaultValues?: Partial<UnitFormData>
  isLoading?: boolean
  submitLabel?: string
}

export const UnitForm: React.FC<UnitFormProps> = ({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  submitLabel = 'Save Unit',
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      ...defaultValues,
    },
  })

  const { data: propertiesResponse, isLoading: loadingProperties } = useQuery({
    queryKey: ['properties', 'list'],
    queryFn: () => propertyService.listProperties({ limit: 100 }),
  })

  if (loadingProperties) return <Loading />

  const propertyOptions = (propertiesResponse?.data || []).map(p => ({
    label: `${p.name} (${p.code})`,
    value: p.id,
  }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          name="propertyId"
          label="Property"
          control={control}
          required
          error={errors.propertyId?.message}
          options={propertyOptions}
        />
        <TextField
          name="unitNumber"
          label="Unit Number"
          control={control}
          required
          error={errors.unitNumber?.message}
          placeholder="e.g., 101, A-102"
        />
      </div>

      <TextField
        name="name"
        label="Unit Name"
        control={control}
        error={errors.name?.message}
        placeholder="Enter unit name (optional)"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <NumberField
          name="floor"
          label="Floor"
          control={control}
          error={errors.floor?.message}
          placeholder="Enter floor number"
        />
        <TextField
          name="block"
          label="Block"
          control={control}
          error={errors.block?.message}
          placeholder="Enter block"
        />
        <SelectField
          name="unitType"
          label="Unit Type"
          control={control}
          error={errors.unitType?.message}
          options={[
            { label: 'Studio', value: 'Studio' },
            { label: 'Apartment', value: 'Apartment' },
            { label: 'Villa', value: 'Villa' },
            { label: 'Office', value: 'Office' },
            { label: 'Shop', value: 'Shop' },
            { label: 'Warehouse', value: 'Warehouse' },
            { label: 'Parking', value: 'Parking' },
            { label: 'Storage', value: 'Storage' },
          ]}
        />
        <SelectField
          name="status"
          label="Status"
          control={control}
          error={errors.status?.message}
          options={[
            { label: 'Available', value: 'Available' },
            { label: 'Occupied', value: 'Occupied' },
            { label: 'Reserved', value: 'Reserved' },
            { label: 'Under Maintenance', value: 'Under Maintenance' },
            { label: 'Inactive', value: 'Inactive' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumberField
          name="bedrooms"
          label="Bedrooms"
          control={control}
          error={errors.bedrooms?.message}
        />
        <NumberField
          name="bathrooms"
          label="Bathrooms"
          control={control}
          error={errors.bathrooms?.message}
        />
        <NumberField name="area" label="Area" control={control} error={errors.area?.message} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          name="areaUnit"
          label="Area Unit"
          control={control}
          error={errors.areaUnit?.message}
          options={[
            { label: 'sqft', value: 'sqft' },
            { label: 'sqm', value: 'sqm' },
          ]}
        />
        <NumberField
          name="rentAmount"
          label="Monthly Rent"
          control={control}
          error={errors.rentAmount?.message}
        />
        <NumberField
          name="securityDeposit"
          label="Security Deposit"
          control={control}
          error={errors.securityDeposit?.message}
        />
      </div>

      <TextField
        name="availabilityDate"
        label="Availability Date"
        control={control}
        error={errors.availabilityDate?.message}
        type="date"
      />

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
