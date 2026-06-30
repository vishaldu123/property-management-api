import * as React from 'react'
import { cn } from '@/utils/cn'
import { Button } from '@/shared/components/ui/button'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}) => {
  const titleId = React.useId()
  const descriptionId = React.useId()

  React.useEffect(() => {
    if (!open) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={() => onOpenChange(false)}
    >
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'relative z-50 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg',
          className
        )}
        onClick={event => event.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

interface ModalFooterProps {
  children: React.ReactNode
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => (
  <div className="flex justify-end gap-2 mt-6">{children}</div>
)

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  isLoading?: boolean
  onConfirm: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading,
  onConfirm,
}) => (
  <Modal open={open} onOpenChange={onOpenChange} title={title} description={description}>
    <ModalFooter>
      <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
        {cancelLabel}
      </Button>
      <Button
        variant={variant === 'destructive' ? 'destructive' : 'default'}
        onClick={onConfirm}
        disabled={isLoading}
        aria-label={confirmLabel}
      >
        {isLoading ? 'Processing...' : confirmLabel}
      </Button>
    </ModalFooter>
  </Modal>
)
