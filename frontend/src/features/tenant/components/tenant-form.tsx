import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { TextField, TextAreaField, SelectField, DateField } from '@/shared/components/form'
import { Button } from '@/shared/components/ui/button'
import { unitService } from '@/shared/services'
import { Loading } from '@/shared/components/ui/loading'

const tenantFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  governmentIdType: z.string().optional(),
  governmentIdNumber: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  unitId: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
})

export type TenantFormData = z.infer<typeof tenantFormSchema>

interface TenantFormProps {
  onSubmit: (data: TenantFormData) => Promise<void>
  onCancel?: () => void
  defaultValues?: Partial<TenantFormData>
  isLoading?: boolean
  submitLabel?: string
}

export const TenantForm: React.FC<TenantFormProps> = ({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  submitLabel = 'Save Tenant',
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      ...defaultValues,
    },
  })

  const { data: unitsResponse, isLoading: loadingUnits } = useQuery({
    queryKey: ['units', 'list'],
    queryFn: () => unitService.listUnits({ limit: 100 }),
  })

  if (loadingUnits) return <Loading />

  const unitOptions = (unitsResponse?.data || []).map(u => ({
    label: `${u.unitNumber} (Floor ${u.floor || 'N/A'})`,
    value: u.id,
  }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          name="firstName"
          label="First Name"
          control={control}
          required
          error={errors.firstName?.message}
          placeholder="Enter first name"
        />
        <TextField
          name="lastName"
          label="Last Name"
          control={control}
          required
          error={errors.lastName?.message}
          placeholder="Enter last name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          name="email"
          label="Email"
          control={control}
          required
          error={errors.email?.message}
          placeholder="Enter email address"
          type="email"
        />
        <TextField
          name="phone"
          label="Phone"
          control={control}
          error={errors.phone?.message}
          placeholder="Enter phone number"
          type="tel"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateField
          name="dateOfBirth"
          label="Date of Birth"
          control={control}
          error={errors.dateOfBirth?.message}
        />
        <SelectField
          name="status"
          label="Status"
          control={control}
          error={errors.status?.message}
          options={[
            { label: 'Prospect', value: 'Prospect' },
            { label: 'Active', value: 'Active' },
            { label: 'Notice', value: 'Notice' },
            { label: 'Former', value: 'Former' },
            { label: 'Blacklisted', value: 'Blacklisted' },
          ]}
        />
      </div>

      <SelectField
        name="unitId"
        label="Assign Unit (Optional)"
        control={control}
        error={errors.unitId?.message}
        options={[{ label: 'No unit assigned', value: '' }, ...unitOptions]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          name="governmentIdType"
          label="Government ID Type"
          control={control}
          error={errors.governmentIdType?.message}
          options={[
            { label: 'Passport', value: 'Passport' },
            { label: 'Driver License', value: 'Driver License' },
            { label: 'National ID', value: 'National ID' },
            { label: 'Other', value: 'Other' },
          ]}
        />
        <TextField
          name="governmentIdNumber"
          label="Government ID Number"
          control={control}
          error={errors.governmentIdNumber?.message}
          placeholder="Enter ID number"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          name="occupation"
          label="Occupation"
          control={control}
          error={errors.occupation?.message}
          placeholder="Enter occupation"
        />
        <TextField
          name="employer"
          label="Employer"
          control={control}
          error={errors.employer?.message}
          placeholder="Enter employer name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          name="emergencyContactName"
          label="Emergency Contact Name"
          control={control}
          error={errors.emergencyContactName?.message}
          placeholder="Enter contact name"
        />
        <TextField
          name="emergencyContactPhone"
          label="Emergency Contact Phone"
          control={control}
          error={errors.emergencyContactPhone?.message}
          placeholder="Enter contact phone"
          type="tel"
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
