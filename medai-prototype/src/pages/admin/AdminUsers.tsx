import { useState } from 'react'
import { Shield, UserCog, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useApp } from '@/store/AppProvider'
import { patients, doctors } from '@/data/entities'
import { cn } from '@/lib/utils'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: 'Active' | 'Suspended' | 'Pending'
  lastLogin: string
  mfa: boolean
}

const systemUsers: AdminUser[] = [
  { id: 'admin', name: 'MEDAI Admin', email: 'admin@medai.demo', role: 'Admin', status: 'Active', lastLogin: '2026-08-13T08:00:00', mfa: true },
  { id: 'sys_support', name: 'System Support Bot', email: 'support@medai.demo', role: 'Support', status: 'Active', lastLogin: '2026-08-13T07:45:00', mfa: true },
]

export default function AdminUsers() {
  const { toast } = useApp()
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | 'Patient' | 'Doctor' | 'Facility' | 'Admin'>('All')

  const mappedUsers: AdminUser[] = [
    ...systemUsers,
    ...patients.map((p) => ({ id: p.id, name: p.name, email: p.email, role: 'Patient' as const, status: 'Active' as const, lastLogin: p.joinedAt, mfa: true })),
    ...doctors.map((d) => ({ id: d.id, name: d.name, email: d.email, role: 'Doctor' as const, status: (d.status === 'On Leave' ? 'Suspended' : 'Active') as 'Active' | 'Suspended', lastLogin: '2026-08-12T09:00:00', mfa: d.verified })),
  ]

  const list = mappedUsers.filter((u) => {
    const q = query.toLowerCase()
    return (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) && (roleFilter === 'All' || u.role === roleFilter)
  })

  const toggleStatus = (u: AdminUser) => {
    toast({ title: `User ${u.status === 'Active' ? 'suspended' : 'reactivated'}`, description: `${u.name} (${u.role}).`, variant: 'info' })
  }

  return (
    <div>
      <PageHeader title="User Management" subtitle="Directory of all platform accounts with role-based access control.">
        <Button variant="outline" onClick={() => toast({ title: 'Invite sent', description: 'Role-based invitation workflow is a demo.', variant: 'info' })}>
          <UserCog /> Invite user
        </Button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Input placeholder="Search users..." className="w-full max-w-sm" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="flex gap-2">
          {(['All', 'Patient', 'Doctor', 'Facility', 'Admin'] as const).map((r) => (
            <Badge key={r} variant={roleFilter === r ? 'default' : 'outline'} className={cn('cursor-pointer', roleFilter !== r && 'text-muted-foreground')} onClick={() => setRoleFilter(r)}>{r}</Badge>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">MFA</th>
                  <th className="px-5 py-3">Last login</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{u.name.split(' ').map((s) => s[0]).join('')}</div>
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><Badge variant="secondary">{u.role}</Badge></td>
                    <td className="px-5 py-3">{u.mfa ? <Badge variant="success" dot>Enabled</Badge> : <Badge variant="outline">Off</Badge>}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{u.lastLogin.slice(0, 10)}</td>
                    <td className="px-5 py-3"><Badge variant={u.status === 'Active' ? 'success' : u.status === 'Suspended' ? 'destructive' : 'warning'} dot>{u.status}</Badge></td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => toast({ title: 'Manage user', description: `${u.name} management actions.`, variant: 'info' })}>
                        <UserCog /> Manage
                      </Button>
                      <Button size="sm" variant="ghost" className={cn(u.status === 'Active' ? 'text-destructive hover:text-destructive' : 'text-success hover:text-success')} onClick={() => toggleStatus(u)}>
                        <Shield /> {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {list.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No users match.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
