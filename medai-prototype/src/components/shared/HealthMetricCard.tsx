import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { cn } from '@/lib/utils'

interface HealthMetricCardProps {
  label: string
  value: ReactNode
  unit?: string
  status: 'Normal' | 'Borderline' | 'Abnormal'
  icon: ReactNode
  trend?: string
  live?: boolean
  className?: string
}

export function HealthMetricCard({ label, value, unit, status, icon, trend, live, className }: HealthMetricCardProps) {
  return (
    <Card className={cn('p-5 card-hover', live && 'border-primary/20', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            {live && <p className="text-[10px] font-medium text-success">● LIVE</p>}
          </div>
        </div>
        <StatusBadge tone={status} />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="font-display text-3xl font-bold tracking-tight">
          {value}
          {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
        </div>
        {trend && <span className="text-xs font-semibold text-muted-foreground">{trend}</span>}
      </div>
    </Card>
  )
}
