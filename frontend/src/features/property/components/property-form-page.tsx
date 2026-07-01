import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { propertyService } from '@/shared/services'
import { toastService } from '@/shared/services'
import { invalidateDashboard } from '@/features/dashboard'
import { PropertyForm, PropertyFormData } from './property-form'
import { Loading } from '@/shared/components/ui/loading'
import { ErrorState } from '@/shared/components/ui/error-state'

interface PropertyFormPageProps {
  mode: 'create' | 'edit'
}

export const PropertyFormPage: React.FC<PropertyFormPageProps> = ({ mode }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()

  const {
    data: property,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getProperty(id!),
    enabled: mode === 'edit' && !!id,
  })

  const createMutation = useMutation({
    mutationFn: (data: PropertyFormData) => propertyService.createProperty(data),
    onSuccess: () => {
      void invalidateDashboard(queryClient)
      toastService.success('Property created successfully')
      navigate('/properties')
    },
    onError: (error: Error) => {
      toastService.error(`Failed to create property: ${error.message}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: PropertyFormData) => propertyService.updateProperty(id!, data),
    onSuccess: () => {
      void invalidateDashboard(queryClient)
      toastService.success('Property updated successfully')
      navigate(`/properties/${id}`)
    },
    onError: (error: Error) => {
      toastService.error(`Failed to update property: ${error.message}`)
    },
  })

  const onSubmit = async (data: PropertyFormData) => {
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
        title="Error loading property"
        message={error instanceof Error ? error.message : 'An error occurred'}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {mode === 'create' ? 'Create Property' : 'Edit Property'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {mode === 'create'
            ? 'Add a new property to your organization'
            : 'Update property details'}
        </p>
      </div>

      <PropertyForm
        onSubmit={onSubmit}
        onCancel={() => navigate('/properties')}
        defaultValues={
          property
            ? {
                name: property.name,
                code: property.code,
                description: property.description,
                propertyType: property.propertyType,
                address: property.address,
                city: property.city,
                state: property.state,
                country: property.country,
                postalCode: property.postalCode,
                timezone: property.timezone,
                totalUnits: property.totalUnits,
                yearBuilt: property.yearBuilt,
                notes: property.notes,
              }
            : undefined
        }
        isLoading={createMutation.isPending || updateMutation.isPending}
        submitLabel={mode === 'create' ? 'Create Property' : 'Update Property'}
      />
    </div>
  )
}
