import { useState } from 'react'
import { ClipboardList, MapPin, Sparkles, Timer } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ReferralCard, ReferralWorkflow } from '@/components/shared/ReferralCard'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/StateComponents'
import { useApp } from '@/store/AppProvider'
import { referrals } from '@/data/clinical'
import { patients, facilities } from '@/data/entities'
import type { Referral } from '@/types'

export default function PatientReferrals() {
  const { user, toast } = useApp()
  const patient = patients.find((p) => p.id === user?.id) ?? patients[0]
  const myReferrals = referrals.filter((r) => r.patientId === patient.id)
  const [selected, setSelected] = useState<Referral | null>(null)

  const accepted = myReferrals.filter((r) => r.status === 'Accepted')
  const inProgress = myReferrals.filter((r) => r.status === 'In Progress' || r.status === 'Reviewed' || r.status === 'Requested')
  const completed = myReferrals.filter((r) => r.status === 'Completed')

  return (
    <div>
      <PageHeader
        title="Intelligent Referrals"
        subtitle="Track facility recommendations and specialist intake statuses — from request to completion."
      >
        <Button variant="outline" onClick={() => toast({ title: 'Referral guidance', description: 'Ask your doctor to create a referral if you need specialist care.', variant: 'info' })}>
          <Sparkles /> How referrals work
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active referrals</p><p className="mt-1 font-display text-2xl font-bold text-primary">{inProgress.length}</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Accepted for intake</p><p className="mt-1 font-display text-2xl font-bold text-info">{accepted.length}</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Completed</p><p className="mt-1 font-display text-2xl font-bold text-success">{completed.length}</p></Card>
      </div>

      {myReferrals.length === 0 ? (
        <div className="mt-6"><EmptyState icon={ClipboardList} title="No referrals yet" description="Referrals your doctor creates will appear here with live status tracking." /></div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {myReferrals.map((r) => (
            <ReferralCard key={r.id} referral={r} match={r.aiSuggested} onView={setSelected} />
          ))}
        </div>
      )}

      {/* Referral detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> {selected.specialty}
                </DialogTitle>
                <DialogDescription>{selected.condition}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={selected.urgency} />
                  <StatusBadge tone={selected.status} />
                  {selected.aiSuggested && <Badge variant="info" className="gap-1"><Sparkles className="h-3 w-3" /> AI suggested · Match {selected.matchScore}%</Badge>}
                </div>

                <div className="rounded-xl border p-4">
                  <ReferralWorkflow status={selected.status} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-muted p-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Destination facility</p>
                    <p className="mt-1 font-semibold">{selected.toFacilityName}</p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {selected.distanceKm} km</p>
                  </div>
                  <div className="rounded-xl bg-muted p-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estimated wait</p>
                    <p className="mt-1 inline-flex items-center gap-1 font-semibold"><Timer className="h-4 w-4 text-primary" /> {selected.waitDays} day{selected.waitDays > 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reason</p>
                  <p className="mt-1 text-sm">{selected.reason}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm text-muted-foreground">{selected.notes}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recommended services</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selected.recommendations.map((rec) => <Badge key={rec} variant="secondary">{rec}</Badge>)}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
