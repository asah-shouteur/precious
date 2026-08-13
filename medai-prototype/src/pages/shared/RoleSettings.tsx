import { useState } from 'react'
import { BellRing, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp } from '@/store/AppProvider'
import { doctors, facilities } from '@/data/entities'
import type { Role } from '@/types'

export function RoleSettings({ role }: { role: 'doctor' | 'facility' }) {
  const { user, toast, logout } = useApp()
  const entity = role === 'doctor'
    ? doctors.find((d) => d.id === user?.id) ?? doctors[0]
    : facilities.find((f) => f.id === user?.id) ?? facilities[0]

  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    smsAlerts: false,
    aiReviewAlerts: true,
    iotAlerts: true,
    weeklyDigest: false,
    twoFactor: true,
    shareData: true,
    marketing: false,
  })

  const set = (key: keyof typeof prefs, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }))
    toast({ title: 'Preference updated', variant: 'success' })
  }

  const name = entity.name

  return (
    <div>
      <PageHeader title="Settings" subtitle={`Account and notification preferences for ${name}.`} />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10">
                  <UserRound className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{name}</p>
                  <p className="text-sm capitalize text-muted-foreground">{role} account</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="secondary">{role === 'doctor' ? 'Clinician' : 'Facility'}</Badge>
                    <Badge variant="outline">Verified</Badge>
                  </div>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" defaultValue={user?.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue={'phone' in entity ? entity.phone : ''} />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => toast({ title: 'Profile saved', description: 'Your changes have been saved.', variant: 'success' })}>Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle className="text-base">Notification preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'emailAlerts' as const, title: 'Email alerts', desc: 'Receive critical updates by email.' },
                { key: 'smsAlerts' as const, title: 'SMS alerts', desc: 'Receive critical updates by SMS.' },
                { key: 'aiReviewAlerts' as const, title: 'AI review queue', desc: 'Get notified when preliminary assessments need review.' },
                { key: 'iotAlerts' as const, title: 'IoT threshold alerts', desc: 'Get notified when patient vitals go out of range.' },
                { key: 'weeklyDigest' as const, title: 'Weekly digest', desc: 'A weekly summary of clinical activity.' },
              ].map((row) => (
                <div key={row.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{row.title}</p>
                    <p className="text-xs text-muted-foreground">{row.desc}</p>
                  </div>
                  <Switch checked={prefs[row.key]} onCheckedChange={(v) => set(row.key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Security</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'twoFactor' as const, title: 'Two-factor authentication', desc: 'Require a verification code on sign-in.' },
                  { key: 'shareData' as const, title: 'Share platform analytics', desc: 'Allow anonymous aggregate reporting to MEDAI.' },
                  { key: 'marketing' as const, title: 'Product updates', desc: 'Receive MEDAI feature announcements.' },
                ].map((row) => (
                  <div key={row.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{row.title}</p>
                      <p className="text-xs text-muted-foreground">{row.desc}</p>
                    </div>
                    <Switch checked={prefs[row.key]} onCheckedChange={(v) => set(row.key, v)} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Account</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <BellRing className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Session activity</p>
                    <p className="text-xs text-muted-foreground">Last sign-in: today · MFA verified</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <ShieldCheck className="h-5 w-5 text-success" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Data protection</p>
                    <p className="text-xs text-muted-foreground">HIPAA-aligned encryption at rest and in transit.</p>
                  </div>
                  <Badge variant="info">Protected</Badge>
                </div>
                <Button variant="destructive" className="w-full" onClick={logout}><LogOut /> Sign out</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
