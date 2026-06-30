import * as React from 'react'
import type { Payment } from '@/shared/services'
import { Modal, ModalFooter } from './modal'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { formatPaymentCurrency } from '../utils/payment.utils'

interface PartialPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment
  isLoading?: boolean
  onConfirm: (paidAmount: number) => void
}

export const PartialPaymentDialog: React.FC<PartialPaymentDialogProps> = ({
  open,
  onOpenChange,
  payment,
  isLoading,
  onConfirm,
}) => {
  const outstanding = payment.outstandingBalance ?? payment.amount - (payment.paidAmount ?? 0)
  const [amount, setAmount] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setAmount('')
      setError(null)
    }
  }, [open])

  const handleConfirm = () => {
    const value = Number(amount)
    if (!value || value <= 0) {
      setError('Amount must be greater than zero')
      return
    }
    if (value > outstanding) {
      setError(
        `Amount cannot exceed outstanding balance of ${formatPaymentCurrency(outstanding, payment.currency)}`
      )
      return
    }
    const totalPaid = (payment.paidAmount ?? 0) + value
    onConfirm(totalPaid)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Record Partial Payment"
      description={`Outstanding: ${formatPaymentCurrency(outstanding, payment.currency)}`}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="partial-amount">Payment Amount</Label>
          <Input
            id="partial-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={e => {
              setAmount(e.target.value)
              setError(null)
            }}
            aria-invalid={!!error}
          />
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? 'Recording...' : 'Record Payment'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
