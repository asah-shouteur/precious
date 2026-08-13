import { Link } from 'react-router-dom'
import { Activity, BedDouble, Building2, ClipboardList, Cpu, Sparkles, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { BarsChart, DonutChart } from '@/components/shared/charts'
import { useApp } from '@/store/AppProvider'
import { patients, doctors, facilities, devices } from '@/data/entities'
import { appointments, referrals } from '@/data/clinical'
import { aiAssessments, iotAlerts, notifications, auditLogs } from '@/data/activity'

export default function AdminOverview() {
  const { user } = useApp()

  const activePatients = patients.filter((p) => p.status === 'Active')
  const pendingAI = aiAssessments.filter((a) => a.status === 'Pending Review')
  const openReferrals = referrals.filter((r) => r.status !== 'Completed')
  const connectedDevices = devices.filter((d) => d.status === 'Connected')
  const unackAlerts = iotAlerts.filter((a) => !a.acknowledged)
  const adminNots = notifications.filter((n) => n.userId === 'admin' && !n.read)

  const roleData = [
    { name: 'Patients', value: activePatients.length },
    { name: 'Doctors', value: doctors.length },
    { name: 'Facilities', value: facilities.length },
  ]

  const riskData = [
    { name: 'Low', value: patients.filter((p) => p.risk === 'Low').length },
    { name: 'Moderate', value: patients.filter((p) => p.risk === 'Moderate').length },
    { name: 'High', value: patients.filter((p) => p.risk === 'High').length },
  ].filter((d) => d.value > 0)

  const statusData = ['Operational', 'At Capacity'].map((s) => ({
    name: s,
    value: facilities.filter((f) => f.status === s).length,
  })).filter((d) => d.value > 0)

  return (
    <div>
      <PageHeader title="Platform Overview" subtitle="Live summary across patients, clinicians, facilities, AI inference and IoT infrastructure.">
        <Badge variant="info" dot>System operational</Badge>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active patients" value={activePatients.length} icon={<Users className="h-5 w-5" />} hint={`${patients.filter((p) => p.risk === 'High').length} high risk`} />
        <StatCard label="Doctors" value={doctors.length} icon={<Building2 className="h-5 w-5" />} hint={`${doctors.filter((d) => d.verified).length} verified`} />
        <StatCard label="Facilities" value={facilities.length} icon={<Building2 className="h-5 w-5" />} hint={`${facilities.filter((f) => f.iotEnabled).length} IoT-enabled`} />
        <StatCard label="Connected devices" value={`${connectedDevices.length}/${devices.length}`} icon={<Cpu className="h-5 w-5" />} hint={`${devices.filter((d) => d.status === 'Error').length} in error`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending AI reviews" value={pendingAI.length} icon={<Sparkles className="h-5 w-5" />} hint="Clinician-in-the-loop" />
        <StatCard label="Open referrals" value={openReferrals.length} icon={<ClipboardList className="h-5 w-5" />} />
        <StatCard label="Appointments" value={appointments.length} icon={<BedDouble className="h-5 w-5" />} />
        <StatCard label="Unack. IoT alerts" value={unackAlerts.length} icon={<Activity className="h-5 w-5" />} hint={`${adminNots.length} admin notifications`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Entity distribution</CardTitle></CardHeader>
          <CardContent>
            <DonutChart data={roleData} />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              {roleData.map((d) => <div key={d.name} className="rounded-lg border p-2"><p className="font-bold">{d.value}</p><p className="text-muted-foreground">{d.name}</p></div>)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Patient risk profile</CardTitle></CardHeader>
          <CardContent>
            <DonutChart data={riskData} colors={['#22A55A', '#F59E0B', '#EF4444']} />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              {riskData.map((d) => <div key={d.name} className="rounded-lg border p-2"><p className="font-bold">{d.value}</p><p className="text-muted-foreground">{d.name}</p></div>)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Facility status</CardTitle></CardHeader>
          <CardContent>
            <DonutChart data={statusData} colors={['#22A55A', '#EF4444']} />
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
              {statusData.map((d) => <div key={d.name} className="rounded-lg border p-2"><p className="font-bold">{d.value}</p><p className="text-muted-foreground">{d.name}</p></div>)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Pending AI assessments</CardTitle>
            <Button asChild size="sm" variant="ghost"><Link to="/admin/ai">Monitor →</Link></Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiAssessments.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl border p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{patients.find((p) => p.id === a.patientId)?.name} — {a.possibleConditions[0]?.name}</p>
                    <p className="text-xs text-muted-foreground">Confidence {a.possibleConditions[0]?.confidence}% · status {a.status}</p>
                  </div>
                  <StatusBadge tone={a.urgency} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent audit activity</CardTitle>
            <Button asChild size="sm" variant="ghost"><Link to="/admin/audit">View all →</Link></Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditLogs.slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center gap-3 rounded-xl border p-3 text-xs">
                  <Badge variant={l.level === 'SECURITY' || l.level === 'ERROR' ? 'destructive' : l.level === 'WARNING' ? 'warning' : 'secondary'}>{l.level}</Badge>
                  <span className="min-w-0 flex-1 truncate font-mono">{l.action} — {l.details}</span>
                  <span className="shrink-0 text-muted-foreground">{l.timestamp.slice(5, 16)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
