import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'
import { useApp } from '@/store/AppProvider'
import { cn } from '@/lib/utils'

const icons = {
  default: Info,
  success: CheckCircle2,
  destructive: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const iconColors = {
  default: 'text-foreground',
  success: 'text-success',
  destructive: 'text-destructive',
  warning: 'text-warning',
  info: 'text-info',
}

export function Toaster() {
  const { toasts, dismissToast } = useApp()

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.variant ?? 'default']
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border bg-popover p-4 shadow-lift animate-in slide-in-from-bottom-4',
              toast.variant === 'destructive' ? 'border-destructive/30' : toast.variant === 'success' ? 'border-success/30' : toast.variant === 'warning' ? 'border-warning/30' : 'border-border'
            )}
          >
            <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconColors[toast.variant ?? 'default'])} />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold leading-none">{toast.title}</p>
              {toast.description && <p className="text-sm text-muted-foreground">{toast.description}</p>}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="rounded-sm opacity-60 transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
