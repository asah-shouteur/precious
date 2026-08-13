import { Building2, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useApp } from '@/store/AppProvider'
import { facilities, departments } from '@/data/entities'
import { cn } from '@/lib/utils'

export default function FacilityDepartments() {
  const { user, toast } = useApp()
  const facility = facilities.find((f) => f.id === user?.id) ?? facilities[0]
  const deps = facility.departments

  const totalBeds = deps.reduce((s, d) => s + d.beds, 0)
  const totalOccupied = deps.reduce((s, d) => s + d.occupied, 0)

  return (
    <div>
      <PageHeader title="Departments" subtitle={`Department capacity across ${facility.name}.`}>
        <Button variant="outline" onClick={() => toast({ title: 'Department request', description: 'New department requests route to platform admin.', variant: 'info' })}>
          <Plus /> Add department
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Departments</p><p className="mt-1 font-display text-2xl font-bold text-primary">{deps.length}</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total beds</p><p className="mt-1 font-display text-2xl font-bold text-primary">{totalBeds}</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Occupied</p><p className="mt-1 font-display text-2xl font-bold text-primary">{totalOccupied} <span className="text-sm font-medium text-muted-foreground">/ {totalBeds - totalOccupied} available</span></p></Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {deps.map((d) => {
          const pct = Math.round((d.occupied / d.beds) * 100)
          return (
            <Card key={d.id}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{d.name}</CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">Head: {d.headDoctor}</p>
                </div>
                <Badge variant={d.status === 'Operational' ? 'success' : 'destructive'} dot>{d.status}</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Capacity utilization</span>
                  <span className={cn('font-bold', pct > 85 ? 'text-destructive' : pct > 70 ? 'text-warning' : 'text-success')}>{d.occupied}/{d.beds} beds · {pct}%</span>
                </div>
                <Progress value={pct} className="mt-2" indicatorClassName={pct > 85 ? 'bg-destructive' : pct > 70 ? 'bg-warning' : 'bg-success'} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-6">
        <CardContent className="flex items-center gap-3 p-5 text-sm">
          <Building2 className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-muted-foreground">Departments are managed by facility administrators and platform governance. Bed allocation changes take effect immediately for referral routing.</p>
        </CardContent>
      </Card>
    </div>
  )
}
