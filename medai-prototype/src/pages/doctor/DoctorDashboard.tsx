import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarCheck2, Clock, FileText, HeartPulse, Sparkles, Stethoscope, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/StateComponents'
import { useApp, useTelemetry } from '@/store/AppProvider'
import { queueItems, aiAssessments, iotAlerts, notifications } from '@/data/activity'
import { patients, doctors, facilities } from '@/data/entities'
import { appointments, referrals } from '@/data/clinical'
import { formatDate, cn } from '@/lib/utils'

export default function DoctorDashboard() {
  const { user } = useApp()
  const telemetry = useTelemetry()
  const me = doctors.find((d) => d.id === user?.id) ?? doctors[0]

  const myPatients = patients.filter((p) => p.primaryPhysicianId === me.id)
  const myAppointments = appointments.filter((a) => a.doctorId === me.id)
  const today = myAppointments.filter((a) => a.date === new Date().toISOString().slice(0, 10))
  const pendingReviews = aiAssessments.filter((a) => a.status === 'Pending Review')
  const myReferrals = referrals.filter((r) => r.fromDoctorId === me.id)
  const highRisk = myPatients.filter((p) => p.risk === 'High')
  const myAlerts = iotAlerts.filter((a) => myPatients.some((p) => p.id === a.patientId))
  const unreadNots = notifications.filter((n) => n.userId === me.id && !n.read)

  const waitlist = queueItems.filter((q) => q.patientId !== me.id || myPatients.some((p) => p.id === q.patientId))

  return (
    <div>
      <PageHeader title={`Welcome, ${me.name}`} subtitle={`${me.title} · ${me.specialty} · ${facilities.find((f) => f.id === me.facilityId)?.name ?? '—'}`}>
        <Button asChild variant="outline"><Link to="/doctor/ai-reviews"><Sparkles /> AI Review Queue {pendingReviews.length > 0 && `(${pendingReviews.length})`}</Link></Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Patients" value={myPatients.length} icon={<Users className="h-5 w-5" />} hint={`${highRisk.length} high risk`} trend={highRisk.length > 0 ? { value: `${highRisk.length} need attention`, positive: false } : undefined} />
        <StatCard label="Pending AI reviews" value={pendingReviews.length} icon={<Sparkles className="h-5 w-5" />} hint="Awaiting clinical confirmation" />
        <StatCard label="Appointments today" value={today.length} icon={<CalendarCheck2 className="h-5 w-5" />} hint={`${myAppointments.length} total upcoming`} />
        <StatCard label="Active alerts" value={myAlerts.filter((a) => !a.acknowledged).length} icon={<AlertTriangle className="h-5 w-5" />} hint={`${unreadNots.length} unread notifications`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* AI review queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">AI review queue</CardTitle>
            <Button asChild size="sm" variant="ghost"><Link to="/doctor/ai-reviews">View all →</Link></Button>
          </CardHeader>
          <CardContent>
            {pendingReviews.length === 0 ? (
              <EmptyState icon={Sparkles} title="Queue clear" description="No preliminary assessments awaiting review." />
            ) : (
              <div className="space-y-3">
                {pendingReviews.map((a) => {
                  const p = patients.find((pp) => pp.id === a.patientId)
                  const top = a.possibleConditions[0]
                  return (
                    <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl border p-3.5">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold" style={{ background: '#5737A818', color: '#5737A8' }}>
                        {p?.name.split(' ').map((s) => s[0]).join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{p?.name} <span className="text-xs font-normal text-muted-foreground">· {p?.age} · {p?.gender}</span></p>
                        <p className="truncate text-xs text-muted-foreground">{top?.name} · {top?.confidence}% confidence · {a.symptoms.slice(0, 2).join(', ')}</p>
                      </div>
                      <StatusBadge tone={a.urgency} />
                      <Button asChild size="sm"><Link to="/doctor/ai-reviews">Review</Link></Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's schedule */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Today's schedule</CardTitle>
            <Button asChild size="sm" variant="ghost"><Link to="/doctor/appointments">All →</Link></Button>
          </CardHeader>
          <CardContent>
            {today.length === 0 ? (
              <EmptyState icon={CalendarCheck2} title="No appointments today" description="Your schedule is clear." />
            ) : (
              <div className="space-y-3">
                {today.map((a) => {
                  const p = patients.find((pp) => pp.id === a.patientId)
                  return (
                    <div key={a.id} className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                        {a.time.replace(':00', '')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{a.type} · {a.reason}</p>
                      </div>
                      <StatusBadge tone={a.status} />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* High risk patients */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">High-risk patients</CardTitle>
            <Button asChild size="sm" variant="ghost"><Link to="/doctor/patients">Manage →</Link></Button>
          </CardHeader>
          <CardContent>
            {highRisk.length === 0 ? (
              <EmptyState icon={HeartPulse} title="No high-risk patients" description="Patients are clinically stable." />
            ) : (
              <div className="space-y-3">
                {highRisk.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border p-3.5">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold" style={{ background: '#EF444418', color: '#EF4444' }}>
                      {p.name.split(' ').map((s) => s[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.chronicConditions.join(', ') || 'No chronic conditions'}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold text-destructive">HR {p.vitals.heartRate}</p>
                      <p className={cn('font-bold', p.vitals.spo2 < 93 ? 'text-destructive' : 'text-muted-foreground')}>SpO₂ {p.vitals.spo2}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent referrals */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Referrals from you</CardTitle>
            <Button asChild size="sm" variant="ghost"><Link to="/doctor/referrals">All →</Link></Button>
          </CardHeader>
          <CardContent>
            {myReferrals.length === 0 ? (
              <EmptyState icon={FileText} title="No referrals" description="Referrals you create appear here." />
            ) : (
              <div className="space-y-3">
                {myReferrals.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border p-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{r.patientName} → {r.specialty}</p>
                      <p className="truncate text-xs text-muted-foreground">{r.toFacilityName} · {formatDate(r.requestedAt)}</p>
                    </div>
                    <StatusBadge tone={r.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">IoT alerts — your patients</CardTitle>
          <Button asChild size="sm" variant="ghost"><Link to="/doctor/iot">Monitor →</Link></Button>
        </CardHeader>
        <CardContent>
          {myAlerts.length === 0 ? (
            <EmptyState icon={HeartPulse} title="All vitals within range" description="No abnormal readings from your patients' devices." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {myAlerts.slice(0, 4).map((a) => {
                const p = patients.find((pp) => pp.id === a.patientId)
                return (
                  <div key={a.id} className="flex items-start gap-3 rounded-xl border p-3.5">
                    <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', a.severity === 'High' ? 'bg-destructive' : a.severity === 'Moderate' ? 'bg-warning' : 'bg-info')} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{p?.name} — {a.message}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.metric === 'spo2' ? 'SpO₂' : a.metric === 'heartRate' ? 'Heart rate' : 'Temperature'} {a.value}{a.metric === 'temperature' ? '°C' : a.metric === 'spo2' ? '%' : ' BPM'} · threshold {a.threshold}</p>
                    </div>
                    <StatusBadge tone={a.severity} />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
