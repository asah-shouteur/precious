import { Link } from 'react-router-dom'
import { Activity, BedDouble, Building2, CalendarCheck2, ClipboardList, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Progress } from '@/components/ui/progress'
import { useApp } from '@/store/AppProvider'
import { facilities, departments, doctors, patients } from '@/data/entities'
import { referrals, appointments } from '@/data/clinical'
import { iotAlerts, notifications } from '@/data/activity'
import { cn } from '@/lib/utils'

export default function FacilityDashboard() {
  const { user } = useApp()
  const facility = facilities.find((f) => f.id === user?.id) ?? facilities[0]

  const occupancyPct = Math.round((facility.occupancy / facility.capacity) * 100)
  const incoming = referrals.filter((r) => r.toFacilityId === facility.id && r.status !== 'Completed')
  const urgent = incoming.filter((r) => r.urgency === 'Urgent')
  const myAppointments = appointments.filter((a) => a.facilityId === facility.id)
  const today = myAppointments.filter((a) => a.date === new Date().toISOString().slice(0, 10))
  const facilityPatients = patients.filter((p) => p.primaryFacilityId === facility.id)
  const myDoctors = doctors.filter((d) => d.facilityId === facility.id)
  const alerts = iotAlerts.filter((a) => facilityPatients.some((p) => p.id === a.patientId) && !a.acknowledged)
  const unread = notifications.filter((n) => n.userId === facility.id && !n.read)

  return (
    <div>
      <PageHeader title={facility.name} subtitle={`${facility.type} · ${facility.city} · ${facility.address}`}>
        <Button asChild variant="outline"><Link to="/facility/referrals"><ClipboardList /> Referral requests {incoming.length > 0 && `(${incoming.length})`}</Link></Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={facility.status === 'Operational' ? 'success' : facility.status === 'At Capacity' ? 'destructive' : 'warning'} dot>
          {facility.status}
        </Badge>
        {facility.accreditation.map((a) => <Badge key={a} variant="secondary">{a}</Badge>)}
        <Badge variant="outline">Rating {facility.rating} ★</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Occupancy" value={`${occupancyPct}%`} icon={<BedDouble className="h-5 w-5" />} hint={`${facility.occupancy}/${facility.capacity} beds`} />
        <StatCard label="Incoming referrals" value={incoming.length} icon={<ClipboardList className="h-5 w-5" />} hint={`${urgent.length} urgent`} trend={urgent.length > 0 ? { value: `${urgent.length} need priority`, positive: false } : undefined} />
        <StatCard label="Appointments today" value={today.length} icon={<CalendarCheck2 className="h-5 w-5" />} hint={`${myAppointments.length} total`} />
        <StatCard label="Active IoT alerts" value={alerts.length} icon={<Activity className="h-5 w-5" />} hint={`${unread} unread notifications`} />
      </div>

      <Card className="mt-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Bed capacity utilization</p>
              <p className="text-xs text-muted-foreground">{facility.occupancy} of {facility.capacity} beds occupied · {facility.capacity - facility.occupancy} available</p>
            </div>
            <span className={cn('font-display text-2xl font-bold', occupancyPct > 85 ? 'text-destructive' : occupancyPct > 70 ? 'text-warning' : 'text-success')}>{occupancyPct}%</span>
          </div>
          <Progress value={occupancyPct} className="mt-3 h-2.5" indicatorClassName={occupancyPct > 85 ? 'bg-destructive' : occupancyPct > 70 ? 'bg-warning' : 'bg-success'} />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Incoming referral requests</CardTitle>
            <Button asChild size="sm" variant="ghost"><Link to="/facility/referrals">All →</Link></Button>
          </CardHeader>
          <CardContent>
            {incoming.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No incoming referrals.</p>
            ) : (
              <div className="space-y-3">
                {incoming.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-xl border p-3.5">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {r.patientName.split(' ').map((s) => s[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.patientName} · {r.specialty}</p>
                      <p className="truncate text-xs text-muted-foreground">{r.condition} · {r.notes}</p>
                    </div>
                    <StatusBadge tone={r.urgency} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Departments</CardTitle>
            <Button asChild size="sm" variant="ghost"><Link to="/facility/departments">Manage →</Link></Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {facility.departments.slice(0, 5).map((d) => {
                const pct = Math.round((d.occupied / d.beds) * 100)
                return (
                  <div key={d.id}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{d.name} · {d.headDoctor}</span>
                      <span className={cn('font-semibold', pct > 85 ? 'text-destructive' : 'text-muted-foreground')}>{d.occupied}/{d.beds} beds</span>
                    </div>
                    <Progress value={pct} className="mt-1.5 h-1.5" indicatorClassName={pct > 85 ? 'bg-destructive' : 'bg-primary'} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Doctors on staff</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="font-display text-2xl font-bold">{myDoctors.length}</p>
                <p className="text-xs text-muted-foreground">Assigned to {facility.name}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              {myDoctors.slice(0, 3).map((d) => (
                <div key={d.id} className="flex justify-between rounded-lg border px-3 py-2">
                  <span className="font-medium">{d.name}</span>
                  <span className="text-muted-foreground">{d.specialty} · {d.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Services offered</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {facility.services.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Key facts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{facility.phone}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Emergency</span><span>{facility.emergency ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">IoT enabled</span><span>{facility.iotEnabled ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Specialties</span><span>{facility.specialties.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Patient panel</span><span>{facilityPatients.length}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
