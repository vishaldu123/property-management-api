import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import {
  leaseService,
  propertyService,
  tenantService,
  unitService,
  type Payment,
} from '@/shared/services'
import { Button } from '@/shared/components/ui/button'
import { TextField, NumberField, DateField, SelectField, TextAreaField } from '@/shared/components'
import { PAYMENT_METHODS, PAYMENT_TYPES, PAYMENT_STATUSES } from '../constants'
import {
  calculateNetAmount,
  calculateOutstanding,
  formatPaymentCurrency,
  generatePaymentNumber,
  toIsoDateTime,
} from '../utils/payment.utils'

const paymentFormSchema = z.object({
  leaseId: z.string().min(1, 'Lease is required'),
  paymentNumber: z.string().min(1, 'Payment number is required'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  currency: z.string().default('USD'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  paymentMethod: z.string().min(1),
  paymentType: z.string().min(1),
  status: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  lateFee: z.coerce.number().nonnegative().optional(),
  discount: z.coerce.number().nonnegative().optional(),
  tax: z.coerce.number().nonnegative().optional(),
  receiptNumber: z.string().optional(),
  paidAmount: z.coerce.number().nonnegative().optional(),
})

export type PaymentFormData = z.infer<typeof paymentFormSchema>

interface PaymentFormProps {
  mode: 'create' | 'edit'
  initialData?: Payment
  isLoading?: boolean
  onSubmit: (data: PaymentFormData) => void | Promise<void>
  onCancel: () => void
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  mode,
  initialData,
  isLoading,
  onSubmit,
  onCancel,
}) => {
  const { control, handleSubmit, watch, setValue } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema) as never,
    defaultValues: {
      leaseId: initialData?.leaseId ?? '',
      paymentNumber: initialData?.paymentNumber ?? generatePaymentNumber(),
      amount: initialData?.amount ?? 0,
      currency: initialData?.currency ?? 'USD',
      paymentDate:
        initialData?.paymentDate?.split('T')[0] ?? new Date().toISOString().split('T')[0],
      dueDate: initialData?.dueDate?.split('T')[0] ?? new Date().toISOString().split('T')[0],
      paymentMethod: initialData?.paymentMethod ?? 'BankTransfer',
      paymentType: initialData?.paymentType ?? 'Rent',
      status: initialData?.status ?? 'Pending',
      referenceNumber: initialData?.referenceNumber ?? '',
      notes: initialData?.notes ?? '',
      lateFee: initialData?.lateFee ?? 0,
      discount: initialData?.discount ?? 0,
      tax: initialData?.tax ?? 0,
      receiptNumber: initialData?.receiptNumber ?? '',
      paidAmount: initialData?.paidAmount ?? 0,
    },
  })

  const leaseId = watch('leaseId')
  const amount = watch('amount') ?? 0
  const lateFee = watch('lateFee') ?? 0
  const discount = watch('discount') ?? 0
  const tax = watch('tax') ?? 0
  const paidAmount = watch('paidAmount') ?? 0

  const { data: leasesData } = useQuery({
    queryKey: ['leases', 'list', 'payment-form'],
    queryFn: () => leaseService.listLeases({ limit: 100 }),
  })

  const { data: propertiesData } = useQuery({
    queryKey: ['properties', 'list', 'payment-form'],
    queryFn: () => propertyService.listProperties({ limit: 100 }),
  })

  const { data: unitsData } = useQuery({
    queryKey: ['units', 'list', 'payment-form'],
    queryFn: () => unitService.listUnits({ limit: 100 }),
  })

  const { data: tenantsData } = useQuery({
    queryKey: ['tenants', 'list', 'payment-form'],
    queryFn: () => tenantService.listTenants({ limit: 100 }),
  })

  const selectedLease = leasesData?.data.find(l => l.id === leaseId)

  React.useEffect(() => {
    if (selectedLease && mode === 'create') {
      setValue('amount', selectedLease.monthlyRent)
    }
  }, [selectedLease, mode, setValue])

  const netAmount = calculateNetAmount(amount, lateFee, discount, tax)
  const outstanding = calculateOutstanding(amount, lateFee, discount, tax, paidAmount)

  const leaseOptions =
    leasesData?.data.map(l => ({
      value: l.id,
      label: `${l.leaseNumber} — $${l.monthlyRent}/mo`,
    })) ?? []

  const handleFormSubmit = (data: PaymentFormData) => {
    onSubmit({
      ...data,
      paymentDate: toIsoDateTime(data.paymentDate),
      dueDate: toIsoDateTime(data.dueDate),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          name="leaseId"
          control={control}
          label="Lease"
          required
          options={leaseOptions}
        />

        <TextField
          name="paymentNumber"
          control={control}
          label="Payment Number"
          required
          disabled={mode === 'edit'}
        />

        {selectedLease && (
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-lg border p-4 bg-muted/20">
            <div>
              <p className="text-sm text-muted-foreground">Property</p>
              <p className="font-medium">
                {propertiesData?.data.find(p => p.id === selectedLease.propertyId)?.name ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unit</p>
              <p className="font-medium">
                {unitsData?.data.find(u => u.id === selectedLease.unitId)?.unitNumber ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tenant</p>
              <p className="font-medium">
                {(() => {
                  const tenant = tenantsData?.data.find(t => t.id === selectedLease.tenantId)
                  return tenant ? `${tenant.firstName} ${tenant.lastName}` : '—'
                })()}
              </p>
            </div>
          </div>
        )}

        <NumberField name="amount" control={control} label="Amount" required />
        <NumberField name="lateFee" control={control} label="Late Fee" />
        <NumberField name="discount" control={control} label="Discount" />
        <NumberField name="tax" control={control} label="Tax" />
        <NumberField name="paidAmount" control={control} label="Paid Amount" />

        <DateField name="paymentDate" control={control} label="Payment Date" required />
        <DateField name="dueDate" control={control} label="Due Date" required />

        <SelectField
          name="paymentMethod"
          control={control}
          label="Payment Method"
          options={PAYMENT_METHODS.map(m => ({ value: m, label: m }))}
        />
        <SelectField
          name="paymentType"
          control={control}
          label="Payment Type"
          options={PAYMENT_TYPES.map(t => ({ value: t, label: t }))}
        />

        {mode === 'create' && (
          <SelectField
            name="status"
            control={control}
            label="Status"
            options={PAYMENT_STATUSES.map(s => ({ value: s, label: s }))}
          />
        )}

        <TextField name="referenceNumber" control={control} label="Reference Number" />
        <TextField name="receiptNumber" control={control} label="Receipt Number" />
      </div>

      <TextAreaField name="notes" control={control} label="Notes" rows={3} />

      <div className="rounded-lg border bg-muted/30 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Net Amount</p>
          <p className="text-lg font-semibold">{formatPaymentCurrency(netAmount)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Outstanding Balance</p>
          <p className="text-lg font-semibold">{formatPaymentCurrency(outstanding)}</p>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : mode === 'create' ? 'Record Payment' : 'Update Payment'}
        </Button>
      </div>
    </form>
  )
}
