import { useState } from 'react'
import { Search, Star, Stethoscope, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/StateComponents'
import { useApp } from '@/store/AppProvider'
import { doctors, facilities } from '@/data/entities'
import { appointments, referrals } from '@/data/clinical'
import { cn } from '@/lib/utils'

export default function FacilityDoctors() {
  const { user, toast } = useApp()
  const facility = facilities.find((f) => f.id === user?.id) ?? facilities[0]
  const myDoctors = doctors.filter((d) => d.facilityId === facility.id)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'All' | 'Available' | 'In Consultation' | 'On Leave'>('All')

  const list = myDoctors.filter((d) => {
    const q = query.toLowerCase()
    return (d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q)) && (status === 'All' || d.status === status)
  })

  return (
    <div>
      <PageHeader title="Doctors" subtitle={`${myDoctors.length} clinicians on staff at ${facility.name}.`} />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search doctors..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['All', 'Available', 'In Consultation', 'On Leave'] as const).map((s) => (
            <Badge key={s} variant={status === s ? 'default' : 'outline'} className={cn('cursor-pointer', status !== s && 'text-muted-foreground')} onClick={() => setStatus(s)}>{s}</Badge>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No doctors match" description="Adjust your search or filter." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => {
            const appts = appointments.filter((a) => a.doctorId === d.id && (a.status === 'Scheduled' || a.status === 'Confirmed')).length
            const refs = referrals.filter((r) => r.fromDoctorId === d.id && r.status !== 'Completed').length
            return (
              <Card key={d.id} className="card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-full text-sm font-bold" style={{ background: `${d.photoColor}18`, color: d.photoColor }}>
                        {d.name.replace('Dr. ', '').split(' ').map((s) => s[0]).join('')}
                      </div>
                      <div>
                        <p className="font-display text-sm font-bold">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.title} · {d.specialty}</p>
                      </div>
                    </div>
                    <StatusBadge tone={d.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{d.subSpecialty ?? d.specialty}</Badge>
                    <Badge variant="outline" className="gap-1"><Star className="h-3 w-3 fill-current text-warning" /> {d.rating}</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-center text-xs">
                    <div><p className="font-bold text-primary">{d.patientsAssigned}</p><p className="text-muted-foreground">Patients</p></div>
                    <div><p className="font-bold text-primary">{appts}</p><p className="text-muted-foreground">Appts</p></div>
                    <div><p className="font-bold text-primary">{refs}</p><p className="text-muted-foreground">Referrals</p></div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{d.yearsExperience} yrs experience</span>
                    <Button size="sm" variant="outline" onClick={() => toast({ title: 'Doctor profile', description: `${d.name} — ${d.specialty}.`, variant: 'info' })}>Profile</Button>
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
