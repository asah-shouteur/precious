import { Building2, FlaskConical, ScanLine, Sparkles, Stethoscope, UserRound } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { MedicalRecord, LabResult } from '@/types'
import { cn } from '@/lib/utils'

const typeIcons = {
  Consultation: Stethoscope,
  Laboratory: FlaskConical,
  Imaging: ScanLine,
  Prescription: Building2,
  'AI Preliminary': Sparkles,
}

export function MedicalTimeline({ records }: { records: MedicalRecord[] }) {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border">
      {sorted.map((record) => {
        const Icon = typeIcons[record.type]
        return (
          <div key={record.id} className="relative flex gap-4">
            <div
              className={cn(
                'z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2',
                record.type === 'AI Preliminary' ? 'border-warning/40 bg-warning/10 text-warning' : 'border-primary/30 bg-primary/10 text-primary'
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
            </div>
            <Card className={cn('flex-1 p-5', record.type === 'AI Preliminary' && 'border-warning/25 bg-warning/5')}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-bold">{record.type}</span>
                  <StatusBadge tone={record.severity} />
                  {!record.confirmed && <Badge variant="warning">AI-ASSISTED PRELIMINARY — NOT CONFIRMED</Badge>}
                </div>
                <span className="text-xs font-medium text-muted-foreground">{formatDate(record.date)}</span>
              </div>

              <div className="mt-3 space-y-2 text-sm">
                <Row label="Doctor"><span className="inline-flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5 text-muted-foreground" />{record.doctorName}</span></Row>
                <Row label="Facility">{record.facilityName}</Row>
                <Row label="Reason">{record.reason}</Row>
                <Row label="Findings">{record.findings}</Row>
                {record.ai && (
                  <Row label="AI condition" ai>
                    {record.ai.condition} — Confidence {record.ai.confidence}%
                    {record.ai.reviewedBy && <span className="text-muted-foreground"> · Reviewed by {record.ai.reviewedBy}</span>}
                  </Row>
                )}
                <Row label="Assessment">{record.assessment}</Row>
                <Row label="Diagnosis">{record.diagnosis}</Row>
                <Row label="Treatment">{record.treatment}</Row>
                {record.medication && <Row label="Medication">{record.medication}</Row>}
                <Row label="Follow-up">{record.followUp}</Row>
              </div>

              {record.labs && record.labs.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-lg border">
                  <div className="grid grid-cols-4 gap-2 bg-muted/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="col-span-2">Lab result</span><span>Value</span><span>Status</span>
                  </div>
                  {record.labs.map((lab: LabResult) => (
                    <div key={lab.name} className="grid grid-cols-4 items-center gap-2 border-t px-3 py-2 text-xs first:border-t-0">
                      <span className="col-span-2 font-medium">{lab.name}</span>
                      <span>{lab.value} <span className="text-muted-foreground">{lab.unit}</span></span>
                      <span>
                        <Badge variant={lab.status === 'Normal' ? 'success' : lab.status === 'High' ? 'warning' : 'destructive'}>{lab.status}</Badge>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )
      })}
    </div>
  )
}

function Row({ label, children, ai }: { label: string; children: React.ReactNode; ai?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[140px_1fr] sm:gap-3">
      <span className={cn('text-xs font-semibold uppercase tracking-wide', ai ? 'text-warning' : 'text-muted-foreground')}>{label}</span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  )
}
