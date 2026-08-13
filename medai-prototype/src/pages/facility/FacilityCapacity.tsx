import { Activity, BedDouble, Timer } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useApp } from '@/store/AppProvider'
import { facilities, departments } from '@/data/entities'
import { cn } from '@/lib/utils'

export default function FacilityCapacity() {
  const { user } = useApp()
  const facility = facilities.find((f) => f.id === user?.id) ?? facilities[0]
  const pct = Math.round((facility.occupancy / facility.capacity) * 100)
  const available = facility.capacity - facility.occupancy

  const status = pct >= 90 ? 'Critical' : pct >= 75 ? 'High' : pct >= 50 ? 'Moderate' : 'Comfortable'

  return (
    <div>
      <PageHeader title="Capacity & Bed Management" subtitle={`Live capacity view for ${facility.name}.`}>
        <Badge variant={status === 'Critical' ? 'destructive' : status === 'High' ? 'warning' : status === 'Moderate' ? 'info' : 'success'} dot>
          {status} load
        </Badge>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total capacity</p>
            <BedDouble className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 font-display text-3xl font-bold">{facility.capacity}</p>
          <p className="text-xs text-muted-foreground">beds total</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Occupied</p>
          <p className="mt-1 font-display text-3xl font-bold text-primary">{facility.occupancy}</p>
          <p className="text-xs text-muted-foreground">{pct}% utilization</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Available</p>
          <p className={cn('mt-1 font-display text-3xl font-bold', available > 0 ? 'text-success' : 'text-destructive')}>{available}</p>
          <p className="text-xs text-muted-foreground">beds available</p>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Overall utilization</CardTitle>
          <span className={cn('font-display text-xl font-bold', pct > 85 ? 'text-destructive' : pct > 70 ? 'text-warning' : 'text-success')}>{pct}%</span>
        </CardHeader>
        <CardContent>
          <Progress value={pct} className="h-3" indicatorClassName={pct > 85 ? 'bg-destructive' : pct > 70 ? 'bg-warning' : 'bg-success'} />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {departments.filter((d) => facility.departments.some((fd) => fd.id === d.id)).map((d) => {
          const dpct = Math.round((d.occupied / d.beds) * 100)
          return (
            <Card key={d.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-bold">{d.name}</p>
                  <StatusBadge tone={dpct > 85 ? 'High' : dpct > 60 ? 'Moderate' : 'Low'} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{d.occupied} / {d.beds} beds</span>
                  <span>{d.beds - d.occupied} available</span>
                </div>
                <Progress value={dpct} className="mt-2" indicatorClassName={dpct > 85 ? 'bg-destructive' : dpct > 60 ? 'bg-warning' : 'bg-success'} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Operational indicators</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-center sm:grid-cols-3">
            <div className="rounded-xl border p-4">
              <Timer className="mx-auto h-5 w-5 text-warning" />
              <p className="mt-2 font-display text-2xl font-bold">18 min</p>
              <p className="text-xs text-muted-foreground">Avg emergency wait</p>
            </div>
            <div className="rounded-xl border p-4">
              <BedDouble className="mx-auto h-5 w-5 text-info" />
              <p className="mt-2 font-display text-2xl font-bold">{Math.round(facility.occupancy * 0.15)}</p>
              <p className="text-xs text-muted-foreground">ICU beds in use</p>
            </div>
            <div className="rounded-xl border p-4">
              <Activity className="mx-auto h-5 w-5 text-success" />
              <p className="mt-2 font-display text-2xl font-bold">{facility.iotEnabled ? 'Live' : 'N/A'}</p>
              <p className="text-xs text-muted-foreground">IoT telemetry stream</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
