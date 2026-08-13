import { CalendarCheck2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppointmentCard } from '@/components/shared/AppointmentCard'
import { EmptyState } from '@/components/shared/StateComponents'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { useApp } from '@/store/AppProvider'
import { appointments } from '@/data/clinical'
import { facilities, patients, doctors } from '@/data/entities'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default function FacilityAppointments() {
  const { user } = useApp()
  const facility = facilities.find((f) => f.id === user?.id) ?? facilities[0]
  const myAppointments = appointments.filter((a) => a.facilityId === facility.id)
  const [tab, setTab] = useState<'today' | 'upcoming' | 'all'>('today')

  const today = new Date().toISOString().slice(0, 10)
  const todayList = myAppointments.filter((a) => a.date === today && (a.status === 'Scheduled' || a.status === 'Confirmed'))
  const upcoming = myAppointments.filter((a) => a.date > today && (a.status === 'Scheduled' || a.status === 'Confirmed'))

  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? 'Patient'
  const doctorName = (id: string) => doctors.find((d) => d.id === id)?.name ?? 'Doctor'

  const list = tab === 'today' ? todayList : tab === 'upcoming' ? upcoming : myAppointments

  return (
    <div>
      <PageHeader title="Facility Appointments" subtitle={`Appointment book for ${facility.name}.`}>
        <Badge variant="info" className="gap-1"><CalendarCheck2 className="h-3.5 w-3.5" /> {myAppointments.length} total</Badge>
      </PageHeader>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'today' | 'upcoming' | 'all')}>
        <TabsList>
          <TabsTrigger value="today">Today ({todayList.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="all">All ({myAppointments.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {list.length === 0 ? (
        <div className="mt-5"><EmptyState icon={CalendarCheck2} title="No appointments" description="No appointments in this view." /></div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {list.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              doctorName={doctorName(a.doctorId)}
              doctorSpecialty={`for ${patientName(a.patientId)}`}
              facilityName={facility.name}
            />
          ))}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Status overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 text-center sm:grid-cols-4">
            {(['Confirmed', 'Scheduled', 'Completed', 'Cancelled'] as const).map((s) => {
              const n = myAppointments.filter((a) => a.status === s).length
              return (
                <div key={s} className="rounded-xl border p-4">
                  <p className="font-display text-2xl font-bold text-primary">{n}</p>
                  <div className="mt-1 flex justify-center"><StatusBadge tone={s} /></div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
