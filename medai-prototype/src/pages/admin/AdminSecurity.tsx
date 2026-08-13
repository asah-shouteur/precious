import { useState } from 'react'
import { Fingerprint, KeyRound, Lock, ShieldAlert, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { useApp } from '@/store/AppProvider'
import { auditLogs } from '@/data/activity'
import { cn } from '@/lib/utils'

export default function AdminSecurity() {
  const { toast } = useApp()
  const [settings, setSettings] = useState({
    mfa: true,
    sessionTimeout: true,
    ipWhitelist: true,
    auditAlerts: true,
    deviceFirmware: true,
  })

  const set = (key: keyof typeof settings, value: boolean) => {
    setSettings((s) => ({ ...s, [key]: value }))
    toast({ title: 'Security policy updated', variant: 'success' })
  }

  const securityLogs = auditLogs.filter((l) => l.module === 'SECURITY' || l.level === 'SECURITY')

  return (
    <div>
      <PageHeader title="Security Center" subtitle="Platform security posture, access controls and incident monitoring.">
        <Badge variant="success" className="gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Healthy posture</Badge>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Security score</p><ShieldCheck className="h-4 w-4 text-success" /></div>
          <p className="mt-1 font-display text-3xl font-bold text-success">92</p>
          <Progress value={92} className="mt-2" indicatorClassName="bg-success" />
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">MFA coverage</p>
          <p className="mt-1 font-display text-3xl font-bold text-primary">100%</p>
          <p className="text-xs text-muted-foreground">All clinical roles enrolled</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Incidents (7 days)</p>
          <p className="mt-1 font-display text-3xl font-bold text-warning">1</p>
          <p className="text-xs text-muted-foreground">Locked account pat_5</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Access policies</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'mfa' as const, title: 'Mandatory multi-factor authentication', desc: 'Require TOTP or hardware key for all clinical and admin accounts.' },
              { key: 'sessionTimeout' as const, title: 'Automatic session timeout', desc: 'Sign users out after 15 minutes of inactivity.' },
              { key: 'ipWhitelist' as const, title: 'IP whitelisting for admin', desc: 'Restrict admin console access to approved network ranges.' },
              { key: 'auditAlerts' as const, title: 'Anomaly alerts', desc: 'Notify on unusual login patterns, mass data access or firmware drift.' },
              { key: 'deviceFirmware' as const, title: 'Forced device firmware policy', desc: 'Reject telemetry from devices below the security baseline firmware.' },
            ].map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium"><Lock className="h-3.5 w-3.5 text-primary" /> {row.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{row.desc}</p>
                </div>
                <Switch checked={settings[row.key]} onCheckedChange={(v) => set(row.key, v)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Recent security events</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {securityLogs.map((l) => (
                  <div key={l.id} className="flex items-start gap-3 rounded-xl border p-3 text-xs">
                    <ShieldAlert className={cn('mt-0.5 h-4 w-4 shrink-0', l.level === 'SECURITY' ? 'text-destructive' : 'text-warning')} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{l.action} — {l.details}</p>
                      <p className="mt-0.5 font-mono text-muted-foreground">{l.actor} · {l.ip} · {l.timestamp}</p>
                    </div>
                  </div>
                ))}
                {securityLogs.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No security events recorded.</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Encryption & keys</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 rounded-xl border p-3.5">
                  <KeyRound className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Signing key</p>
                    <p className="font-mono text-xs text-muted-foreground">KMS · rotated 12 days ago</p>
                  </div>
                  <Badge variant="success">Current</Badge>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-3.5">
                  <Fingerprint className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">TLS certificates</p>
                    <p className="font-mono text-xs text-muted-foreground">Auto-renew · valid 89 days</p>
                  </div>
                  <Badge variant="success">Valid</Badge>
                </div>
                <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                  All telemetry payloads are signed by the ESP32 hub with a per-device certificate. Unauthorized devices are rejected at the gateway.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
