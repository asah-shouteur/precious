import { useState } from 'react'
import { Search, Stethoscope } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/StateComponents'
import { useApp } from '@/store/AppProvider'
import { doctors, facilities } from '@/data/entities'
import { cn } from '@/lib/utils'

export default function AdminDoctors() {
  const { toast } = useApp()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'All' | 'Available' | 'In Consultation' | 'On Leave'>('All')

  const list = doctors.filter((d) => {
    const q = query.toLowerCase()
    const facility = facilities.find((f) => f.id === d.facilityId)?.name ?? ''
    return (d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || facility.toLowerCase().includes(q)) && (status === 'All' || d.status === status)
  })

  return (
    <div>
      <PageHeader title="Doctor Registry" subtitle="All verified clinicians on the platform.">
        <Button variant="outline" onClick={() => toast({ title: 'Onboarding', description: 'Clinician onboarding workflow is a demo.', variant: 'info' })}>Onboard clinician</Button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search doctor or specialty..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['All', 'Available', 'In Consultation', 'On Leave'] as const).map((s) => (
            <Badge key={s} variant={status === s ? 'default' : 'outline'} className={cn('cursor-pointer', status !== s && 'text-muted-foreground')} onClick={() => setStatus(s)}>{s}</Badge>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No doctors found" description="Adjust your search." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">Doctor</th>
                    <th className="px-5 py-3">Specialty</th>
                    <th className="px-5 py-3">Facility</th>
                    <th className="px-5 py-3">Experience</th>
                    <th className="px-5 py-3">Rating</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((d) => (
                    <tr key={d.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold" style={{ background: `${d.photoColor}18`, color: d.photoColor }}>
                            {d.name.replace('Dr. ', '').split(' ').map((s) => s[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold">{d.name}</p>
                            <p className="text-xs text-muted-foreground">{d.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs">{d.specialty}{d.subSpecialty ? ` · ${d.subSpecialty}` : ''}</td>
                      <td className="px-5 py-3 text-xs">{facilities.find((f) => f.id === d.facilityId)?.name ?? '—'}</td>
                      <td className="px-5 py-3 text-xs">{d.yearsExperience} yrs</td>
                      <td className="px-5 py-3 text-xs font-bold">{d.rating} ★</td>
                      <td className="px-5 py-3"><StatusBadge tone={d.status} /></td>
                      <td className="px-5 py-3 text-right">{d.verified ? <Badge variant="success" dot>Verified</Badge> : <Badge variant="warning" dot>Pending</Badge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
