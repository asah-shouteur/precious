import { useState } from 'react'
import { ClipboardList, Loader2, Plus, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ReferralCard, ReferralWorkflow } from '@/components/shared/ReferralCard'
import { EmptyState } from '@/components/shared/StateComponents'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useApp } from '@/store/AppProvider'
import { api } from '@/services/api'
import { referrals } from '@/data/clinical'
import { patients, doctors, facilities } from '@/data/entities'
import type { Referral } from '@/types'
import { cn } from '@/lib/utils'

export default function DoctorReferrals() {
  const { user, toast } = useApp()
  const me = doctors.find((d) => d.id === user?.id) ?? doctors[0]
  const myReferrals = referrals.filter((r) => r.fromDoctorId === me.id)

  const [filter, setFilter] = useState<'All' | 'Requested' | 'Reviewed' | 'Accepted' | 'In Progress' | 'Completed'>('All')
  const [createOpen, setCreateOpen] = useState(false)
  const [viewing, setViewing] = useState<Referral | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    patientId: patients.find((p) => p.primaryPhysicianId === me.id)?.id ?? '',
    specialty: '',
    condition: '',
    urgency: 'Moderate' as Referral['urgency'],
    reason: '',
    notes: '',
    toFacilityId: facilities[0].id,
  })

  const list = myReferrals.filter((r) => filter === 'All' || r.status === filter)

  const submit = async () => {
    if (!form.patientId || !form.specialty || !form.condition || !form.reason) {
      toast({ title: 'Missing details', description: 'Patient, specialty, condition and reason are required.', variant: 'warning' })
      return
    }
    setSaving(true)
    const patient = patients.find((p) => p.id === form.patientId)!
    const facility = facilities.find((f) => f.id === form.toFacilityId)!
    const ref = await api.createReferral({
      patientId: patient.id,
      patientName: patient.name,
      fromDoctorId: me.id,
      fromDoctorName: me.name,
      fromFacilityId: me.facilityId,
      fromFacilityName: facilities.find((f) => f.id === me.facilityId)?.name ?? '',
      toFacilityId: facility.id,
      toFacilityName: facility.name,
      specialty: form.specialty,
      condition: form.condition,
      urgency: form.urgency,
      reason: form.reason,
      notes: form.notes || 'No additional notes.',
      recommendations: [],
      aiSuggested: false,
      matchScore: Math.round(80 + Math.random() * 15),
      distanceKm: facility.distanceKm,
      waitDays: Math.max(1, Math.round(facility.capacity - facility.occupancy)),
    })
    setSaving(false)
    setCreateOpen(false)
    toast({ title: 'Referral created', description: `${ref.patientName} → ${ref.toFacilityName} (${ref.specialty}).`, variant: 'success' })
  }

  return (
    <div>
      <PageHeader title="Referrals" subtitle="Create intelligent referrals and track specialist intake status.">
        <Button onClick={() => setCreateOpen(true)}><Plus /> New referral</Button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap gap-2">
        {(['All', 'Requested', 'Reviewed', 'Accepted', 'In Progress', 'Completed'] as const).map((s) => (
          <Badge key={s} variant={filter === s ? 'default' : 'outline'} className={cn('cursor-pointer', filter !== s && 'text-muted-foreground')} onClick={() => setFilter(s)}>
            {s} ({s === 'All' ? myReferrals.length : myReferrals.filter((r) => r.status === s).length})
          </Badge>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No referrals" description="Referrals you create will appear here." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {list.map((r) => (
            <ReferralCard key={r.id} referral={r} match={r.aiSuggested} onView={setViewing} />
          ))}
        </div>
      )}

      {/* Create referral */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus /> New referral</DialogTitle>
            <DialogDescription>The MEDAI engine will suggest matching facilities when submitted.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Patient</Label>
              <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
                <option value="">Select patient...</option>
                {patients.filter((p) => p.primaryPhysicianId === me.id).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Specialty</Label>
              <Input placeholder="e.g. Cardiology, Pulmonology..." value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Condition</Label>
              <Input placeholder="e.g. Chronic bronchitis / dyspnea" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Urgency</Label>
                <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value as Referral['urgency'] })}>
                  <option value="Routine">Routine</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Destination facility</Label>
                <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" value={form.toFacilityId} onChange={(e) => setForm({ ...form, toFacilityId: e.target.value })}>
                  {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Textarea rows={2} placeholder="Clinical justification for the referral..." value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea rows={2} placeholder="Additional context..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={saving}>
              {saving && <Loader2 className="animate-spin" />} {saving ? 'Creating...' : 'Create referral'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View detail */}
      <Dialog open={!!viewing} onOpenChange={(o) => { if (!o) setViewing(null) }}>
        <DialogContent className="max-w-2xl">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> {viewing.specialty}
                </DialogTitle>
                <DialogDescription>{viewing.patientName} · {viewing.condition}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone={viewing.urgency} />
                  <StatusBadge tone={viewing.status} />
                  {viewing.aiSuggested && <Badge variant="info" className="gap-1"><Sparkles className="h-3 w-3" /> AI match {viewing.matchScore}%</Badge>}
                </div>
                <div className="rounded-xl border p-4"><ReferralWorkflow status={viewing.status} /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-muted p-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">From</p>
                    <p className="mt-1 font-semibold">{viewing.fromDoctorName}</p>
                    <p className="text-xs text-muted-foreground">{viewing.fromFacilityName}</p>
                  </div>
                  <div className="rounded-xl bg-muted p-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">To</p>
                    <p className="mt-1 font-semibold">{viewing.toFacilityName}</p>
                    <p className="text-xs text-muted-foreground">{viewing.distanceKm} km · ~{viewing.waitDays} day wait</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reason</p>
                  <p className="mt-1 text-sm">{viewing.reason}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm text-muted-foreground">{viewing.notes}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
