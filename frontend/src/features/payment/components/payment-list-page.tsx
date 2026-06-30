import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { paymentService, type Payment } from '@/shared/services'
import { toastService } from '@/shared/services'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components'
import { usePermissionGate } from '@/shared/hooks'
import { PaymentList } from './payment-list'
import { MarkPaidDialog } from './mark-paid-dialog'
import { useInvalidatePayments, usePaymentStats } from '../hooks/use-payments'
import { exportPaymentsToCsv, formatPaymentCurrency } from '../utils/payment.utils'

export const PaymentListPage: React.FC = () => {
  const navigate = useNavigate()
  const { canPerform } = usePermissionGate()
  const { invalidateList } = useInvalidatePayments()
  const { data: stats, isLoading: statsLoading } = usePaymentStats()

  const [markPaidPayment, setMarkPaidPayment] = React.useState<Payment | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentService.deletePayment(id),
    onSuccess: () => {
      toastService.success('Payment deleted successfully')
      invalidateList()
    },
    onError: (error: Error) => toastService.error(`Failed to delete payment: ${error.message}`),
  })

  const markPaidMutation = useMutation({
    mutationFn: ({ id, paidAmount }: { id: string; paidAmount: number }) =>
      paymentService.markAsPaid(id, { paidAmount }),
    onSuccess: () => {
      toastService.success('Payment marked as paid')
      setMarkPaidPayment(null)
      invalidateList()
    },
    onError: (error: Error) => toastService.error(`Failed to mark as paid: ${error.message}`),
  })

  const handleBulkMarkPaid = async (ids: string[]) => {
    if (!confirm(`Mark ${ids.length} payment(s) as paid?`)) return
    for (const id of ids) {
      try {
        await paymentService.markAsPaid(id)
      } catch {
        toastService.error(`Failed to mark payment ${id} as paid`)
      }
    }
    toastService.success('Bulk mark paid completed')
    invalidateList()
  }

  const handleBulkDelete = (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} payment(s)?`)) return
    ids.forEach(id => deleteMutation.mutate(id))
  }

  const handleExport = (payments: Payment[]) => {
    const csv = exportPaymentsToCsv(payments)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payments-export-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toastService.success(`Exported ${payments.length} payment(s)`)
  }

  const handlePrintReceipts = (payments: Payment[]) => {
    if (payments.length === 1) {
      navigate(`/payments/${payments[0].id}?print=true`)
      return
    }
    toastService.info(`Open each payment detail to print ${payments.length} receipts`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-2">Track and manage rent collection</p>
        </div>
        {canPerform('payment:create') && (
          <Button onClick={() => navigate('/payments/create')} aria-label="Record payment">
            + Record Payment
          </Button>
        )}
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-label="Payment statistics"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {statsLoading ? '—' : formatPaymentCurrency(stats?.paidAmount ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {statsLoading ? '—' : formatPaymentCurrency(stats?.outstandingAmount ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{statsLoading ? '—' : (stats?.pendingCount ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{statsLoading ? '—' : (stats?.overDueCount ?? 0)}</p>
          </CardContent>
        </Card>
      </div>

      <PaymentList
        onView={id => navigate(`/payments/${id}`)}
        onEdit={canPerform('payment:update') ? id => navigate(`/payments/${id}/edit`) : undefined}
        onDelete={
          canPerform('payment:delete')
            ? id => {
                if (confirm('Are you sure you want to delete this payment?')) {
                  deleteMutation.mutate(id)
                }
              }
            : undefined
        }
        onMarkPaid={canPerform('payment:update') ? setMarkPaidPayment : undefined}
        onBulkMarkPaid={canPerform('payment:update') ? handleBulkMarkPaid : undefined}
        onBulkDelete={canPerform('payment:delete') ? handleBulkDelete : undefined}
        onExport={canPerform('payment:view') ? handleExport : undefined}
        onPrintReceipts={canPerform('payment:view') ? handlePrintReceipts : undefined}
      />

      {markPaidPayment && (
        <MarkPaidDialog
          open={!!markPaidPayment}
          onOpenChange={open => !open && setMarkPaidPayment(null)}
          payment={markPaidPayment}
          isLoading={markPaidMutation.isPending}
          onConfirm={paidAmount => markPaidMutation.mutate({ id: markPaidPayment.id, paidAmount })}
        />
      )}
    </div>
  )
}
