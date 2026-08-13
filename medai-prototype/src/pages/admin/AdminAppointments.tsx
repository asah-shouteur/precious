import { useState } from 'react'
import { CalendarCheck2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/StateComponents'
import { useApp } from '@/store/AppProvider'
import { appointments } from '@/data/clinical'
import { patients, doctors, facilities } from '@/data/entities'
import { cn } from '@/lib/utils'

const statusFilter = ['All', 'Confirmed', 'Scheduled', 'Completed', 'Cancelled'] as const

export default function AdminAppointments() {
  const { user } = useApp()
  const [status, setStatus] = useState<(typeof statusFilter)[number]>('All')

  const list = appointments.filter((a) => status === 'All' || a.status === status)

  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? 'Patient'
  const doctorName = (id: string) => doctors.find((d) => d.id === id)?.name ?? 'Doctor'
  const facilityName = (id: string) => facilities.find((f) => f.id === id)?.name ?? ''

  return (
    <div>
      <PageHeader title="Appointments" subtitle="Platform-wide appointment registry." />

      <div className="mb-5 flex flex-wrap gap-2">
        {statusFilter.map((s) => (
          <Badge key={s} variant={status === s ? 'default' : 'outline'} className={cn('cursor-pointer', status !== s && 'text-muted-foreground')} onClick={() => setStatus(s)}>{s}</Badge>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={CalendarCheck2} title="No appointments" description="No appointments match this status." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">Patient</th>
                    <th className="px-5 py-3">Doctor</th>
                    <th className="px-5 py-3">Facility</th>
                    <th className="px-5 py-3">Date & time</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Reason</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((a) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3 font-semibold">{patientName(a.patientId)}</td>
                      <td className="px-5 py-3 text-xs">{doctorName(a.doctorId)}</td>
                      <td className="px-5 py-3 text-xs">{facilityName(a.facilityId)}</td>
                      <td className="px-5 py-3 text-xs">{a.date} · {a.time.replace(':00', '')}</td>
                      <td className="px-5 py-3"><Badge variant="secondary">{a.type}</Badge></td>
                      <td className="max-w-[220px] px-5 py-3 text-xs text-muted-foreground">{a.reason}</td>
                      <td className="px-5 py-3"><StatusBadge tone={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
