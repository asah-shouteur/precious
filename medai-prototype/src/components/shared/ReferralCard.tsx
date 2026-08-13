import { Check, MapPin, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { cn } from '@/lib/utils'
import type { Referral, ReferralStatus } from '@/types'

const workflow: ReferralStatus[] = ['Requested', 'Reviewed', 'Accepted', 'In Progress', 'Completed']

export function ReferralWorkflow({ status }: { status: ReferralStatus }) {
  const currentIndex = workflow.indexOf(status)
  return (
    <div className="flex items-center">
      {workflow.map((step, i) => {
        const done = i < currentIndex || status === 'Completed'
        const active = i === currentIndex
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-bold transition-colors',
                  done && 'border-success bg-success text-white',
                  active && 'border-primary bg-primary text-white',
                  !done && !active && 'border-border bg-muted text-muted-foreground'
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn('hidden text-[10px] font-medium md:block', active ? 'text-primary' : 'text-muted-foreground')}>{step}</span>
            </div>
            {i < workflow.length - 1 && (
              <div className={cn('mx-1 h-0.5 flex-1 rounded', i < currentIndex ? 'bg-success' : 'bg-border')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ReferralCard({ referral, onView, match }: { referral: Referral; onView?: (r: Referral) => void; match?: boolean }) {
  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-sm font-bold">{referral.specialty}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{referral.condition}</p>
          </div>
          <StatusBadge tone={referral.urgency} />
        </div>

        <div className="mt-3 rounded-lg bg-muted/70 p-3">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-muted-foreground">→ {referral.toFacilityName}</span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {referral.distanceKm} km
            </span>
          </div>
          {match && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> AI Match {referral.matchScore}%
            </div>
          )}
        </div>

        <div className="mt-4">
          <ReferralWorkflow status={referral.status} />
        </div>

        <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{referral.notes}</p>

        {onView && (
          <button onClick={() => onView(referral)} className="mt-3 text-xs font-semibold text-primary hover:underline">
            View details →
          </button>
        )}
      </CardContent>
    </Card>
  )
}
