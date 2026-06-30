import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  leaseService,
  propertyService,
  tenantService,
  unitService,
  type Payment,
  type ListPaymentsParams,
} from '@/shared/services'
import { Button } from '@/shared/components/ui/button'
import { SkeletonTable } from '@/shared/components'
import { EmptyState } from '@/shared/components/ui/empty-state'
import { ErrorState } from '@/shared/components/ui/error-state'
import { usePermissionGate } from '@/shared/hooks'
import { usePaymentsList, usePrefetchPayment } from '../hooks/use-payments'
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PAYMENT_TYPES,
  OUTSTANDING_STATUSES,
} from '../constants'
import {
  filterByAmountRange,
  filterByReceiptNumber,
  formatPaymentCurrency,
  formatPaymentDate,
  getStatusBadgeClass,
} from '../utils/payment.utils'

interface PaymentListProps {
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onMarkPaid?: (payment: Payment) => void
  onBulkMarkPaid?: (ids: string[]) => void
  onBulkDelete?: (ids: string[]) => void
  onExport?: (payments: Payment[]) => void
  onPrintReceipts?: (payments: Payment[]) => void
}

export const PaymentList: React.FC<PaymentListProps> = ({
  onView,
  onEdit,
  onDelete,
  onMarkPaid,
  onBulkMarkPaid,
  onBulkDelete,
  onExport,
  onPrintReceipts,
}) => {
  const [searchParams] = useSearchParams()
  const { canPerform } = usePermissionGate()
  const prefetchPayment = usePrefetchPayment()

  const [page, setPage] = React.useState(1)
  const [limit] = React.useState(10)
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState(searchParams.get('status') ?? '')
  const [paymentMethod, setPaymentMethod] = React.useState('')
  const [paymentType, setPaymentType] = React.useState('')
  const [propertyId, setPropertyId] = React.useState('')
  const [unitId, setUnitId] = React.useState('')
  const [tenantId, setTenantId] = React.useState('')
  const [leaseId, setLeaseId] = React.useState('')
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')
  const [minAmount, setMinAmount] = React.useState('')
  const [maxAmount, setMaxAmount] = React.useState('')
  const [sortBy, setSortBy] = React.useState<ListPaymentsParams['sortBy']>('createdAt')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc')
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [receiptSearch, setReceiptSearch] = React.useState('')

  React.useEffect(() => {
    if (searchParams.get('outstanding') === 'true') {
      setStatus('Pending')
    }
    if (searchParams.get('status')) {
      setStatus(searchParams.get('status') ?? '')
    }
  }, [searchParams])

  const queryParams: ListPaymentsParams = {
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    paymentMethod: paymentMethod || undefined,
    paymentType: paymentType || undefined,
    propertyId: propertyId || undefined,
    unitId: unitId || undefined,
    tenantId: tenantId || undefined,
    leaseId: leaseId || undefined,
    startDate: startDate ? new Date(`${startDate}T00:00:00.000Z`).toISOString() : undefined,
    endDate: endDate ? new Date(`${endDate}T23:59:59.999Z`).toISOString() : undefined,
    sortBy,
    sortOrder,
  }

  const { data, isLoading, isError, error, refetch, isFetching } = usePaymentsList(queryParams)

  const { data: propertiesData } = useQuery({
    queryKey: ['properties', 'list', 'payment-filters'],
    queryFn: () => propertyService.listProperties({ limit: 100 }),
  })

  const { data: unitsData } = useQuery({
    queryKey: ['units', 'list', 'payment-filters'],
    queryFn: () => unitService.listUnits({ limit: 100 }),
  })

  const { data: tenantsData } = useQuery({
    queryKey: ['tenants', 'list', 'payment-filters'],
    queryFn: () => tenantService.listTenants({ limit: 100 }),
  })

  const { data: leasesData } = useQuery({
    queryKey: ['leases', 'list', 'payment-filters'],
    queryFn: () => leaseService.listLeases({ limit: 100 }),
  })

  const lookupMaps = React.useMemo(
    () => ({
      properties: new Map(propertiesData?.data.map(p => [p.id, p.name]) ?? []),
      units: new Map(unitsData?.data.map(u => [u.id, u.unitNumber]) ?? []),
      tenants: new Map(tenantsData?.data.map(t => [t.id, `${t.firstName} ${t.lastName}`]) ?? []),
      leases: new Map(leasesData?.data.map(l => [l.id, l.leaseNumber]) ?? []),
    }),
    [propertiesData, unitsData, tenantsData, leasesData]
  )

  let payments = data?.data ?? []
  if (receiptSearch) {
    payments = filterByReceiptNumber(payments, receiptSearch)
  }
  if (minAmount || maxAmount) {
    payments = filterByAmountRange(
      payments,
      minAmount ? Number(minAmount) : undefined,
      maxAmount ? Number(maxAmount) : undefined
    )
  }
  if (searchParams.get('outstanding') === 'true' && !status) {
    payments = payments.filter(p => OUTSTANDING_STATUSES.includes(p.status))
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === payments.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(payments.map(p => p.id)))
    }
  }

  const selectedPayments = payments.filter(p => selectedIds.has(p.id))

  const resetPage = () => setPage(1)

  if (isLoading) {
    return <SkeletonTable rows={5} columns={8} aria-label="Loading payments" />
  }

  if (isError) {
    return (
      <ErrorState
        title="Error loading payments"
        message={error instanceof Error ? error.message : 'An error occurred'}
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
        role="search"
        aria-label="Payment filters"
      >
        <input
          type="text"
          placeholder="Search payment #, reference..."
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Search payments"
        />
        <input
          type="text"
          placeholder="Receipt number"
          value={receiptSearch}
          onChange={e => {
            setReceiptSearch(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Search by receipt number"
        />
        <select
          value={status}
          onChange={e => {
            setStatus(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          {PAYMENT_STATUSES.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={paymentMethod}
          onChange={e => {
            setPaymentMethod(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by payment method"
        >
          <option value="">All Methods</option>
          {PAYMENT_METHODS.map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={paymentType}
          onChange={e => {
            setPaymentType(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by payment type"
        >
          <option value="">All Types</option>
          {PAYMENT_TYPES.map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={propertyId}
          onChange={e => {
            setPropertyId(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by property"
        >
          <option value="">All Properties</option>
          {propertiesData?.data.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={unitId}
          onChange={e => {
            setUnitId(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by unit"
        >
          <option value="">All Units</option>
          {unitsData?.data.map(u => (
            <option key={u.id} value={u.id}>
              {u.unitNumber}
            </option>
          ))}
        </select>
        <select
          value={tenantId}
          onChange={e => {
            setTenantId(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by tenant"
        >
          <option value="">All Tenants</option>
          {tenantsData?.data.map(t => (
            <option key={t.id} value={t.id}>
              {t.firstName} {t.lastName}
            </option>
          ))}
        </select>
        <select
          value={leaseId}
          onChange={e => {
            setLeaseId(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Filter by lease"
        >
          <option value="">All Leases</option>
          {leasesData?.data.map(l => (
            <option key={l.id} value={l.id}>
              {l.leaseNumber}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={e => {
            setStartDate(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Start date"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => {
            setEndDate(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="End date"
        />
        <input
          type="number"
          placeholder="Min amount"
          value={minAmount}
          onChange={e => {
            setMinAmount(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Minimum amount"
        />
        <input
          type="number"
          placeholder="Max amount"
          value={maxAmount}
          onChange={e => {
            setMaxAmount(e.target.value)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Maximum amount"
        />
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={e => {
            const [field, order] = e.target.value.split('-') as [
              ListPaymentsParams['sortBy'],
              'asc' | 'desc',
            ]
            setSortBy(field)
            setSortOrder(order)
            resetPage()
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Sort payments"
        >
          <option value="paymentDate-desc">Payment Date (newest)</option>
          <option value="paymentDate-asc">Payment Date (oldest)</option>
          <option value="dueDate-desc">Due Date (newest)</option>
          <option value="dueDate-asc">Due Date (oldest)</option>
          <option value="amount-desc">Amount (high to low)</option>
          <option value="amount-asc">Amount (low to high)</option>
          <option value="status-asc">Status (A-Z)</option>
          <option value="createdAt-desc">Created (newest)</option>
          <option value="createdAt-asc">Created (oldest)</option>
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div
          className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/30"
          role="toolbar"
          aria-label="Bulk actions"
        >
          <span className="text-sm self-center">{selectedIds.size} selected</span>
          {canPerform('payment:view') && onExport && (
            <Button size="sm" variant="outline" onClick={() => onExport(selectedPayments)}>
              Export Selected
            </Button>
          )}
          {canPerform('payment:view') && onPrintReceipts && (
            <Button size="sm" variant="outline" onClick={() => onPrintReceipts(selectedPayments)}>
              Print Receipts
            </Button>
          )}
          {canPerform('payment:update') && onBulkMarkPaid && (
            <Button size="sm" onClick={() => onBulkMarkPaid(Array.from(selectedIds))}>
              Mark Paid
            </Button>
          )}
          {canPerform('payment:delete') && onBulkDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onBulkDelete(Array.from(selectedIds))}
            >
              Delete
            </Button>
          )}
        </div>
      )}

      {isFetching && !isLoading && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Refreshing...
        </p>
      )}

      {!payments.length ? (
        <EmptyState
          title="No payments found"
          description="Record your first payment or adjust your filters"
        />
      ) : (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full" aria-label="Payments table">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === payments.length && payments.length > 0}
                      onChange={toggleSelectAll}
                      aria-label="Select all payments"
                    />
                  </th>
                  <th className="px-4 py-2 text-left">Payment #</th>
                  <th className="px-4 py-2 text-left">Tenant</th>
                  <th className="px-4 py-2 text-left">Property / Unit</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Outstanding</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Due Date</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr
                    key={payment.id}
                    className="border-t hover:bg-muted/50"
                    onMouseEnter={() => prefetchPayment(payment.id)}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(payment.id)}
                        onChange={() => toggleSelect(payment.id)}
                        aria-label={`Select payment ${payment.paymentNumber}`}
                      />
                    </td>
                    <td className="px-4 py-2 font-medium">{payment.paymentNumber}</td>
                    <td className="px-4 py-2">{lookupMaps.tenants.get(payment.tenantId) ?? '—'}</td>
                    <td className="px-4 py-2 text-sm">
                      {lookupMaps.properties.get(payment.propertyId) ?? '—'}
                      <span className="text-muted-foreground">
                        {' '}
                        / {lookupMaps.units.get(payment.unitId) ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {formatPaymentCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="px-4 py-2">
                      {formatPaymentCurrency(
                        payment.outstandingBalance ?? payment.amount,
                        payment.currency
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(payment.status)}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{formatPaymentDate(payment.dueDate)}</td>
                    <td className="px-4 py-2 text-right space-x-1">
                      {onView && (
                        <Button size="sm" variant="ghost" onClick={() => onView(payment.id)}>
                          View
                        </Button>
                      )}
                      {canPerform('payment:update') && onEdit && payment.status !== 'Paid' && (
                        <Button size="sm" variant="ghost" onClick={() => onEdit(payment.id)}>
                          Edit
                        </Button>
                      )}
                      {canPerform('payment:update') &&
                        onMarkPaid &&
                        ['Pending', 'PartiallyPaid', 'Overdue'].includes(payment.status) && (
                          <Button size="sm" variant="ghost" onClick={() => onMarkPaid(payment)}>
                            Mark Paid
                          </Button>
                        )}
                      {canPerform('payment:delete') && onDelete && (
                        <Button size="sm" variant="ghost" onClick={() => onDelete(payment.id)}>
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.total)} of{' '}
                {data.total} payments
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(Math.max(1, page - 1))}
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                  aria-label="Next page"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
