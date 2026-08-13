import { useState } from 'react'
import { Building2, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/shared/StateComponents'
import { useApp } from '@/store/AppProvider'
import { facilities, doctors } from '@/data/entities'
import { cn } from '@/lib/utils'

export default function AdminFacilities() {
  const { toast } = useApp()
  const [query, setQuery] = useState('')

  const list = facilities.filter((f) => {
    const q = query.toLowerCase()
    return f.name.toLowerCase().includes(q) || f.city.toLowerCase().includes(q) || f.type.toLowerCase().includes(q)
  })

  return (
    <div>
      <PageHeader title="Facility Directory" subtitle="All facilities registered on the MEDAI referral network.">
        <Button variant="outline" onClick={() => toast({ title: 'Add facility', description: 'Facility onboarding workflow is a demo.', variant: 'info' })}>
          <Building2 /> Add facility
        </Button>
      </PageHeader>

      <div className="mb-5 relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search facilities..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Building2} title="No facilities found" description="Adjust your search." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((f) => {
            const pct = Math.round((f.occupancy / f.capacity) * 100)
            const staff = doctors.filter((d) => d.facilityId === f.id).length
            return (
              <Card key={f.id} className="card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-sm font-bold">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.type} · {f.city}</p>
                    </div>
                    <Badge variant={f.status === 'Operational' ? 'success' : 'destructive'} dot>{f.status}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {f.specialties.slice(0, 3).map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Occupancy {f.occupancy}/{f.capacity}</span>
                      <span className={cn('font-bold', pct > 85 ? 'text-destructive' : pct > 70 ? 'text-warning' : 'text-success')}>{pct}%</span>
                    </div>
                    <Progress value={pct} className="mt-1.5 h-1.5" indicatorClassName={pct > 85 ? 'bg-destructive' : pct > 70 ? 'bg-warning' : 'bg-success'} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{staff} doctors</span>
                    <span>{f.iotEnabled ? 'IoT enabled' : 'No IoT'}</span>
                    <span className="font-semibold text-primary">{f.rating} ★</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
