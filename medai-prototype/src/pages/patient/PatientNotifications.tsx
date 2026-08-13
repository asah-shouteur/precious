import { useState } from 'react'
import { Bell, CheckCheck, Filter } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/StateComponents'
import { useApp } from '@/store/AppProvider'
import { notifications, iotAlerts } from '@/data/activity'
import { patients } from '@/data/entities'
import { cn, relativeTime } from '@/lib/utils'
import type { Notification } from '@/types'

function severityTone(severity: string) {
  if (severity === 'High' || severity === 'Critical') return 'High'
  if (severity === 'Moderate') return 'Moderate'
  return 'Low'
}

export default function PatientNotifications() {
  const { user, toast } = useApp()
  const patient = patients.find((p) => p.id === user?.id) ?? patients[0]

  const myNotifications = notifications.filter((n) => n.userId === patient.id)
  const [read, setRead] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState<'all' | 'unread' | 'care' | 'iot'>('all')

  const isRead = (id: string) => read[id] ?? notifications.find((n) => n.id === id)?.read ?? false
  const unreadCount = myNotifications.filter((n) => !isRead(n.id)).length

  const toggleRead = (id: string) => {
    setRead((prev) => ({ ...prev, [id]: !prev[id] }))
    toast({ title: 'Notification updated', variant: 'info' })
  }

  const markAllRead = () => {
    const next: Record<string, boolean> = {}
    myNotifications.forEach((n) => (next[n.id] = true))
    setRead(next)
    toast({ title: 'All notifications marked as read', variant: 'success' })
  }

  const isCare = (n: Notification) => n.category === 'Appointment' || n.category === 'Referral' || n.category === 'AI Assessment' || n.category === 'Message'
  const isIoT = (n: Notification) => n.category === 'Abnormal Reading' || n.category === 'Device'

  const list = myNotifications.filter((n) => {
    if (filter === 'unread') return !isRead(n.id)
    if (filter === 'care') return isCare(n)
    if (filter === 'iot') return isIoT(n)
    return true
  })

  const recentAlerts = iotAlerts.filter((a) => a.patientId === patient.id).slice(0, 3)

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Care team updates and IoT health alerts in one place.">
        <Button variant="outline" onClick={markAllRead}><CheckCheck /> Mark all read</Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {(['all', 'unread', 'care', 'iot'] as const).map((f) => (
          <Badge key={f} variant={filter === f ? 'default' : 'outline'} className={cn('cursor-pointer capitalize', filter !== f && 'text-muted-foreground')} onClick={() => setFilter(f)}>
            {f}{f === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
          </Badge>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {list.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" description="Updates from your care team and devices will appear here." />
          ) : (
            list.map((n) => (
              <Card key={n.id} className={cn(!isRead(n.id) && 'border-primary/40')}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10">
                    <StatusBadge tone={severityTone(n.severity)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{n.title}</p>
                      {!isRead(n.id) && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">{relativeTime(n.createdAt)} · {n.category}</span>
                      <Button size="sm" variant="ghost" onClick={() => toggleRead(n.id)}>
                        {isRead(n.id) ? 'Mark unread' : 'Mark as read'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vital alerts</p>
              <div className="mt-3 space-y-3">
                {recentAlerts.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 text-xs">
                    <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', a.severity === 'High' ? 'bg-destructive' : a.severity === 'Moderate' ? 'bg-warning' : 'bg-info')} />
                    <div>
                      <p className="font-medium">{a.message}</p>
                      <p className="text-muted-foreground">{relativeTime(a.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {recentAlerts.length === 0 && <p className="text-xs text-muted-foreground">All readings within normal range.</p>}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Clinical disclaimer</p>
            <p className="mt-1 leading-relaxed">IoT alerts and notifications support your care — they are not a diagnosis. Contact a clinician for any concern.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
