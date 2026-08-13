import { useState } from 'react'
import { Fingerprint, LogOut, Settings, ShieldAlert, User } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp } from '@/store/AppProvider'
import { patients } from '@/data/entities'

export default function PatientSettings() {
  const { user, toast, logout } = useApp()
  const patient = patients.find((p) => p.id === user?.id) ?? patients[0]
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    smsAlerts: true,
    vitalAlerts: true,
    weeklyReport: false,
    twoFactor: true,
    telehealth: true,
    shareIoT: true,
    marketing: false,
  })

  const set = (key: keyof typeof prefs, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }))
    toast({ title: 'Preference updated', variant: 'success' })
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your profile, security and notification preferences." />

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
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" alt={patient.name} />
                  <AvatarFallback>{patient.name.split(' ').map((s) => s[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-display text-lg font-bold">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">{patient.bloodType} · {patient.gender} · {patient.dob}</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="secondary">Patient</Badge>
                    <Badge variant="outline">{patient.chronicConditions[0] ?? 'General care'}</Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" defaultValue={user?.email ?? 'precious@medai.demo'} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" defaultValue={patient.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue={patient.address} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency">Emergency contact</Label>
                  <Input id="emergency" defaultValue="Kofi Mensah — +233 20 111 2233" />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => toast({ title: 'Profile saved', description: 'Your changes have been saved.', variant: 'success' })}>
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle className="text-base">Notification preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'emailAlerts' as const, title: 'Email alerts', desc: 'Receive care team updates by email.' },
                { key: 'smsAlerts' as const, title: 'SMS alerts', desc: 'Receive critical updates by SMS.' },
                { key: 'vitalAlerts' as const, title: 'Vital threshold alerts', desc: 'Get notified when IoT readings go out of range.' },
                { key: 'weeklyReport' as const, title: 'Weekly health summary', desc: 'A weekly digest of trends and care actions.' },
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
                  { key: 'shareIoT' as const, title: 'Share IoT data with care team', desc: 'Allow clinicians to view your live telemetry.' },
                  { key: 'telehealth' as const, title: 'Enable telehealth', desc: 'Allow video consultations with providers.' },
                  { key: 'marketing' as const, title: 'Health tips & research', desc: 'Occasional educational content from MEDAI.' },
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
                  <Fingerprint className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Biometric sign-in</p>
                    <p className="text-xs text-muted-foreground">Face ID / fingerprint registered on this device.</p>
                  </div>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <ShieldAlert className="h-5 w-5 text-success" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Data privacy</p>
                    <p className="text-xs text-muted-foreground">End-to-end encrypted, HIPAA-aligned storage.</p>
                  </div>
                  <Badge variant="info">Protected</Badge>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Signed in as</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <Badge variant="outline">Patient</Badge>
                </div>
                <Button variant="destructive" className="w-full" onClick={logout}>
                  <LogOut /> Sign out
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        MEDAI settings are a demonstration. In production, account changes require clinician verification.
      </div>
    </div>
  )
}
