import { useState } from 'react'
import { Globe, Lock, SlidersHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp } from '@/store/AppProvider'

export default function AdminSettings() {
  const { toast } = useApp()
  const [platform, setPlatform] = useState({
    publicSite: true,
    selfRegistration: true,
    aiAutoQueue: true,
    referralsEnabled: true,
    maintenance: false,
    mfa: true,
  })

  const set = (key: keyof typeof platform, value: boolean) => {
    setPlatform((p) => ({ ...p, [key]: value }))
    toast({ title: 'Platform setting updated', variant: 'success' })
  }

  return (
    <div>
      <PageHeader title="Platform Settings" subtitle="Global configuration for the MEDAI platform.">
        <Button variant="destructive" onClick={() => toast({ title: 'Maintenance mode', description: 'Toggle via General tab.', variant: 'warning' })}>Maintenance</Button>
      </PageHeader>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Engine</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle className="text-base">Platform behavior</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'publicSite' as const, title: 'Public website', desc: 'Show the public landing, AI assessment demo and facility directory.' },
                { key: 'selfRegistration' as const, title: 'Patient self-registration', desc: 'Allow patients to create accounts without an invitation.' },
                { key: 'aiAutoQueue' as const, title: 'Auto-queue AI assessments', desc: 'Route preliminary assessments to the doctor review queue automatically.' },
                { key: 'referralsEnabled' as const, title: 'Referral network', desc: 'Enable intelligent facility matching and referral routing.' },
                { key: 'maintenance' as const, title: 'Maintenance mode', desc: 'Temporarily restrict public access for maintenance.' },
              ].map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium"><Globe className="h-3.5 w-3.5 text-primary" /> {row.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{row.desc}</p>
                  </div>
                  <Switch checked={platform[row.key]} onCheckedChange={(v) => set(row.key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader><CardTitle className="text-base">Contact & branding</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Platform name</Label><Input defaultValue="MEDAI Health Platform" /></div>
              <div className="space-y-2"><Label>Support email</Label><Input defaultValue="support@medai.demo" /></div>
              <div className="space-y-2"><Label>Alert contact</Label><Input defaultValue="ops@medai.demo" /></div>
              <div className="space-y-2"><Label>Region</Label><Input defaultValue="Ghana (Accra)" /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader><CardTitle className="text-base">AI Engine configuration</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Confidence threshold for auto-flagging</Label>
                <Input type="number" defaultValue="70" className="max-w-[120px]" />
                <p className="text-xs text-muted-foreground">Assessments below this confidence are still queued but marked "low confidence" for clinician prioritization.</p>
              </div>
              <Separator />
              <div className="space-y-4">
                {[
                  { key: 'aiAutoQueue' as const, title: 'Require clinician review for all outputs', desc: 'AI output never reaches patients without clinician sign-off.' },
                ].map((row) => (
                  <div key={row.key} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-medium"><SlidersHorizontal className="h-3.5 w-3.5 text-primary" /> {row.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{row.desc}</p>
                    </div>
                    <Switch checked={platform[row.key]} onCheckedChange={(v) => set(row.key, v)} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast({ title: 'AI settings saved', description: 'Engine configuration updated.', variant: 'success' })}>Save AI settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle className="text-base">Security defaults</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'mfa' as const, title: 'Enforce MFA for all accounts', desc: 'Require two-factor authentication on every sign-in.' },
              ].map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium"><Lock className="h-3.5 w-3.5 text-primary" /> {row.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{row.desc}</p>
                  </div>
                  <Switch checked={platform[row.key]} onCheckedChange={(v) => set(row.key, v)} />
                </div>
              ))}
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Password minimum length</Label><Input type="number" defaultValue="12" /></div>
                <div className="space-y-2"><Label>Session timeout (minutes)</Label><Input type="number" defaultValue="15" /></div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast({ title: 'Security settings saved', description: 'Defaults applied to new sessions.', variant: 'success' })}>Save security settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
