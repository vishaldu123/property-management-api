import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { unitService } from '@/shared/services'
import { toastService } from '@/shared/services'
import { UnitForm, UnitFormData } from './unit-form'
import { Button } from '@/shared/components/ui/button'
import { Loading } from '@/shared/components/ui/loading'
import { ErrorState } from '@/shared/components/ui/error-state'

interface UnitFormPageProps {
  mode: 'create' | 'edit'
}

export const UnitFormPage: React.FC<UnitFormPageProps> = ({ mode }) => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data: unit, isLoading, isError, error } = useQuery({
    queryKey: ['unit', id],
    queryFn: () => unitService.getUnit(id!),
    enabled: mode === 'edit' && !!id,
  })

  const createMutation = useMutation({
    mutationFn: (data: UnitFormData) => unitService.createUnit(data),
    onSuccess: () => {
      toastService.success('Unit created successfully')
      navigate('/units')
    },
    onError: (error: Error) => {
      toastService.error(`Failed to create unit: ${error.message}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UnitFormData) => unitService.updateUnit(id!, data),
    onSuccess: () => {
      toastService.success('Unit updated successfully')
      navigate(`/units/${id}`)
    },
    onError: (error: Error) => {
      toastService.error(`Failed to update unit: ${error.message}`)
    },
  })

  const onSubmit = async (data: UnitFormData) => {
    if (mode === 'create') {
      await createMutation.mutateAsync(data)
    } else {
      await updateMutation.mutateAsync(data)
    }
  }

  if (mode === 'edit' && isLoading) return <Loading />

  if (mode === 'edit' && isError) {
    return (
      <ErrorState
        title="Error loading unit"
        description={error instanceof Error ? error.message : 'An error occurred'}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {mode === 'create' ? 'Create Unit' : 'Edit Unit'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {mode === 'create'
            ? 'Add a new unit to a property'
            : 'Update unit details'}
        </p>
      </div>

      <UnitForm
        onSubmit={onSubmit}
        onCancel={() => navigate('/units')}
        defaultValues={unit ? {
          propertyId: unit.propertyId,
          unitNumber: unit.unitNumber,
          name: unit.name,
          floor: unit.floor,
          block: unit.block,
          unitType: unit.unitType,
          status: unit.status,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          area: unit.area,
          areaUnit: unit.areaUnit,
          rentAmount: unit.rentAmount,
          securityDeposit: unit.securityDeposit,
          availabilityDate: unit.availabilityDate,
          notes: unit.notes,
        } : undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
        submitLabel={mode === 'create' ? 'Create Unit' : 'Update Unit'}
      />
    </div>
  )
}
