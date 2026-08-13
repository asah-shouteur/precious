import { FileText, Printer } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarsChart, DonutChart } from '@/components/shared/charts'
import { useApp } from '@/store/AppProvider'
import { appointments, referrals } from '@/data/clinical'
import { patients, doctors } from '@/data/entities'
import { aiAssessments } from '@/data/activity'

export default function DoctorReports() {
  const { user, toast } = useApp()
  const me = doctors.find((d) => d.id === user?.id) ?? doctors[0]
  const myPatients = patients.filter((p) => p.primaryPhysicianId === me.id)
  const myAppointments = appointments.filter((a) => a.doctorId === me.id)

  const riskData = [
    { name: 'Low', value: myPatients.filter((p) => p.risk === 'Low').length },
    { name: 'Moderate', value: myPatients.filter((p) => p.risk === 'Moderate').length },
    { name: 'High', value: myPatients.filter((p) => p.risk === 'High').length },
  ].filter((d) => d.value > 0)

  const appointmentData = ['Confirmed', 'Scheduled', 'Completed', 'Cancelled'].map((s) => ({
    name: s,
    value: myAppointments.filter((a) => a.status === s).length,
  })).filter((d) => d.value > 0)

  const specialtyData = myPatients.reduce<Record<string, number>>((acc, p) => {
    const cond = p.chronicConditions[0] ?? 'General'
    acc[cond] = (acc[cond] ?? 0) + 1
    return acc
  }, {})
  const conditionData = Object.entries(specialtyData).map(([name, value]) => ({ name, value }))

  const monthly = ['Jun', 'Jul', 'Aug'].map((m) => ({
    name: m,
    appointments: Math.round(myAppointments.length * (0.4 + Math.random() * 0.3)),
    referrals: Math.round(referrals.filter((r) => r.fromDoctorId === me.id).length * (0.4 + Math.random() * 0.3)),
  }))

  return (
    <div>
      <PageHeader title="Clinical Reports" subtitle={`Performance and clinical activity summary for ${me.name}.`}>
        <Button variant="outline" onClick={() => toast({ title: 'Report exported', description: 'PDF summary generated.', variant: 'success' })}>
          <Printer /> Export PDF
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Patient risk distribution</CardTitle></CardHeader>
          <CardContent>
            <DonutChart data={riskData} />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              {riskData.map((d) => (
                <div key={d.name} className="rounded-lg border p-2"><p className="font-bold">{d.value}</p><p className="text-muted-foreground">{d.name}</p></div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Appointments by status</CardTitle></CardHeader>
          <CardContent>
            <DonutChart data={appointmentData} colors={['#22A55A', '#F59E0B', '#5737A8', '#EF4444']} />
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              {appointmentData.map((d) => (
                <div key={d.name} className="rounded-lg border p-2"><p className="font-bold">{d.value}</p><p className="text-muted-foreground">{d.name}</p></div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Monthly activity</CardTitle></CardHeader>
          <CardContent>
            <BarsChart data={monthly} dataKey="appointments" xKey="name" height={220} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Primary conditions managed</CardTitle></CardHeader>
          <CardContent>
            <BarsChart data={conditionData} dataKey="value" color="#9A73DF" height={220} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Key metrics</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-center sm:grid-cols-4">
            <div className="rounded-xl border p-4"><p className="font-display text-2xl font-bold text-primary">{myPatients.length}</p><p className="text-xs text-muted-foreground">Patients</p></div>
            <div className="rounded-xl border p-4"><p className="font-display text-2xl font-bold text-primary">{myAppointments.length}</p><p className="text-xs text-muted-foreground">Total appointments</p></div>
            <div className="rounded-xl border p-4"><p className="font-display text-2xl font-bold text-primary">{aiAssessments.filter((a) => a.status === 'Reviewed').length}</p><p className="text-xs text-muted-foreground">AI assessments reviewed</p></div>
            <div className="rounded-xl border p-4"><p className="font-display text-2xl font-bold text-primary">{me.referralsPending}</p><p className="text-xs text-muted-foreground">Referrals pending</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
