import { useState } from 'react'
import { CheckCheck, ClipboardList, Loader2, Sparkles, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ReferralCard, ReferralWorkflow } from '@/components/shared/ReferralCard'
import { EmptyState } from '@/components/shared/StateComponents'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useApp } from '@/store/AppProvider'
import { api } from '@/services/api'
import { referrals } from '@/data/clinical'
import { facilities } from '@/data/entities'
import type { Referral } from '@/types'
import { cn } from '@/lib/utils'

export default function FacilityReferrals() {
  const { user, toast } = useApp()
  const facility = facilities.find((f) => f.id === user?.id) ?? facilities[0]
  const incoming = referrals.filter((r) => r.toFacilityId === facility.id)

  const [filter, setFilter] = useState<'All' | 'Requested' | 'Reviewed' | 'Accepted' | 'In Progress' | 'Completed' | 'Urgent'>('All')
  const [selected, setSelected] = useState<Referral | null>(null)
  const [busy, setBusy] = useState(false)
  const [local, setLocal] = useState<Record<string, Referral>>({})

  const getRef = (r: Referral) => local[r.id] ?? r
  const list = incoming
    .filter((r) => {
      const ref = getRef(r)
      if (filter === 'Urgent') return ref.urgency === 'Urgent'
      if (filter === 'All') return true
      return ref.status === filter
    })

  const moveTo = async (r: Referral, status: Referral['status']) => {
    setBusy(true)
    const updated = await api.updateReferral(r.id, { status })
    setLocal((prev) => ({ ...prev, [r.id]: updated }))
    setSelected((prev) => (prev && prev.id === r.id ? updated : prev))
    setBusy(false)
    toast({ title: `Referral ${status.toLowerCase()}`, description: `${r.patientName} · ${r.specialty}.`, variant: 'success' })
  }

  const counts: Record<string, number> = {
    All: incoming.length,
    Requested: incoming.filter((r) => getRef(r).status === 'Requested').length,
    Reviewed: incoming.filter((r) => getRef(r).status === 'Reviewed').length,
    Accepted: incoming.filter((r) => getRef(r).status === 'Accepted').length,
    'In Progress': incoming.filter((r) => getRef(r).status === 'In Progress').length,
    Completed: incoming.filter((r) => getRef(r).status === 'Completed').length,
    Urgent: incoming.filter((r) => r.urgency === 'Urgent').length,
  }

  return (
    <div>
      <PageHeader title="Referral Requests" subtitle={`Incoming specialist intake for ${facility.name}.`}>
        <Badge variant="info" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> AI-assisted matching</Badge>
      </PageHeader>

      <div className="mb-5 flex flex-wrap gap-2">
        {(['All', 'Requested', 'Reviewed', 'Accepted', 'In Progress', 'Completed', 'Urgent'] as const).map((s) => (
          <Badge key={s} variant={filter === s ? 'default' : 'outline'} className={cn('cursor-pointer', filter !== s && 'text-muted-foreground')} onClick={() => setFilter(s)}>
            {s} ({counts[s]})
          </Badge>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No referral requests" description="Incoming referrals will appear here for triage." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {list.map((r) => (
            <div key={r.id} className="relative">
              <ReferralCard referral={getRef(r)} match={r.aiSuggested} onView={setSelected} />
              {getRef(r).status === 'Requested' && (
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="success" onClick={() => moveTo(r, 'Accepted')} disabled={busy}>
                    {busy && <Loader2 className="animate-spin" />} Accept intake
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => moveTo(r, 'Reviewed')} disabled={busy}>
                    <X /> Mark reviewed
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{getRef(selected).patientName} · {getRef(selected).specialty}</DialogTitle>
                <DialogDescription>{getRef(selected).condition}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone={getRef(selected).urgency} />
                  <StatusBadge tone={getRef(selected).status} />
                  {getRef(selected).aiSuggested && <Badge variant="info" className="gap-1"><Sparkles className="h-3 w-3" /> AI match {getRef(selected).matchScore}%</Badge>}
                </div>

                <div className="rounded-xl border p-4">
                  <ReferralWorkflow status={getRef(selected).status} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-muted p-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Referred by</p>
                    <p className="mt-1 font-semibold">{getRef(selected).fromDoctorName}</p>
                    <p className="text-xs text-muted-foreground">{getRef(selected).fromFacilityName}</p>
                  </div>
                  <div className="rounded-xl bg-muted p-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Wait estimate</p>
                    <p className="mt-1 font-semibold">~{getRef(selected).waitDays} days</p>
                    <p className="text-xs text-muted-foreground">{getRef(selected).distanceKm} km from referring facility</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reason</p>
                  <p className="mt-1 text-sm">{getRef(selected).reason}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm text-muted-foreground">{getRef(selected).notes}</p>
                </div>

                {getRef(selected).recommendations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recommended services</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {getRef(selected).recommendations.map((rec) => <Badge key={rec} variant="secondary">{rec}</Badge>)}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  {getRef(selected).status === 'Requested' && (
                    <>
                      <Button variant="success" onClick={() => moveTo(selected, 'Accepted')} disabled={busy}>
                        {busy && <Loader2 className="animate-spin" />} <CheckCheck /> Accept intake
                      </Button>
                      <Button variant="outline" onClick={() => moveTo(selected, 'Reviewed')} disabled={busy}>Mark as reviewed</Button>
                    </>
                  )}
                  {(getRef(selected).status === 'Accepted' || getRef(selected).status === 'Reviewed') && (
                    <Button onClick={() => moveTo(selected, 'In Progress')} disabled={busy}>Start care</Button>
                  )}
                  {getRef(selected).status === 'In Progress' && (
                    <Button variant="success" onClick={() => moveTo(selected, 'Completed')} disabled={busy}>Complete</Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
