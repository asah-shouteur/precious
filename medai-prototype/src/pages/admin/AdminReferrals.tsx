import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReferralCard } from '@/components/shared/ReferralCard'
import { EmptyState } from '@/components/shared/StateComponents'
import { useApp } from '@/store/AppProvider'
import { referrals } from '@/data/clinical'
import { cn } from '@/lib/utils'

export default function AdminReferrals() {
  const { user } = useApp()
  const [filter, setFilter] = useState<'All' | 'Requested' | 'Reviewed' | 'Accepted' | 'In Progress' | 'Completed'>('All')

  const list = referrals.filter((r) => filter === 'All' || r.status === filter)

  const avgWait = Math.round(referrals.reduce((s, r) => s + r.waitDays, 0) / referrals.length)

  return (
    <div>
      <PageHeader title="Referral Network" subtitle="Track referral flow across all facilities on the network." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total referrals</p><p className="mt-1 font-display text-2xl font-bold text-primary">{referrals.length}</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI suggested</p><p className="mt-1 font-display text-2xl font-bold text-primary">{referrals.filter((r) => r.aiSuggested).length} <span className="text-xs font-medium text-muted-foreground">/ {Math.round((referrals.filter((r) => r.aiSuggested).length / referrals.length) * 100)}%</span></p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Avg wait time</p><p className="mt-1 font-display text-2xl font-bold text-primary">{avgWait} <span className="text-xs font-medium text-muted-foreground">days</span></p></Card>
      </div>

      <div className="mt-5 mb-5 flex flex-wrap gap-2">
        {(['All', 'Requested', 'Reviewed', 'Accepted', 'In Progress', 'Completed'] as const).map((s) => (
          <Badge key={s} variant={filter === s ? 'default' : 'outline'} className={cn('cursor-pointer', filter !== s && 'text-muted-foreground')} onClick={() => setFilter(s)}>{s}</Badge>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No referrals" description="No referrals match this status." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <ReferralCard key={r.id} referral={r} match={r.aiSuggested} />
          ))}
        </div>
      )}
    </div>
  )
}
