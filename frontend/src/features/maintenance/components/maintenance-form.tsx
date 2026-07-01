import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import {
  propertyService,
  tenantService,
  unitService,
  type MaintenanceRequest,
} from '@/shared/services'
import { Button } from '@/shared/components/ui/button'
import { TextField, NumberField, DateField, SelectField, TextAreaField } from '@/shared/components'
import { MAINTENANCE_CATEGORIES, MAINTENANCE_PRIORITIES, MAINTENANCE_STATUSES } from '../constants'
import { generateRequestNumber, toIsoDateTime } from '../utils/maintenance.utils'

const maintenanceFormSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().optional(),
  tenantId: z.string().optional(),
  requestNumber: z.string().min(1, 'Request number is required'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  category: z.string().min(1),
  priority: z.string().min(1),
  status: z.string().optional(),
  requestedDate: z.string().min(1),
  scheduledDate: z.string().optional(),
  estimatedCost: z.coerce.number().nonnegative().optional(),
  actualCost: z.coerce.number().nonnegative().optional(),
  vendor: z.string().optional(),
  notes: z.string().optional(),
})

export type MaintenanceFormData = z.infer<typeof maintenanceFormSchema>

interface MaintenanceFormProps {
  mode: 'create' | 'edit'
  initialData?: MaintenanceRequest
  isLoading?: boolean
  onSubmit: (data: MaintenanceFormData) => void | Promise<void>
  onCancel: () => void
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  mode,
  initialData,
  isLoading,
  onSubmit,
  onCancel,
}) => {
  const { control, handleSubmit, watch } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceFormSchema) as never,
    defaultValues: {
      propertyId: initialData?.propertyId ?? '',
      unitId: initialData?.unitId ?? '',
      tenantId: initialData?.tenantId ?? '',
      requestNumber: initialData?.requestNumber ?? generateRequestNumber(),
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      category: initialData?.category ?? 'Other',
      priority: initialData?.priority ?? 'Medium',
      status: initialData?.status ?? 'Open',
      requestedDate:
        initialData?.requestedDate?.split('T')[0] ?? new Date().toISOString().split('T')[0],
      scheduledDate: initialData?.scheduledDate?.split('T')[0] ?? '',
      estimatedCost: initialData?.estimatedCost ?? undefined,
      actualCost: initialData?.actualCost ?? undefined,
      vendor: initialData?.vendor ?? '',
      notes: initialData?.notes ?? '',
    },
  })

  const propertyId = watch('propertyId')

  const { data: propertiesData } = useQuery({
    queryKey: ['properties', 'list', 'maintenance-form'],
    queryFn: () => propertyService.listProperties({ limit: 100 }),
  })

  const { data: unitsData } = useQuery({
    queryKey: ['units', 'list', 'maintenance-form', propertyId],
    queryFn: () => unitService.listUnits({ limit: 100, propertyId: propertyId || undefined }),
    enabled: !!propertyId,
  })

  const { data: tenantsData } = useQuery({
    queryKey: ['tenants', 'list', 'maintenance-form'],
    queryFn: () => tenantService.listTenants({ limit: 100 }),
  })

  const propertyOptions = propertiesData?.data.map(p => ({ value: p.id, label: p.name })) ?? []
  const unitOptions = unitsData?.data.map(u => ({ value: u.id, label: u.unitNumber })) ?? []
  const tenantOptions =
    tenantsData?.data.map(t => ({
      value: t.id,
      label: `${t.firstName} ${t.lastName}`,
    })) ?? []

  const handleFormSubmit = (data: MaintenanceFormData) => {
    onSubmit({
      ...data,
      requestedDate: toIsoDateTime(data.requestedDate),
      scheduledDate: data.scheduledDate ? toIsoDateTime(data.scheduledDate) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          name="requestNumber"
          control={control}
          label="Request Number"
          required
          disabled={mode === 'edit'}
        />
        <TextField name="title" control={control} label="Title" required />

        <SelectField
          name="propertyId"
          control={control}
          label="Property"
          required
          options={propertyOptions}
        />
        <SelectField name="unitId" control={control} label="Unit" options={unitOptions} />
        <SelectField name="tenantId" control={control} label="Tenant" options={tenantOptions} />

        <SelectField
          name="category"
          control={control}
          label="Category"
          options={MAINTENANCE_CATEGORIES.map(c => ({ value: c, label: c }))}
        />
        <SelectField
          name="priority"
          control={control}
          label="Priority"
          options={MAINTENANCE_PRIORITIES.map(p => ({ value: p, label: p }))}
        />

        {mode === 'create' && (
          <SelectField
            name="status"
            control={control}
            label="Status"
            options={MAINTENANCE_STATUSES.map(s => ({ value: s, label: s }))}
          />
        )}

        <DateField name="requestedDate" control={control} label="Requested Date" required />
        <DateField name="scheduledDate" control={control} label="Scheduled Date" />

        <NumberField name="estimatedCost" control={control} label="Estimated Cost" />
        {mode === 'edit' && <NumberField name="actualCost" control={control} label="Actual Cost" />}
        <TextField name="vendor" control={control} label="Vendor" />
      </div>

      <TextAreaField name="description" control={control} label="Description" required rows={4} />
      <TextAreaField name="notes" control={control} label="Notes" rows={3} />

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Request' : 'Update Request'}
        </Button>
      </div>
    </form>
  )
}
