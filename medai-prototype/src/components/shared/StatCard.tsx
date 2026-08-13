import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  hint?: string
  trend?: { value: string; positive?: boolean }
  className?: string
}

export function StatCard({ label, value, icon, hint, trend, className }: StatCardProps) {
  return (
    <Card className={cn('p-5 card-hover', className)}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <div className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</div>
          {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
          {trend && (
            <span
              className={cn(
                'mt-2 inline-flex items-center gap-1 text-xs font-semibold',
                trend.positive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.positive ? '▲' : '▼'} {trend.value}
            </span>
          )}
        </div>
        {icon && (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
