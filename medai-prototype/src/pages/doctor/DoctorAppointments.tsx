import { useState } from 'react'
import { CalendarCheck2, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppointmentCard } from '@/components/shared/AppointmentCard'
import { EmptyState } from '@/components/shared/StateComponents'
import { useApp } from '@/store/AppProvider'
import { appointments } from '@/data/clinical'
import { patients, doctors, facilities } from '@/data/entities'
import { api } from '@/services/api'
import { formatDate } from '@/lib/utils'
import type { Appointment } from '@/types'

export default function DoctorAppointments() {
  const { user, toast } = useApp()
  const me = doctors.find((d) => d.id === user?.id) ?? doctors[0]
  const myAppointments = appointments.filter((a) => a.doctorId === me.id)

  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Scheduled' | 'Confirmed' | 'Completed'>('All')

  const upcoming = myAppointments.filter((a) => a.status === 'Scheduled' || a.status === 'Confirmed')
  const past = myAppointments.filter((a) => a.status === 'Completed' || a.status === 'Cancelled')

  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? 'Patient'
  const facilityName = (id: string) => facilities.find((f) => f.id === id)?.name ?? ''

  const list = (tab === 'upcoming' ? upcoming : past).filter((a) => statusFilter === 'All' || a.status === statusFilter)

  const complete = async (a: Appointment) => {
    await api.updateAppointment(a.id, { status: 'Completed' })
    toast({ title: 'Appointment completed', description: `${patientName(a.patientId)} marked as seen.`, variant: 'success' })
  }

  const cancel = async (a: Appointment) => {
    await api.updateAppointment(a.id, { status: 'Cancelled' })
    toast({ title: 'Appointment cancelled', description: 'Patient notified.', variant: 'info' })
  }

  return (
    <div>
      <PageHeader title="Appointments" subtitle={`Your clinical schedule — ${upcoming.length} upcoming, ${past.length} past.`}>
        <Button variant="outline" onClick={() => toast({ title: 'Calendar synced', description: 'All appointments reflect your clinical schedule.', variant: 'success' })}>
          <CalendarCheck2 /> Sync calendar
        </Button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'upcoming' | 'past')}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          {(['All', 'Scheduled', 'Confirmed', 'Completed'] as const).map((s) => (
            <Button key={s} size="sm" variant={statusFilter === s ? 'default' : 'outline'} onClick={() => setStatusFilter(s)}>{s}</Button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Clock} title="No appointments" description="No appointments match this view." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              doctorName={`${a.type} — ${patientName(a.patientId)}`}
              doctorSpecialty={`Patient ${patientName(a.patientId)}`}
              facilityName={facilityName(a.facilityId)}
              onCancel={tab === 'upcoming' ? cancel : undefined}
            />
          ))}
        </div>
      )}

      {tab === 'upcoming' && upcoming.length > 0 && (
        <div className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {upcoming.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border p-3">
                    <div className="text-xs">
                      <p className="font-semibold">{patientName(a.patientId)}</p>
                      <p className="text-muted-foreground">{a.date} · {a.time.replace(':00', '')}</p>
                    </div>
                    <Button size="sm" variant="success" onClick={() => complete(a)}><CheckCircle2 /> Mark seen</Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => cancel(a)}><XCircle /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
