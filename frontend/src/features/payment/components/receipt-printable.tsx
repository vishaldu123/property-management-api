import * as React from 'react'
import type { Payment } from '@/shared/services'
import { ReceiptPreview } from './receipt-preview'
import { Button } from '@/shared/components/ui/button'

interface ReceiptPrintableProps {
  payment: Payment
  organizationName?: string
  tenantName?: string
  propertyName?: string
  unitLabel?: string
  onClose: () => void
}

export const ReceiptPrintable: React.FC<ReceiptPrintableProps> = ({
  payment,
  organizationName,
  tenantName,
  propertyName,
  unitLabel,
  onClose,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => window.print(), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-[60] bg-white overflow-auto print:static">
      <div className="p-4 print:hidden flex justify-between items-center border-b">
        <h2 className="font-semibold">Print Receipt</h2>
        <div className="flex gap-2">
          <Button onClick={() => window.print()}>Print</Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
      <div className="p-8">
        <ReceiptPreview
          payment={payment}
          organizationName={organizationName}
          tenantName={tenantName}
          propertyName={propertyName}
          unitLabel={unitLabel}
        />
      </div>
    </div>
  )
}
