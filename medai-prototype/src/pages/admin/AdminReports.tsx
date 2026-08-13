import { BarChart3, Printer } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarsChart, DonutChart } from '@/components/shared/charts'
import { useApp } from '@/store/AppProvider'
import { patients, doctors, facilities, devices } from '@/data/entities'
import { referrals, appointments } from '@/data/clinical'
import { aiAssessments, iotAlerts, auditLogs } from '@/data/activity'

export default function AdminReports() {
  const { user, toast } = useApp()

  const riskData = [
    { name: 'Low', value: patients.filter((p) => p.risk === 'Low').length },
    { name: 'Moderate', value: patients.filter((p) => p.risk === 'Moderate').length },
    { name: 'High', value: patients.filter((p) => p.risk === 'High').length },
  ].filter((d) => d.value > 0)

  const referralStatus = ['Requested', 'Reviewed', 'Accepted', 'In Progress', 'Completed'].map((s) => ({
    name: s,
    value: referrals.filter((r) => r.status === s).length,
  })).filter((d) => d.value > 0)

  const deviceHealth = [
    { name: 'Healthy', value: devices.filter((d) => d.status === 'Connected').length },
    { name: 'Attention', value: devices.filter((d) => d.status !== 'Connected').length },
  ].filter((d) => d.value > 0)

  const alertsByType = ['High', 'Moderate', 'Low'].map((s) => ({
    name: s,
    value: iotAlerts.filter((a) => a.severity === s).length,
  })).filter((d) => d.value > 0)

  const monthly = (['Jun', 'Jul', 'Aug'] as const).map((m) => ({
    name: m,
    assessments: Math.round(aiAssessments.length * (0.3 + Math.random() * 0.3)),
    alerts: Math.round(iotAlerts.length * (0.4 + Math.random() * 0.2)),
  }))

  return (
    <div>
      <PageHeader title="Platform Reports" subtitle="Aggregate operational, clinical and infrastructure reporting.">
        <Button variant="outline" onClick={() => toast({ title: 'Report exported', description: 'Comprehensive platform report PDF generated.', variant: 'success' })}>
          <Printer /> Export report
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total users</p><p className="mt-1 font-display text-2xl font-bold text-primary">{patients.length + doctors.length + facilities.length}</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Appointments</p><p className="mt-1 font-display text-2xl font-bold text-primary">{appointments.length}</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI inferences</p><p className="mt-1 font-display text-2xl font-bold text-primary">{aiAssessments.length}</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Audit events</p><p className="mt-1 font-display text-2xl font-bold text-primary">{auditLogs.length}</p></Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Patient risk distribution</CardTitle></CardHeader>
          <CardContent>
            <DonutChart data={riskData} colors={['#22A55A', '#F59E0B', '#EF4444']} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Referral pipeline</CardTitle></CardHeader>
          <CardContent>
            <DonutChart data={referralStatus} colors={['#F59E0B', '#3B82F6', '#5737A8', '#9A73DF', '#22A55A']} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Device health</CardTitle></CardHeader>
          <CardContent>
            <DonutChart data={deviceHealth} colors={['#22A55A', '#EF4444']} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">IoT alerts by severity</CardTitle></CardHeader>
          <CardContent>
            <DonutChart data={alertsByType} colors={['#EF4444', '#F59E0B', '#3B82F6']} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Monthly activity trend</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <BarsChart data={monthly} dataKey="assessments" color="#5737A8" height={220} />
        </CardContent>
      </Card>
    </div>
  )
}
