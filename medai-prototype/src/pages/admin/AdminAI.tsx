import { useState } from 'react'
import { CheckCircle2, Clock, Sparkles, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AIResultCard } from '@/components/shared/AIResultCard'
import { EmptyState } from '@/components/shared/StateComponents'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useApp } from '@/store/AppProvider'
import { aiAssessments, auditLogs } from '@/data/activity'
import { patients } from '@/data/entities'
import { cn, relativeTime } from '@/lib/utils'
import type { AIAssessmentResult } from '@/types'

export default function AdminAI() {
  const { user } = useApp()
  const [selected, setSelected] = useState<AIAssessmentResult | null>(null)
  const [filter, setFilter] = useState<'All' | 'Pending Review' | 'Reviewed' | 'Dismissed'>('All')

  const list = aiAssessments.filter((a) => filter === 'All' || a.status === filter)

  const avgConfidence = Math.round(aiAssessments.reduce((s, a) => s + a.confidence, 0) / aiAssessments.length)
  const pending = aiAssessments.filter((a) => a.status === 'Pending Review').length

  return (
    <div>
      <PageHeader title="AI Inference Monitoring" subtitle="Supervise the diagnostic engine — every model output is tracked, logged and clinician-reviewable.">
        <Badge variant="info" className="gap-1"><Sparkles className="h-3.5 w-3.5" /> Clinician-in-the-loop</Badge>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total inferences</p><p className="mt-1 font-display text-2xl font-bold text-primary">{aiAssessments.length}</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Average confidence</p><p className="mt-1 font-display text-2xl font-bold text-primary">{avgConfidence}%</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pending review</p><p className="mt-1 font-display text-2xl font-bold text-warning">{pending}</p></Card>
      </div>

      <div className="mt-5 mb-5 flex flex-wrap gap-2">
        {(['All', 'Pending Review', 'Reviewed', 'Dismissed'] as const).map((s) => (
          <Badge key={s} variant={filter === s ? 'default' : 'outline'} className={cn('cursor-pointer', filter !== s && 'text-muted-foreground')} onClick={() => setFilter(s)}>{s}</Badge>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Sparkles} title="No inferences" description="No assessments with this status." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {list.map((a) => {
            const p = patients.find((pp) => pp.id === a.patientId)
            return (
              <Card key={a.id} className="card-hover cursor-pointer" onClick={() => setSelected(a)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{p?.name}</p>
                      <p className="text-xs text-muted-foreground">{relativeTime(a.createdAt)} · {a.symptoms.join(', ')}</p>
                    </div>
                    <StatusBadge tone={a.status === 'Pending Review' ? 'Moderate' : a.status === 'Reviewed' ? 'Low' : 'Low'} />
                  </div>
                  <div className="mt-3 rounded-xl bg-secondary/60 p-3.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Top suggestion</p>
                    <p className="mt-0.5 font-display text-base font-bold">{a.possibleConditions[0]?.name}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="font-bold text-primary">{a.confidence}% confidence</span>
                      <span className="text-muted-foreground">urgency {a.urgency}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', a.status === 'Reviewed' ? 'text-success' : a.status === 'Dismissed' ? 'text-destructive' : 'text-warning')}>
                      {a.status === 'Reviewed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : a.status === 'Dismissed' ? <XCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      {a.status}{a.reviewedBy ? ` by ${a.reviewedBy}` : ''}
                    </span>
                    <Button size="sm" variant="outline">Inspect</Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Engine health</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Uptime (30 days)</span><span className="font-bold">99.98%</span></div>
              <Progress value={99.98} className="mt-1.5" />
            </div>
            <div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Review completion rate</span><span className="font-bold">{aiAssessments.filter((a) => a.status !== 'Pending Review').length ? Math.round((aiAssessments.filter((a) => a.status === 'Reviewed').length / aiAssessments.filter((a) => a.status !== 'Pending Review').length) * 100) : 0}%</span></div>
              <Progress value={60} className="mt-1.5" />
            </div>
            <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              Last audit: {auditLogs.filter((l) => l.module === 'AI')[0]?.details ?? 'No AI audit trail recorded.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Inference {selected.id}</DialogTitle>
                <DialogDescription>{selected.status} · {relativeTime(selected.createdAt)}</DialogDescription>
              </DialogHeader>
              <AIResultCard result={selected} reviewMode />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
