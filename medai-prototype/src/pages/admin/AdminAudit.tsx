import { useState } from 'react'
import { FileSearch } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/StateComponents'
import { useApp } from '@/store/AppProvider'
import { auditLogs } from '@/data/activity'
import { cn } from '@/lib/utils'

const levels = ['All', 'INFO', 'WARNING', 'ERROR', 'SECURITY', 'DB'] as const
const modules = ['All', 'AUTH', 'IOT', 'AI', 'CLINICAL', 'DB', 'SECURITY', 'SYSTEM'] as const

export default function AdminAudit() {
  const { user } = useApp()
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<(typeof levels)[number]>('All')
  const [module, setModule] = useState<(typeof modules)[number]>('All')

  const list = auditLogs.filter((l) => {
    const q = query.toLowerCase()
    const matchQ = l.action.toLowerCase().includes(q) || l.actor.toLowerCase().includes(q) || l.details.toLowerCase().includes(q)
    return matchQ && (level === 'All' || l.level === level) && (module === 'All' || l.module === module)
  })

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Immutable, append-only record of every platform action.">
        <Badge variant="info">Append-only</Badge>
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Input placeholder="Search action, actor or details..." className="w-full max-w-sm" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {levels.map((l) => (
            <Badge key={l} variant={level === l ? 'default' : 'outline'} className={cn('cursor-pointer', level !== l && 'text-muted-foreground')} onClick={() => setLevel(l)}>{l}</Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {modules.map((m) => (
            <Badge key={m} variant={module === m ? 'secondary' : 'outline'} className={cn('cursor-pointer', module !== m && 'text-muted-foreground')} onClick={() => setModule(m)}>{m}</Badge>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={FileSearch} title="No audit events" description="No events match your filters." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Level</th>
                    <th className="px-5 py-3">Module</th>
                    <th className="px-5 py-3">Actor</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">IP</th>
                    <th className="px-5 py-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((l) => (
                    <tr key={l.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs">{l.timestamp}</td>
                      <td className="px-5 py-3"><Badge variant={l.level === 'SECURITY' || l.level === 'ERROR' ? 'destructive' : l.level === 'WARNING' ? 'warning' : 'secondary'}>{l.level}</Badge></td>
                      <td className="px-5 py-3 text-xs font-semibold">{l.module}</td>
                      <td className="px-5 py-3 font-mono text-xs">{l.actor}</td>
                      <td className="px-5 py-3 font-mono text-xs font-semibold">{l.action}</td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.ip}</td>
                      <td className="max-w-[300px] px-5 py-3 text-xs text-muted-foreground">{l.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={() => {}} disabled>Export audit trail</Button>
      </div>
    </div>
  )
}
