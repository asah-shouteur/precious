import { useState } from 'react'
import { FileText, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MedicalTimeline } from '@/components/shared/MedicalTimeline'
import { EmptyState } from '@/components/shared/StateComponents'
import { useApp } from '@/store/AppProvider'
import { medicalRecords } from '@/data/clinical'
import { patients, doctors } from '@/data/entities'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { MedicalRecord } from '@/types'
import { cn } from '@/lib/utils'

export default function DoctorRecords() {
  const { user } = useApp()
  const me = doctors.find((d) => d.id === user?.id) ?? doctors[0]
  const myPatients = patients.filter((p) => p.primaryPhysicianId === me.id)
  const myRecords = medicalRecords.filter((r) => myPatients.some((p) => p.id === r.patientId))

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'All' | 'Confirmed' | 'AI Preliminary'>('All')
  const [selected, setSelected] = useState<MedicalRecord | null>(null)

  const list = myRecords.filter((r) => {
    const p = patients.find((pp) => pp.id === r.patientId)
    const matchQ = (p?.name.toLowerCase().includes(query.toLowerCase()) ?? false) || r.diagnosis.toLowerCase().includes(query.toLowerCase())
    const matchF = filter === 'All' || (filter === 'Confirmed' ? r.confirmed : r.type === 'AI Preliminary')
    return matchQ && matchF
  })

  return (
    <div>
      <PageHeader title="Medical Records" subtitle={`Clinical records across ${myPatients.length} assigned patients.`} />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search patient or diagnosis..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['All', 'Confirmed', 'AI Preliminary'] as const).map((f) => (
            <Badge key={f} variant={filter === f ? 'default' : 'outline'} className={cn('cursor-pointer', filter !== f && 'text-muted-foreground')} onClick={() => setFilter(f)}>{f}</Badge>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={FileText} title="No records found" description="No clinical records match your search." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => {
            const p = patients.find((pp) => pp.id === r.patientId)
            return (
              <Card key={r.id} className="card-hover cursor-pointer" onClick={() => setSelected(r)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{p?.name}</p>
                      <p className="text-xs text-muted-foreground">{r.date} · {r.type}</p>
                    </div>
                    {r.type === 'AI Preliminary' ? <Badge variant="info">AI</Badge> : <Badge variant={r.confirmed ? 'success' : 'secondary'}>{r.confirmed ? 'Confirmed' : 'Draft'}</Badge>}
                  </div>
                  <p className="mt-3 text-xs font-semibold text-primary">{r.diagnosis}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.assessment}</p>
                  <div className="mt-3 border-t pt-2.5 text-[11px] text-muted-foreground">
                    {r.ai ? <>AI confidence {r.ai.confidence}% · Reviewed by {r.ai.reviewedBy}</> : r.doctorName}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <RecordDetailDialog record={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function RecordDetailDialog({ record, onClose }: { record: MedicalRecord | null; onClose: () => void }) {
  const [open, setOpen] = useState(!!record)
  const p = record ? patients.find((pp) => pp.id === record.patientId) : undefined

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) onClose() }}>
      {record && (
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{p?.name}</DialogTitle>
            <DialogDescription>{record.date} · {record.type} · {record.facilityName}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reason</p>
              <p className="mt-1">{record.reason}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Findings</p>
              <p className="mt-1">{record.findings}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assessment</p>
              <p className="mt-1">{record.assessment}</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Diagnosis</p>
              <p className="mt-1 font-display text-base font-bold">{record.diagnosis}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Treatment</p>
              <p className="mt-1">{record.treatment}</p>
            </div>
            {record.medication && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Medication</p>
                <p className="mt-1">{record.medication}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Follow-up</p>
              <p className="mt-1">{record.followUp}</p>
            </div>
            {record.labs && record.labs.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lab results</p>
                <div className="overflow-hidden rounded-xl border">
                  {record.labs.map((l, i) => (
                    <div key={l.name} className={cn('flex items-center justify-between px-4 py-2.5 text-xs', i % 2 === 0 && 'bg-muted/50')}>
                      <span className="font-medium">{l.name}</span>
                      <span className="flex items-center gap-3">
                        <span>{l.value} {l.unit}</span>
                        <span className="text-muted-foreground">ref {l.reference}</span>
                        <Badge variant={l.status === 'Normal' ? 'success' : 'destructive'}>{l.status}</Badge>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}
