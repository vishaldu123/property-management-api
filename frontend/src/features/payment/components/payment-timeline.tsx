import * as React from 'react'
import type { Payment } from '@/shared/services'
import { buildPaymentTimeline } from '../utils/payment.utils'
import { formatPaymentDate } from '../utils/payment.utils'

interface PaymentTimelineProps {
  payment: Payment
}

const eventIcons: Record<string, string> = {
  created: '●',
  updated: '◆',
  marked_paid: '✓',
  partial_payment: '◐',
  refund: '↩',
  receipt_generated: '🧾',
}

export const PaymentTimeline: React.FC<PaymentTimelineProps> = ({ payment }) => {
  const events = buildPaymentTimeline(payment)

  return (
    <section aria-label="Payment timeline" className="space-y-4">
      <h3 className="font-semibold text-lg">Timeline</h3>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No timeline events yet.</p>
      ) : (
        <ol className="relative border-l border-muted pl-6 space-y-4">
          {events.map(event => (
            <li key={event.id} className="relative">
              <span
                className="absolute -left-[1.65rem] flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs"
                aria-hidden="true"
              >
                {eventIcons[event.type] ?? '•'}
              </span>
              <div>
                <p className="font-medium text-sm">{event.label}</p>
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
                <time className="text-xs text-muted-foreground" dateTime={event.timestamp}>
                  {formatPaymentDate(event.timestamp)}
                </time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
