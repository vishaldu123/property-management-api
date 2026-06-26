export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

class ToastManager {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private listeners: Set<(_toasts: Toast[]) => void> = new Set()
  private toasts: Toast[] = []
  private toastIdCounter = 0

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribe(listener: (_toastList: Toast[]) => void): () => void {
    this.listeners.add(listener)
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]))
  }

  show(message: string, type: ToastType = 'info', duration = 3000): string {
    const id = `toast-${++this.toastIdCounter}`
    const toast: Toast = { id, message, type, duration }
    this.toasts.push(toast)
    this.notify()

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id)
      }, duration)
    }

    return id
  }

  success(message: string, duration?: number): string {
    return this.show(message, 'success', duration)
  }

  error(message: string, duration?: number): string {
    return this.show(message, 'error', duration || 5000)
  }

  info(message: string, duration?: number): string {
    return this.show(message, 'info', duration)
  }

  warning(message: string, duration?: number): string {
    return this.show(message, 'warning', duration)
  }

  dismiss(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.notify()
  }

  dismissAll(): void {
    this.toasts = []
    this.notify()
  }

  getAll(): Toast[] {
    return [...this.toasts]
  }
}

export const toastManager = new ToastManager()

export const toastService = {
  success: (message: string, duration?: number) => toastManager.success(message, duration),
  error: (message: string, duration?: number) => toastManager.error(message, duration),
  info: (message: string, duration?: number) => toastManager.info(message, duration),
  warning: (message: string, duration?: number) => toastManager.warning(message, duration),
  dismiss: (id: string) => toastManager.dismiss(id),
  dismissAll: () => toastManager.dismissAll(),
}
