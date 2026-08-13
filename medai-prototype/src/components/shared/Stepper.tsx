import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepperProps {
  steps: { label: string; description?: string }[]
  current: number
  loadingStep?: number
}

export function Stepper({ steps, current, loadingStep }: StepperProps) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const isDone = i < current
        const isActive = i === current
        const isLoading = loadingStep === i
        return (
          <div key={step.label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div
                className={cn(
                  'grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-bold transition-colors',
                  isDone && 'border-primary bg-primary text-white',
                  isActive && 'border-primary bg-primary/10 text-primary ring-4 ring-primary/15',
                  !isDone && !isActive && 'border-border bg-muted text-muted-foreground'
                )}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isDone ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn('max-w-[80px] text-[11px] font-semibold leading-tight', isActive ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground')}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('mx-2 h-0.5 flex-1 rounded', i < current ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        )
      })}
    </div>
  )
}
