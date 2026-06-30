import * as React from 'react'
import type { Payment } from '@/shared/services'
import { Modal, ModalFooter } from './modal'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { formatPaymentCurrency } from '../utils/payment.utils'

interface RefundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment
  isLoading?: boolean
  onConfirm: (refundAmount: number, reason: string) => void
}

export const RefundDialog: React.FC<RefundDialogProps> = ({
  open,
  onOpenChange,
  payment,
  isLoading,
  onConfirm,
}) => {
  const maxRefund = payment.paidAmount ?? payment.amount
  const [refundAmount, setRefundAmount] = React.useState(String(maxRefund))
  const [reason, setReason] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setRefundAmount(String(maxRefund))
      setReason('')
      setError(null)
    }
  }, [open, maxRefund])

  const handleConfirm = () => {
    const amount = Number(refundAmount)
    if (!amount || amount <= 0) {
      setError('Refund amount must be greater than zero')
      return
    }
    if (amount > maxRefund) {
      setError(`Refund cannot exceed ${formatPaymentCurrency(maxRefund, payment.currency)}`)
      return
    }
    if (!reason.trim()) {
      setError('Refund reason is required')
      return
    }
    onConfirm(amount, reason.trim())
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Refund Payment"
      description="This action will mark the payment as refunded."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="refund-amount">Refund Amount</Label>
          <Input
            id="refund-amount"
            type="number"
            min="0"
            step="0.01"
            value={refundAmount}
            onChange={e => {
              setRefundAmount(e.target.value)
              setError(null)
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="refund-reason">Reason</Label>
          <Input
            id="refund-reason"
            value={reason}
            onChange={e => {
              setReason(e.target.value)
              setError(null)
            }}
            placeholder="Enter refund reason"
            aria-required="true"
          />
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Confirm Refund'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
