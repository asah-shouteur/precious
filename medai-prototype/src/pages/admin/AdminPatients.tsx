import { useState } from 'react'
import { Search, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/StateComponents'
import { useApp } from '@/store/AppProvider'
import { patients, doctors, facilities } from '@/data/entities'
import { medicalRecords } from '@/data/clinical'
import { cn } from '@/lib/utils'

export default function AdminPatients() {
  const { toast } = useApp()
  const [query, setQuery] = useState('')
  const [risk, setRisk] = useState<'All' | 'High' | 'Moderate' | 'Low'>('All')

  const list = patients.filter((p) => {
    const q = query.toLowerCase()
    const physician = doctors.find((d) => d.id === p.primaryPhysicianId)?.name ?? ''
    const facility = facilities.find((f) => f.id === p.primaryFacilityId)?.name ?? ''
    const matchQ = p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || physician.toLowerCase().includes(q) || facility.toLowerCase().includes(q)
    return matchQ && (risk === 'All' || p.risk === risk)
  })

  return (
    <div>
      <PageHeader title="Patient Registry" subtitle="All patients across the MEDAI network.">
        <Button variant="outline" onClick={() => toast({ title: 'Export', description: 'Patient registry CSV export prepared.', variant: 'success' })}>Export CSV</Button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search patient, physician, facility..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['All', 'High', 'Moderate', 'Low'] as const).map((r) => (
            <Badge key={r} variant={risk === r ? 'default' : 'outline'} className={cn('cursor-pointer', risk !== r && 'text-muted-foreground')} onClick={() => setRisk(r)}>{r}</Badge>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={UserRound} title="No patients found" description="Adjust your search." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">Patient</th>
                    <th className="px-5 py-3">Primary physician</th>
                    <th className="px-5 py-3">Facility</th>
                    <th className="px-5 py-3">Conditions</th>
                    <th className="px-5 py-3">Health score</th>
                    <th className="px-5 py-3">Risk</th>
                    <th className="px-5 py-3 text-right">Records</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => {
                    const recCount = medicalRecords.filter((r) => r.patientId === p.id).length
                    return (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{p.name.split(' ').map((s) => s[0]).join('')}</div>
                            <div>
                              <p className="font-semibold">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.age} · {p.gender} · {p.bloodType}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs">{doctors.find((d) => d.id === p.primaryPhysicianId)?.name ?? '—'}</td>
                        <td className="px-5 py-3 text-xs">{facilities.find((f) => f.id === p.primaryFacilityId)?.name ?? '—'}</td>
                        <td className="px-5 py-3 text-xs">{p.chronicConditions.slice(0, 2).join(', ') || 'None'}</td>
                        <td className="px-5 py-3">
                          <span className={cn('font-bold', p.healthScore >= 80 ? 'text-success' : p.healthScore >= 60 ? 'text-warning' : 'text-destructive')}>{p.healthScore}</span>
                        </td>
                        <td className="px-5 py-3"><StatusBadge tone={p.risk} /></td>
                        <td className="px-5 py-3 text-right"><Badge variant="secondary">{recCount}</Badge></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
