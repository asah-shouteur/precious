import { useState } from 'react'
import { Search, Star } from 'lucide-react'
import { PageHero } from '@/components/shared/PublicSections'
import { FacilityCard } from '@/components/shared/Cards'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { facilities } from '@/data/entities'
import { cn } from '@/lib/utils'

const types = ['All', 'Hospital', 'Clinic', 'Diagnostic Lab', 'Specialty Center']

export default function FacilitiesPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')

  const filtered = facilities.filter((f) => {
    const matchesType = type === 'All' || f.type === type
    const matchesQuery = f.name.toLowerCase().includes(query.toLowerCase()) || f.city.toLowerCase().includes(query.toLowerCase())
    return matchesType && matchesQuery
  })

  return (
    <div>
      <PageHero
        eyebrow="Facilities"
        title="A connected network of care"
        subtitle="Browse facilities, their specialties, live capacity and readiness to accept referrals."
      />

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or city..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <Badge
                key={t}
                variant={type === t ? 'default' : 'outline'}
                className={cn('cursor-pointer px-3 py-1.5', type !== t && 'text-muted-foreground')}
                onClick={() => setType(t)}
              >
                {t}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <FacilityCard
              key={f.id}
              facility={f}
              to={f.emergency ? undefined : undefined}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed p-12 text-center text-muted-foreground">No facilities match your search.</div>
        )}

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { stat: '6', label: 'Facilities onboard' },
            { stat: '15+', label: 'Specialties' },
            { stat: '24/7', label: 'Emergency coverage' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-6 text-center">
              <p className="font-display text-3xl font-extrabold text-primary">{s.stat}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
