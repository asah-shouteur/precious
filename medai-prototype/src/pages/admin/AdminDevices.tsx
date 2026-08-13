import { useState } from 'react'
import { Battery, Cpu, RefreshCw, Search, Signal } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/StateComponents'
import { useApp } from '@/store/AppProvider'
import { devices, patients } from '@/data/entities'
import { iotAlerts } from '@/data/activity'
import { cn } from '@/lib/utils'

const statusFilter = ['All', 'Connected', 'Low Battery', 'Disconnected', 'Error'] as const

export default function AdminDevices() {
  const { toast } = useApp()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<(typeof statusFilter)[number]>('All')

  const ownerName = (id: string) => patients.find((p) => p.id === id)?.name ?? 'Unassigned'

  const list = devices.filter((d) => {
    const q = query.toLowerCase()
    const matchQ = d.name.toLowerCase().includes(q) || d.mac.toLowerCase().includes(q) || ownerName(d.ownerId).toLowerCase().includes(q)
    return matchQ && (status === 'All' || d.status === status)
  })

  const firmwareVersion = (f: string) => f

  return (
    <div>
      <PageHeader title="IoT Device Registry" subtitle="Fleet management for ESP32 hubs and medical sensors.">
        <Button variant="outline" onClick={() => toast({ title: 'Firmware check', description: 'All devices checked against v2.4.1 baseline.', variant: 'success' })}>
          <RefreshCw /> Check firmware
        </Button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search device, MAC or owner..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilter.map((s) => (
            <Badge key={s} variant={status === s ? 'default' : 'outline'} className={cn('cursor-pointer', status !== s && 'text-muted-foreground')} onClick={() => setStatus(s)}>{s}</Badge>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Cpu} title="No devices found" description="Adjust your search or filter." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">Device</th>
                    <th className="px-5 py-3">Owner</th>
                    <th className="px-5 py-3">MAC</th>
                    <th className="px-5 py-3">Firmware</th>
                    <th className="px-5 py-3">Battery</th>
                    <th className="px-5 py-3">Signal</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((d) => (
                    <tr key={d.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <p className="font-semibold">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.model} · {d.sensor}</p>
                      </td>
                      <td className="px-5 py-3 text-xs">{ownerName(d.ownerId)}</td>
                      <td className="px-5 py-3 font-mono text-xs">{d.mac}</td>
                      <td className="px-5 py-3"><Badge variant="secondary">{firmwareVersion(d.firmware)}</Badge></td>
                      <td className="px-5 py-3">
                        <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', d.battery < 20 ? 'text-destructive' : 'text-muted-foreground')}>
                          <Battery className="h-3.5 w-3.5" /> {d.battery}%
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn('inline-flex items-center gap-1 text-xs', d.signal === 0 ? 'text-destructive' : 'text-muted-foreground')}>
                          <Signal className="h-3.5 w-3.5" /> {d.signal}
                        </span>
                      </td>
                      <td className="px-5 py-3"><StatusBadge tone={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fleet summary</p>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-lg border p-2"><p className="font-bold">{devices.length}</p><p>Total</p></div>
            <div className="rounded-lg border p-2"><p className="font-bold text-success">{devices.filter((d) => d.status === 'Connected').length}</p><p>Connected</p></div>
            <div className="rounded-lg border p-2"><p className="font-bold text-warning">{devices.filter((d) => d.status === 'Low Battery').length}</p><p>Low battery</p></div>
            <div className="rounded-lg border p-2"><p className="font-bold text-destructive">{devices.filter((d) => d.status === 'Error' || d.status === 'Disconnected').length}</p><p>Unhealthy</p></div>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent device alerts</p>
          <div className="mt-3 space-y-2">
            {iotAlerts.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-start gap-2 rounded-lg border p-2.5 text-xs">
                <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', a.severity === 'High' ? 'bg-destructive' : a.severity === 'Moderate' ? 'bg-warning' : 'bg-info')} />
                <span className="min-w-0 flex-1">{a.message}</span>
                <span className="shrink-0 text-muted-foreground">{a.createdAt.slice(5, 10)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
