import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  HeartPulse,
  MessageSquare,
  Sparkles,
  Thermometer,
  Waves,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/PageHeader'
import { HealthMetricCard } from '@/components/shared/HealthMetricCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TrendChart } from '@/components/shared/charts'
import { DeviceCard } from '@/components/shared/DeviceCard'
import { AppointmentCard } from '@/components/shared/AppointmentCard'
import { ReferralCard } from '@/components/shared/ReferralCard'
import { useTelemetry } from '@/store/AppProvider'
import { useApp } from '@/store/AppProvider'
import { vitalsStatus } from '@/data/telemetry'
import { patients, doctors, devices } from '@/data/entities'
import { appointments, referrals, medicalRecords } from '@/data/clinical'
import { aiAssessments, notifications } from '@/data/activity'
import { formatDate } from '@/lib/utils'

export default function PatientDashboard() {
  const { user } = useApp()
  const telemetry = useTelemetry()
  const patient = patients.find((p) => p.id === user?.id) ?? patients[0]
  const myAppointments = appointments.filter((a) => a.patientId === patient.id).slice(0, 2)
  const myReferrals = referrals.filter((r) => r.patientId === patient.id)
  const myAlerts = notifications.filter((n) => n.userId === patient.id && !n.read)
  const lastRecord = medicalRecords.find((r) => r.patientId === patient.id)
  const pendingAI = aiAssessments.find((a) => a.patientId === patient.id && a.status === 'Pending Review')
  const connectedCount = telemetry.devices.filter((d) => d.status === 'Connected').length

  const primaryDoctor = doctors.find((d) => d.id === patient.primaryPhysicianId)

  const healthStatus: 'Normal' | 'Borderline' | 'Abnormal' =
    patient.risk === 'High' ? 'Abnormal' : patient.risk === 'Moderate' ? 'Borderline' : 'Normal'

  const metrics = [
    { label: 'Heart Rate', value: telemetry.vitals.heartRate, unit: 'BPM', status: vitalsStatus(telemetry.vitals, 'heartRate'), icon: <HeartPulse /> },
    { label: 'Oxygen Saturation', value: telemetry.vitals.spo2, unit: '%', status: vitalsStatus(telemetry.vitals, 'spo2'), icon: <Waves /> },
    { label: 'Temperature', value: telemetry.vitals.temperature.toFixed(1), unit: '°C', status: vitalsStatus(telemetry.vitals, 'temperature'), icon: <Thermometer /> },
    { label: 'Health Score', value: patient.healthScore, unit: '/100', status: healthStatus, icon: <Activity /> },
  ]

  const series = (metric: 'heartRate' | 'spo2' | 'temperature') => {
    const now = Date.now()
    return Array.from({ length: 24 }).map((_, i) => ({
      t: new Date(now - (24 - i) * 60 * 60 * 1000).toISOString(),
      [metric]: Math.round((metric === 'temperature' ? 36.7 + Math.sin(i / 4) * 0.3 : metric === 'spo2' ? 98 - Math.sin(i / 5) : 74 + Math.sin(i / 3) * 5) * 10) / 10,
    }))
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${patient.name.split(' ')[0]}`}
        subtitle={`Here is your health snapshot for today. ${connectedCount} of 3 IoT devices streaming.`}
      >
        <Button variant="outline" asChild><Link to="/patient/iot"><Activity /> View live monitoring</Link></Button>
        <Button asChild><Link to="/patient/assessments"><Sparkles /> Run AI Assessment</Link></Button>
      </PageHeader>

      {/* Alerts */}
      {myAlerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {myAlerts.slice(0, 2).map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-xl border p-4 text-sm" style={{ borderColor: a.severity === 'High' ? 'hsl(0 72% 70%)' : a.severity === 'Moderate' ? 'hsl(32 95% 70%)' : 'hsl(262 63% 70%)', background: a.severity === 'High' ? 'hsl(0 72% 97%)' : a.severity === 'Moderate' ? 'hsl(32 95% 97%)' : 'hsl(262 63% 97%)' }}>
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${a.severity === 'High' ? 'bg-destructive' : a.severity === 'Moderate' ? 'bg-warning' : 'bg-primary'}`} />
              <div className="flex-1">
                <p className="font-semibold">{a.title}</p>
                <p className="text-muted-foreground">{a.body}</p>
              </div>
              <Badge variant={a.severity === 'High' ? 'destructive' : a.severity === 'Moderate' ? 'warning' : 'secondary'}>{a.category}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Live vitals */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <HealthMetricCard key={m.label} label={m.label} value={m.value} unit={m.unit} status={m.status} icon={m.icon} live={m.label !== 'Health Score'} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Trends */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Vitals trend · 24 hours</CardTitle>
            <div className="flex gap-1">
              {(['heartRate', 'spo2', 'temperature'] as const).map((m) => (
                <span key={m} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">{m === 'heartRate' ? 'HR' : m === 'spo2' ? 'SpO₂' : 'Temp'}</span>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(['heartRate', 'spo2', 'temperature'] as const).map((m, idx) => (
                <div key={m} className="rounded-lg border p-3">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">
                    {m === 'heartRate' ? 'Heart rate' : m === 'spo2' ? 'Oxygen saturation' : 'Temperature'}
                  </p>
                  <TrendChart data={series(m)} dataKey={m} height={92} color={['#5737A8', '#22A55A', '#F59E0B'][idx]} unit={m === 'heartRate' ? ' BPM' : m === 'spo2' ? '%' : '°C'} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* AI summary */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" /> AI Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingAI ? (
                <div className="rounded-xl bg-warning/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-warning">AI-ASSISTED PRELIMINARY ASSESSMENT</p>
                  <p className="mt-1.5 text-sm font-semibold">{pendingAI.possibleConditions[0].name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Confidence {pendingAI.confidence}% · Urgency: {pendingAI.urgency}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Awaiting review by your care team.</p>
                  <Button size="sm" variant="outline" className="mt-3 w-full" asChild><Link to="/patient/assessments">View details</Link></Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">Describe your symptoms and MEDAI will generate a preliminary, clinician-reviewed triage.</p>
                  <Button size="sm" className="mt-3 w-full" asChild><Link to="/patient/assessments">Start assessment <ArrowRight /></Link></Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Care team */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your care team</CardTitle>
            </CardHeader>
            <CardContent>
              {primaryDoctor && (
                <div className="flex items-center gap-3 rounded-xl border p-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full" style={{ background: `${primaryDoctor.photoColor}18`, color: primaryDoctor.photoColor }}>
                    {primaryDoctor.name.replace('Dr. ', '').split(' ').map((s) => s[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{primaryDoctor.name}</p>
                    <p className="text-xs text-muted-foreground">{primaryDoctor.specialty}</p>
                  </div>
                  <StatusBadge tone={primaryDoctor.status} />
                </div>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <Link to="/patient/messages" className="hover:text-primary">Open secure inbox</Link>
              </div>
            </CardContent>
          </Card>

          {/* Devices */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">IoT devices</CardTitle>
              <Link to="/patient/iot" className="text-xs font-semibold text-primary hover:underline">Manage</Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {devices.filter((d) => d.ownerId === patient.id).map((d) => (
                <DeviceCard key={d.id} device={d} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Appointments + Records + Referrals */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base"><CalendarCheck2 className="mr-1 inline h-4 w-4 text-primary" /> Upcoming appointments</CardTitle>
            <Link to="/patient/appointments" className="text-xs font-semibold text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {myAppointments.map((a) => (
                <AppointmentCard key={a.id} appointment={a} doctorName={doctors.find((d) => d.id === a.doctorId)?.name} doctorSpecialty={doctors.find((d) => d.id === a.doctorId)?.specialty} facilityName="St. Jude Medical Center" />
              ))}
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Latest clinical record</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{lastRecord ? `${formatDate(lastRecord.date)} · ${lastRecord.diagnosis}` : 'No records yet'}</p>
                <Link to="/patient/records" className="mt-1.5 inline-block text-xs font-semibold text-primary hover:underline">Open medical records →</Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base"><ClipboardList className="mr-1 inline h-4 w-4 text-primary" /> Referrals</CardTitle>
            <Link to="/patient/referrals" className="text-xs font-semibold text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {myReferrals.slice(0, 2).map((r) => (
              <ReferralCard key={r.id} referral={r} match={r.aiSuggested} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
