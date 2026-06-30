import * as React from 'react'
import { lazy, Suspense } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import {
  paymentService,
  propertyService,
  tenantService,
  unitService,
  leaseService,
} from '@/shared/services'
import { toastService } from '@/shared/services'
import { Button } from '@/shared/components/ui/button'
import { Loading } from '@/shared/components/ui/loading'
import { ErrorState } from '@/shared/components/ui/error-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { usePermissionGate } from '@/shared/hooks'
import {
  usePaymentDetail,
  useLeasePaymentHistory,
  useInvalidatePayments,
} from '../hooks/use-payments'
import { PaymentTimeline } from './payment-timeline'
import { OutstandingBalanceCard } from './outstanding-balance-card'
import { ReceiptPreview } from './receipt-preview'
import { MarkPaidDialog } from './mark-paid-dialog'
import { PartialPaymentDialog } from './partial-payment-dialog'
import { RefundDialog } from './refund-dialog'
import {
  calculateNetAmount,
  formatPaymentCurrency,
  formatPaymentDate,
  getStatusBadgeClass,
} from '../utils/payment.utils'

const ReceiptPrintable = lazy(() =>
  import('./receipt-printable').then(m => ({ default: m.ReceiptPrintable }))
)

export const PaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { canPerform } = usePermissionGate()
  const { invalidateDetail, invalidateList } = useInvalidatePayments()

  const [showMarkPaid, setShowMarkPaid] = React.useState(false)
  const [showPartial, setShowPartial] = React.useState(false)
  const [showRefund, setShowRefund] = React.useState(false)
  const [showReceipt, setShowReceipt] = React.useState(false)
  const [showPrint, setShowPrint] = React.useState(false)

  const { data: payment, isLoading, isError, error } = usePaymentDetail(id)
  const { data: historyData } = useLeasePaymentHistory(payment?.leaseId)

  const { data: tenant } = useQuery({
    queryKey: ['tenant', payment?.tenantId],
    queryFn: () => tenantService.getTenant(payment!.tenantId),
    enabled: !!payment?.tenantId,
  })

  const { data: property } = useQuery({
    queryKey: ['property', payment?.propertyId],
    queryFn: () => propertyService.getProperty(payment!.propertyId),
    enabled: !!payment?.propertyId,
  })

  const { data: unit } = useQuery({
    queryKey: ['unit', payment?.unitId],
    queryFn: () => unitService.getUnit(payment!.unitId),
    enabled: !!payment?.unitId,
  })

  const { data: lease } = useQuery({
    queryKey: ['lease', payment?.leaseId],
    queryFn: async () => {
      const result = await leaseService.listLeases({ limit: 100 })
      return result.data.find(l => l.id === payment!.leaseId) ?? null
    },
    enabled: !!payment?.leaseId,
  })

  React.useEffect(() => {
    if (searchParams.get('print') === 'true' && payment?.receiptNumber) {
      setShowPrint(true)
    }
  }, [searchParams, payment?.receiptNumber])

  const deleteMutation = useMutation({
    mutationFn: () => paymentService.deletePayment(id!),
    onSuccess: () => {
      toastService.success('Payment deleted')
      navigate('/payments')
    },
    onError: (e: Error) => toastService.error(e.message),
  })

  const restoreMutation = useMutation({
    mutationFn: () => paymentService.restorePayment(id!),
    onSuccess: () => {
      toastService.success('Payment restored')
      invalidateDetail(id!)
    },
    onError: (e: Error) => toastService.error(e.message),
  })

  const markPaidMutation = useMutation({
    mutationFn: (paidAmount: number) => paymentService.markAsPaid(id!, { paidAmount }),
    onSuccess: () => {
      toastService.success('Payment updated')
      setShowMarkPaid(false)
      setShowPartial(false)
      invalidateDetail(id!)
      invalidateList()
    },
    onError: (e: Error) => toastService.error(e.message),
  })

  const refundMutation = useMutation({
    mutationFn: (refundAmount: number) => paymentService.refundPayment(id!, { refundAmount }),
    onSuccess: () => {
      toastService.success('Refund processed')
      setShowRefund(false)
      invalidateDetail(id!)
      invalidateList()
    },
    onError: (e: Error) => toastService.error(e.message),
  })

  const receiptMutation = useMutation({
    mutationFn: () => paymentService.generateReceipt(id!),
    onSuccess: () => {
      toastService.success('Receipt generated')
      invalidateDetail(id!)
      setShowReceipt(true)
    },
    onError: (e: Error) => toastService.error(e.message),
  })

  if (isLoading) return <Loading />

  if (isError) {
    return (
      <ErrorState
        title="Error loading payment"
        message={error instanceof Error ? error.message : 'An error occurred'}
      />
    )
  }

  if (!payment) {
    return (
      <ErrorState
        title="Payment not found"
        message="The payment you're looking for doesn't exist"
      />
    )
  }

  const tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : '—'
  const netAmount = calculateNetAmount(
    payment.amount,
    payment.lateFee,
    payment.discount,
    payment.tax
  )
  const historyPayments = (historyData?.data ?? []).filter(p => p.id !== payment.id)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{payment.paymentNumber}</h1>
          <p className="text-muted-foreground mt-1">
            <span className={`px-2 py-1 rounded text-sm ${getStatusBadgeClass(payment.status)}`}>
              {payment.status}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canPerform('payment:update') &&
            !['Paid', 'Refunded', 'Cancelled'].includes(payment.status) && (
              <Button variant="outline" onClick={() => navigate(`/payments/${id}/edit`)}>
                Edit
              </Button>
            )}
          {canPerform('payment:update') && ['Pending', 'Overdue'].includes(payment.status) && (
            <Button onClick={() => setShowMarkPaid(true)}>Mark Paid</Button>
          )}
          {canPerform('payment:update') && payment.status === 'PartiallyPaid' && (
            <Button variant="outline" onClick={() => setShowPartial(true)}>
              Record Partial
            </Button>
          )}
          {canPerform('payment:update') && ['Paid', 'PartiallyPaid'].includes(payment.status) && (
            <Button variant="outline" onClick={() => setShowRefund(true)}>
              Refund
            </Button>
          )}
          {canPerform('payment:view') && (
            <Button
              variant="outline"
              onClick={() => receiptMutation.mutate()}
              disabled={receiptMutation.isPending}
            >
              {payment.receiptNumber ? 'Regenerate Receipt' : 'Generate Receipt'}
            </Button>
          )}
          {payment.receiptNumber && (
            <Button variant="outline" onClick={() => setShowPrint(true)}>
              Print Receipt
            </Button>
          )}
          {canPerform('payment:delete') && !payment.deletedAt && (
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Delete this payment?')) deleteMutation.mutate()
              }}
            >
              Delete
            </Button>
          )}
          {payment.deletedAt && canPerform('payment:delete') && (
            <Button variant="outline" onClick={() => restoreMutation.mutate()}>
              Restore
            </Button>
          )}
        </div>
      </div>

      {payment.deletedAt && (
        <div className="p-4 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-800">
          This payment has been deleted.
        </div>
      )}

      <OutstandingBalanceCard payment={payment} />

      <Tabs defaultValue="details">
        <TabsList aria-label="Payment sections">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          {payment.receiptNumber && <TabsTrigger value="receipt">Receipt</TabsTrigger>}
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border p-4">
            <DetailField label="Tenant" value={tenantName} />
            <DetailField label="Lease" value={lease?.leaseNumber ?? payment.leaseId} />
            <DetailField label="Property" value={property?.name ?? '—'} />
            <DetailField label="Unit" value={unit?.unitNumber ?? '—'} />
            <DetailField
              label="Amount"
              value={formatPaymentCurrency(payment.amount, payment.currency)}
            />
            <DetailField
              label="Net Amount"
              value={formatPaymentCurrency(netAmount, payment.currency)}
            />
            <DetailField
              label="Late Fee"
              value={formatPaymentCurrency(payment.lateFee ?? 0, payment.currency)}
            />
            <DetailField
              label="Discount"
              value={formatPaymentCurrency(payment.discount ?? 0, payment.currency)}
            />
            <DetailField
              label="Tax"
              value={formatPaymentCurrency(payment.tax ?? 0, payment.currency)}
            />
            <DetailField label="Payment Method" value={payment.paymentMethod ?? '—'} />
            <DetailField label="Payment Type" value={payment.paymentType} />
            <DetailField label="Reference Number" value={payment.referenceNumber ?? '—'} />
            <DetailField label="Receipt Number" value={payment.receiptNumber ?? '—'} />
            <DetailField label="Payment Date" value={formatPaymentDate(payment.paymentDate)} />
            <DetailField label="Due Date" value={formatPaymentDate(payment.dueDate)} />
            <DetailField label="Created By" value={payment.createdBy ?? '—'} />
            <DetailField label="Updated By" value={payment.updatedBy ?? '—'} />
            <DetailField label="Notes" value={payment.notes ?? '—'} className="md:col-span-2" />
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <PaymentTimeline payment={payment} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <section aria-label="Lease payment history">
            {historyPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other payments for this lease.</p>
            ) : (
              <ul className="space-y-2">
                {historyPayments.map(p => (
                  <li key={p.id} className="flex justify-between items-center border rounded p-3">
                    <div>
                      <p className="font-medium">{p.paymentNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPaymentDate(p.paymentDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p>{formatPaymentCurrency(p.amount, p.currency)}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/payments/${p.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </TabsContent>

        {payment.receiptNumber && (
          <TabsContent value="receipt" className="mt-4">
            <ReceiptPreview
              payment={payment}
              tenantName={tenantName}
              propertyName={property?.name}
              unitLabel={unit?.unitNumber}
              onPrint={() => setShowPrint(true)}
              onDownloadPdf={() => toastService.info('PDF download coming soon')}
            />
          </TabsContent>
        )}
      </Tabs>

      <MarkPaidDialog
        open={showMarkPaid}
        onOpenChange={setShowMarkPaid}
        payment={payment}
        isLoading={markPaidMutation.isPending}
        onConfirm={amount => markPaidMutation.mutate(amount)}
      />

      <PartialPaymentDialog
        open={showPartial}
        onOpenChange={setShowPartial}
        payment={payment}
        isLoading={markPaidMutation.isPending}
        onConfirm={totalPaid => markPaidMutation.mutate(totalPaid)}
      />

      <RefundDialog
        open={showRefund}
        onOpenChange={setShowRefund}
        payment={payment}
        isLoading={refundMutation.isPending}
        onConfirm={(amount, _reason) => refundMutation.mutate(amount)}
      />

      {showReceipt && payment.receiptNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-lg p-4 max-w-lg w-full">
            <ReceiptPreview
              payment={payment}
              tenantName={tenantName}
              propertyName={property?.name}
              unitLabel={unit?.unitNumber}
              onPrint={() => {
                setShowReceipt(false)
                setShowPrint(true)
              }}
            />
            <Button className="mt-4 w-full" variant="outline" onClick={() => setShowReceipt(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {showPrint && (
        <Suspense fallback={<Loading />}>
          <ReceiptPrintable
            payment={payment}
            tenantName={tenantName}
            propertyName={property?.name}
            unitLabel={unit?.unitNumber}
            onClose={() => setShowPrint(false)}
          />
        </Suspense>
      )}
    </div>
  )
}

function DetailField({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
