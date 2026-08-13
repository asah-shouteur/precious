import { useState } from 'react'
import { CheckCircle2, Clock, ShieldAlert, ShieldCheck, Sparkles, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AIResultCard } from '@/components/shared/AIResultCard'
import { EmptyState } from '@/components/shared/StateComponents'
import { useApp } from '@/store/AppProvider'
import { aiAssessments } from '@/data/activity'
import { patients, doctors } from '@/data/entities'
import type { AIAssessmentResult } from '@/types'
import { cn, relativeTime } from '@/lib/utils'

const tabs = ['Pending Review', 'Reviewed', 'Dismissed'] as const
type ReviewStatus = (typeof tabs)[number]

export default function DoctorAIReviews() {
  const { user } = useApp()
  const me = doctors.find((d) => d.id === user?.id) ?? doctors[0]
  const [tab, setTab] = useState<ReviewStatus>('Pending Review')
  const [active, setActive] = useState<AIAssessmentResult | null>(null)
  const [decision, setDecision] = useState<AIAssessmentResult['status']>('Reviewed')
  const [finalDiagnosis, setFinalDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  const [reviewed, setReviewed] = useState<Record<string, AIAssessmentResult>>({})
  const [confirmOpen, setConfirmOpen] = useState(false)

  const getStatus = (a: AIAssessmentResult) => reviewed[a.id]?.status ?? a.status

  const list = aiAssessments.filter((a) => getStatus(a) === tab)

  const patientFor = (id: string) => patients.find((p) => p.id === id)

  const submitDecision = () => {
    if (!active) return
    const next = {
      ...active,
      status: decision,
      reviewedBy: me.name,
      reviewedAt: new Date().toISOString(),
    }
    setReviewed((prev) => ({ ...prev, [active.id]: next }))
    setActive(null)
    setConfirmOpen(false)
    setFinalDiagnosis('')
    setNotes('')
  }

  const countBy = (s: ReviewStatus) => aiAssessments.filter((a) => getStatus(a) === s).length

  return (
    <div>
      <PageHeader
        title="AI Review Queue"
        subtitle="Confirm, adjust or reject AI-ASSISTED PRELIMINARY ASSESSMENTS. Your clinical judgement always overrides the model."
      >
        <Badge variant="info" className="gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Clinician-in-the-loop</Badge>
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <Badge key={t} variant={tab === t ? 'default' : 'outline'} className={cn('cursor-pointer', tab !== t && 'text-muted-foreground')} onClick={() => setTab(t)}>
            {t} ({countBy(t)})
          </Badge>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Sparkles} title="Nothing here" description={`No assessments with status "${tab}".`} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((a) => {
            const p = patientFor(a.patientId)
            const top = a.possibleConditions[0]
            return (
              <Card key={a.id} className="card-hover cursor-pointer" onClick={() => { setActive(a); setDecision('Reviewed'); setConfirmOpen(true) }}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {p?.name.split(' ').map((s) => s[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{p?.name} <span className="text-xs font-normal text-muted-foreground">· {p?.age}</span></p>
                        <p className="text-xs text-muted-foreground">{relativeTime(a.createdAt)} · {a.symptoms.slice(0, 2).join(', ')}</p>
                      </div>
                    </div>
                    <StatusBadge tone={a.urgency} />
                  </div>

                  <div className="mt-3 rounded-xl bg-secondary/60 p-3.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">AI suggestion</p>
                    <p className="mt-0.5 font-display text-base font-bold">{top?.name}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-xs">
                      <span className="font-bold text-primary">{top?.confidence}% confidence</span>
                      <span className="text-muted-foreground">Vitals: HR {a.vitalsUsed.heartRate} · SpO₂ {a.vitalsUsed.spo2}% · {a.vitalsUsed.temperature}°C</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {a.reviewedBy ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Reviewed by {a.reviewedBy}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-warning">
                        <Clock className="h-3.5 w-3.5" /> Awaiting your review
                      </span>
                    )}
                    <Button size="sm">Review →</Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Review dialog */}
      <ReviewDialog
        open={confirmOpen && !!active}
        onOpenChange={(open) => { if (!open) { setConfirmOpen(false); setActive(null) } }}
        assessment={active}
        decision={decision}
        setDecision={setDecision}
        finalDiagnosis={finalDiagnosis}
        setFinalDiagnosis={setFinalDiagnosis}
        notes={notes}
        setNotes={setNotes}
        onSubmit={submitDecision}
      />
    </div>
  )
}

function ReviewDialog({
  open,
  onOpenChange,
  assessment,
  decision,
  setDecision,
  finalDiagnosis,
  setFinalDiagnosis,
  notes,
  setNotes,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  assessment: AIAssessmentResult | null
  decision: AIAssessmentResult['status']
  setDecision: (d: AIAssessmentResult['status']) => void
  finalDiagnosis: string
  setFinalDiagnosis: (s: string) => void
  notes: string
  setNotes: (s: string) => void
  onSubmit: () => void
}) {
  if (!assessment) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-warning" /> Clinical review — {assessment.id}
          </DialogTitle>
        </DialogHeader>

        <AIResultCard result={assessment} reviewMode />

        <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your decision</p>
          <div className="flex flex-wrap gap-2">
            <Button variant={decision === 'Reviewed' ? 'default' : 'outline'} onClick={() => setDecision('Reviewed')}>
              <CheckCircle2 /> Confirm as assessed
            </Button>
            <Button variant={decision === 'Dismissed' ? 'destructive' : 'outline'} onClick={() => setDecision('Dismissed')}>
              <XCircle /> Reject
            </Button>
          </div>
          {decision === 'Reviewed' && (
            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="finalDiagnosis">Final clinical diagnosis</Label>
                <Input id="finalDiagnosis" placeholder="e.g. Acute bronchitis (confirmed)" value={finalDiagnosis} onChange={(e) => setFinalDiagnosis(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reviewNotes">Clinical notes</Label>
                <Textarea id="reviewNotes" rows={3} placeholder="Justify your confirmation — findings, vitals context, treatment plan..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
          )}
          {decision === 'Dismissed' && (
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="dismissNotes">Reason for rejection</Label>
              <Textarea id="dismissNotes" rows={3} placeholder="Explain why the AI suggestion was rejected..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit} disabled={decision === 'Reviewed' && !finalDiagnosis.trim()}>
            {decision === 'Reviewed' ? 'Confirm assessment' : 'Reject assessment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
