import * as React from 'react'
import type { Payment } from '@/shared/services'
import { Modal, ModalFooter } from './modal'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { formatPaymentCurrency } from '../utils/payment.utils'

interface MarkPaidDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment
  isLoading?: boolean
  onConfirm: (paidAmount: number) => void
}

export const MarkPaidDialog: React.FC<MarkPaidDialogProps> = ({
  open,
  onOpenChange,
  payment,
  isLoading,
  onConfirm,
}) => {
  const [paidAmount, setPaidAmount] = React.useState(String(payment.amount))
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      const remaining = payment.outstandingBalance ?? payment.amount - (payment.paidAmount ?? 0)
      setPaidAmount(String(remaining > 0 ? remaining : payment.amount))
      setError(null)
    }
  }, [open, payment])

  const handleConfirm = () => {
    const amount = Number(paidAmount)
    if (!amount || amount <= 0) {
      setError('Paid amount must be greater than zero')
      return
    }
    if (amount > payment.amount) {
      setError('Paid amount cannot exceed payment amount')
      return
    }
    onConfirm(amount)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Mark Payment as Paid"
      description={`Record payment for ${payment.paymentNumber}`}
    >
      <div className="space-y-4">
        <p className="text-sm">
          Total amount: <strong>{formatPaymentCurrency(payment.amount, payment.currency)}</strong>
        </p>
        <div className="space-y-2">
          <Label htmlFor="paid-amount">Paid Amount</Label>
          <Input
            id="paid-amount"
            type="number"
            min="0"
            step="0.01"
            value={paidAmount}
            onChange={e => {
              setPaidAmount(e.target.value)
              setError(null)
            }}
            aria-invalid={!!error}
            aria-describedby={error ? 'paid-amount-error' : undefined}
          />
          {error && (
            <p id="paid-amount-error" className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={isLoading} aria-label="Confirm mark as paid">
          {isLoading ? 'Processing...' : 'Mark as Paid'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
