import { BarChart3, Printer } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarsChart, DonutChart } from '@/components/shared/charts'
import { useApp } from '@/store/AppProvider'
import { facilities, departments, doctors, patients } from '@/data/entities'
import { referrals, appointments } from '@/data/clinical'
import { iotAlerts } from '@/data/activity'

export default function FacilityAnalytics() {
  const { user, toast } = useApp()
  const facility = facilities.find((f) => f.id === user?.id) ?? facilities[0]
  const facilityPatients = patients.filter((p) => p.primaryFacilityId === facility.id)
  const myReferrals = referrals.filter((r) => r.toFacilityId === facility.id)
  const myAppointments = appointments.filter((a) => a.facilityId === facility.id)

  const referralStatus = ['Requested', 'Reviewed', 'Accepted', 'In Progress', 'Completed'].map((s) => ({
    name: s,
    value: myReferrals.filter((r) => r.status === s).length,
  })).filter((d) => d.value > 0)

  const deptData = departments.filter((d) => facility.departments.some((fd) => fd.id === d.id)).map((d) => ({
    name: d.name.split(' ')[0],
    value: Math.round((d.occupied / d.beds) * 100),
  }))

  const monthlyRefs = { Jun: '06', Jul: '07', Aug: '08' } as const
  const monthly = (['Jun', 'Jul', 'Aug'] as const).map((m) => ({
    name: m,
    referrals: myReferrals.filter((r) => r.requestedAt.slice(5, 7) === monthlyRefs[m]).length,
    appointments: Math.round(myAppointments.length * (0.3 + Math.random() * 0.4)),
  }))

  const alerts = iotAlerts.filter((a) => facilityPatients.some((p) => p.id === a.patientId))

  return (
    <div>
      <PageHeader title="Facility Analytics" subtitle={`Operational intelligence for ${facility.name}.`}>
        <Button variant="outline" onClick={() => toast({ title: 'Report exported', description: 'Facility analytics PDF generated.', variant: 'success' })}>
          <Printer /> Export
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Referrals received</p><p className="mt-1 font-display text-2xl font-bold text-primary">{myReferrals.length}</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Completion rate</p><p className="mt-1 font-display text-2xl font-bold text-success">{myReferrals.length ? Math.round((myReferrals.filter((r) => r.status === 'Completed').length / myReferrals.length) * 100) : 0}%</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Appointments</p><p className="mt-1 font-display text-2xl font-bold text-primary">{myAppointments.length}</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">IoT alerts</p><p className="mt-1 font-display text-2xl font-bold text-warning">{alerts.length}</p></Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Referral status pipeline</CardTitle></CardHeader>
          <CardContent>
            <DonutChart data={referralStatus} colors={['#F59E0B', '#3B82F6', '#5737A8', '#9A73DF', '#22A55A']} />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              {referralStatus.map((d) => (
                <div key={d.name} className="rounded-lg border p-2"><p className="font-bold">{d.value}</p><p className="text-muted-foreground">{d.name}</p></div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Department utilization</CardTitle></CardHeader>
          <CardContent>
            <BarsChart data={deptData} dataKey="value" color="#5737A8" height={220} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Monthly referral volume</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <BarsChart data={monthly} dataKey="referrals" color="#9A73DF" height={220} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Key insights</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-xl bg-success/5 p-4 text-xs leading-relaxed">
              <p className="font-semibold text-success">Referral intake health</p>
              <p className="mt-1 text-muted-foreground">Most referrals progress through intake within 1–3 days. Urgent referrals are being accepted within the same day.</p>
            </div>
            <div className="rounded-xl bg-warning/5 p-4 text-xs leading-relaxed">
              <p className="font-semibold text-warning">Capacity watch</p>
              <p className="mt-1 text-muted-foreground">{facility.name} is running at {Math.round((facility.occupancy / facility.capacity) * 100)}% occupancy. Referral routing should prioritize non-emergency intakes.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
