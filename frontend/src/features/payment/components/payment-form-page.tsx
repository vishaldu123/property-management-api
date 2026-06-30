import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { paymentService } from '@/shared/services'
import { toastService } from '@/shared/services'
import { PaymentForm, type PaymentFormData } from './payment-form'
import { Loading } from '@/shared/components/ui/loading'
import { ErrorState } from '@/shared/components/ui/error-state'
import { usePaymentDetail, useInvalidatePayments } from '../hooks/use-payments'

interface PaymentFormPageProps {
  mode: 'create' | 'edit'
}

export const PaymentFormPage: React.FC<PaymentFormPageProps> = ({ mode }) => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { invalidateList, invalidateDetail } = useInvalidatePayments()

  const {
    data: payment,
    isLoading,
    isError,
    error,
  } = usePaymentDetail(mode === 'edit' ? id : undefined)

  const createMutation = useMutation({
    mutationFn: (data: PaymentFormData) =>
      paymentService.createPayment({
        leaseId: data.leaseId,
        paymentNumber: data.paymentNumber,
        amount: data.amount,
        currency: data.currency,
        paymentDate: data.paymentDate,
        dueDate: data.dueDate,
        paymentMethod: data.paymentMethod as never,
        paymentType: data.paymentType as never,
        status: data.status as never,
        referenceNumber: data.referenceNumber,
        notes: data.notes,
        lateFee: data.lateFee,
        discount: data.discount,
        tax: data.tax,
        receiptNumber: data.receiptNumber,
        paidAmount: data.paidAmount,
      }),
    onSuccess: created => {
      toastService.success('Payment recorded successfully')
      invalidateList()
      navigate(`/payments/${created.id}`)
    },
    onError: (e: Error) => toastService.error(`Failed to create payment: ${e.message}`),
  })

  const updateMutation = useMutation({
    mutationFn: (data: PaymentFormData) =>
      paymentService.updatePayment(id!, {
        paymentDate: data.paymentDate,
        dueDate: data.dueDate,
        paymentMethod: data.paymentMethod as never,
        paymentType: data.paymentType as never,
        referenceNumber: data.referenceNumber,
        notes: data.notes,
        lateFee: data.lateFee,
        discount: data.discount,
        tax: data.tax,
        receiptNumber: data.receiptNumber,
        paidAmount: data.paidAmount,
      }),
    onSuccess: () => {
      toastService.success('Payment updated successfully')
      invalidateDetail(id!)
      invalidateList()
      navigate(`/payments/${id}`)
    },
    onError: (e: Error) => toastService.error(`Failed to update payment: ${e.message}`),
  })

  const handleSubmit = async (data: PaymentFormData) => {
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
        title="Error loading payment"
        message={error instanceof Error ? error.message : 'An error occurred'}
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {mode === 'create' ? 'Record Payment' : 'Edit Payment'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {mode === 'create' ? 'Create a new payment record for a lease' : 'Update payment details'}
        </p>
      </div>

      <PaymentForm
        mode={mode}
        initialData={payment}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(mode === 'edit' ? `/payments/${id}` : '/payments')}
      />
    </div>
  )
}
