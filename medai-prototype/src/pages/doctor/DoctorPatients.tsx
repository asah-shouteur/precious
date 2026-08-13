import { useState } from 'react'
import { Search, Stethoscope, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/StateComponents'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useApp } from '@/store/AppProvider'
import { patients, doctors, facilities } from '@/data/entities'
import { medicalRecords, appointments, medications } from '@/data/clinical'
import { iotAlerts } from '@/data/activity'
import { MedicalTimeline } from '@/components/shared/MedicalTimeline'
import { cn } from '@/lib/utils'
import type { Patient } from '@/types'

const riskFilter = ['All', 'High', 'Moderate', 'Low'] as const

export default function DoctorPatients() {
  const { user } = useApp()
  const me = doctors.find((d) => d.id === user?.id) ?? doctors[0]
  const myPatients = patients.filter((p) => p.primaryPhysicianId === me.id)

  const [query, setQuery] = useState('')
  const [risk, setRisk] = useState<(typeof riskFilter)[number]>('All')
  const [selected, setSelected] = useState<Patient | null>(null)

  const list = myPatients.filter((p) => {
    const q = query.toLowerCase()
    const matchQuery = p.name.toLowerCase().includes(q) || p.chronicConditions.some((c) => c.toLowerCase().includes(q))
    const matchRisk = risk === 'All' || p.risk === risk
    return matchQuery && matchRisk
  })

  return (
    <div>
      <PageHeader title="Patient Management" subtitle={`${myPatients.length} patients assigned to ${me.name}`} />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search patients or conditions..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {riskFilter.map((r) => (
            <Badge key={r} variant={risk === r ? 'default' : 'outline'} className={cn('cursor-pointer', risk !== r && 'text-muted-foreground')} onClick={() => setRisk(r)}>{r}</Badge>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={UserRound} title="No patients match" description="Adjust your search or risk filter." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => {
            const alerts = iotAlerts.filter((a) => a.patientId === p.id && !a.acknowledged).length
            const nextApt = appointments.find((a) => a.patientId === p.id && (a.status === 'Scheduled' || a.status === 'Confirmed'))
            return (
              <Card key={p.id} className="card-hover cursor-pointer" onClick={() => setSelected(p)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-full text-sm font-bold" style={{ background: `${p.risk === 'High' ? '#EF4444' : '#5737A8'}18`, color: p.risk === 'High' ? '#EF4444' : '#5737A8' }}>
                        {p.name.split(' ').map((s) => s[0]).join('')}
                      </div>
                      <div>
                        <p className="font-display text-sm font-bold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.age} · {p.gender} · {p.bloodType}</p>
                      </div>
                    </div>
                    <StatusBadge tone={p.risk} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.chronicConditions.slice(0, 2).map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
                    {p.chronicConditions.length === 0 && <Badge variant="outline">No chronic conditions</Badge>}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-center text-xs">
                    <div><p className="font-bold">{p.vitals.heartRate}</p><p className="text-muted-foreground">HR</p></div>
                    <div><p className={cn('font-bold', p.vitals.spo2 < 93 && 'text-destructive')}>{p.vitals.spo2}%</p><p className="text-muted-foreground">SpO₂</p></div>
                    <div><p className="font-bold">{p.vitals.temperature.toFixed(1)}°</p><p className="text-muted-foreground">Temp</p></div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    {alerts > 0 ? <span className="font-semibold text-destructive">{alerts} active alert{alerts > 1 ? 's' : ''}</span> : <span className="text-success">No alerts</span>}
                    {nextApt ? <span className="text-muted-foreground">Next: {nextApt.date.slice(5)}</span> : <span className="text-muted-foreground">No upcoming</span>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <DialogContent className="max-w-3xl">
          {selected && <PatientDetail patient={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PatientDetail({ patient }: { patient: Patient }) {
  const p = patient
  const records = medicalRecords.filter((r) => r.patientId === p.id)
  const patientAppointments = appointments.filter((a) => a.patientId === p.id && (a.status === 'Scheduled' || a.status === 'Confirmed'))
  const meds = medications.filter((m) => m.status === 'Active' && records.some((r) => r.medication?.includes(m.name))).length || 1
  const physician = doctors.find((d) => d.id === p.primaryPhysicianId)
  const facility = facilities.find((f) => f.id === p.primaryFacilityId)

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{p.name.split(' ').map((s) => s[0]).join('')}</div>
          {p.name}
          <StatusBadge tone={p.risk} />
        </DialogTitle>
        <DialogDescription>{p.age} · {p.gender} · {p.bloodType} · {p.insurance}</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Primary physician</p>
          <p className="mt-1 text-sm font-semibold">{physician?.name ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{facility?.name ?? '—'}</p>
        </div>
        <div className="rounded-xl border p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Allergies</p>
          <div className="mt-1 flex flex-wrap gap-1.5">{p.allergies.length ? p.allergies.map((a) => <Badge key={a} variant="destructive">{a}</Badge>) : <span className="text-sm text-muted-foreground">None recorded</span>}</div>
        </div>
        <div className="rounded-xl border p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chronic conditions</p>
          <div className="mt-1 flex flex-wrap gap-1.5">{p.chronicConditions.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}</div>
        </div>
      </div>

      <div className="grid gap-3 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <p className="rounded-lg bg-muted p-3 text-xs">{p.email}</p>
          <p className="rounded-lg bg-muted p-3 text-xs">{p.phone}</p>
        </div>
      </div>

      <Separator />

      <div className="max-h-72 overflow-y-auto pr-1">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Medical history ({records.length})</p>
        {records.length ? <MedicalTimeline records={records} /> : <p className="text-sm text-muted-foreground">No records yet.</p>}
      </div>

      {patientAppointments.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Upcoming appointments</p>
          <div className="space-y-2">
            {patientAppointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border p-3 text-xs">
                <span className="font-medium">{a.date} · {a.time.replace(':00', '')} · {a.type}</span>
                <StatusBadge tone={a.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
