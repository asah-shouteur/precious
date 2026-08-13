import { Clock, Plus, Timer } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/store/AppProvider'
import { services, facilities } from '@/data/entities'

const categories = ['All', 'Consultation', 'Imaging', 'Laboratory', 'Monitoring', 'Diagnostic', 'Telehealth']

export default function FacilityServices() {
  const { user, toast } = useApp()
  const facility = facilities.find((f) => f.id === user?.id) ?? facilities[0]

  const all = services.filter((s) => s.facilityId === facility.id)

  const grouped = categories.filter((c) => c !== 'All').map((c) => ({
    category: c,
    items: all.filter((s) => s.category === c),
  })).filter((g) => g.items.length > 0)

  return (
    <div>
      <PageHeader title="Services" subtitle={`Service catalog offered by ${facility.name}.`}>
        <Button variant="outline" onClick={() => toast({ title: 'Service request', description: 'New service requests route to platform admin for approval.', variant: 'info' })}>
          <Plus /> Add service
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active services</p><p className="mt-1 font-display text-2xl font-bold text-primary">{all.length}</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categories</p><p className="mt-1 font-display text-2xl font-bold text-primary">{grouped.length}</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Telehealth</p><p className="mt-1 font-display text-2xl font-bold text-primary">{all.filter((s) => s.category === 'Telehealth').length}</p></Card>
      </div>

      {grouped.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">No services cataloged for this facility.</div>
      ) : (
        <div className="mt-6 space-y-6">
          {grouped.map((g) => (
            <div key={g.category}>
              <h2 className="mb-3 font-display text-sm font-bold text-muted-foreground">{g.category}</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {g.items.map((s) => (
                  <Card key={s.id} className="card-hover">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-display text-sm font-bold">{s.name}</p>
                        <Badge variant={s.cost === 0 ? 'success' : 'secondary'}>{s.cost === 0 ? 'Free' : `GH₵${s.cost}`}</Badge>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.description}</p>
                      <div className="mt-3 flex items-center gap-3 border-t pt-2.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Timer className="h-3.5 w-3.5 text-primary" /> {s.durationMin} min</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> {s.category}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
