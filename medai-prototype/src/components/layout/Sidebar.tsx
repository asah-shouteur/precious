import { NavLink, useNavigate } from 'react-router-dom'
import {
  Activity,
  Bell,
  CalendarCheck2,
  ClipboardList,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Building2, BarChart3, UserRound, Stethoscope } from 'lucide-react'
import { useApp } from '@/store/AppProvider'
import { cn, initials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Role } from '@/types'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

export const navConfig: Record<Role, { group: string; items: NavItem[] }[]> = {
  patient: [
    { group: 'Overview', items: [{ label: 'Dashboard', to: '/patient', icon: LayoutDashboard, end: true }] },
    {
      group: 'Health',
      items: [
        { label: 'Health Metrics', to: '/patient/metrics', icon: HeartPulse },
        { label: 'AI Assessment', to: '/patient/assessments', icon: Sparkles },
        { label: 'IoT Monitoring', to: '/patient/iot', icon: Activity },
      ],
    },
    {
      group: 'Care',
      items: [
        { label: 'Medical Records', to: '/patient/records', icon: FileText },
        { label: 'Appointments', to: '/patient/appointments', icon: CalendarCheck2 },
        { label: 'Referrals', to: '/patient/referrals', icon: ClipboardList },
        { label: 'Messages', to: '/patient/messages', icon: MessageSquare },
      ],
    },
    {
      group: 'Account',
      items: [
        { label: 'Notifications', to: '/patient/notifications', icon: Bell },
        { label: 'Settings', to: '/patient/settings', icon: Settings },
      ],
    },
  ],
  doctor: [
    { group: 'Clinical', items: [{ label: 'Dashboard', to: '/doctor', icon: LayoutDashboard, end: true }] },
    {
      group: 'Patients',
      items: [
        { label: 'Patient Management', to: '/doctor/patients', icon: Users },
        { label: 'AI Review Queue', to: '/doctor/ai-reviews', icon: Sparkles },
        { label: 'IoT Monitoring', to: '/doctor/iot', icon: Activity },
      ],
    },
    {
      group: 'Care',
      items: [
        { label: 'Appointments', to: '/doctor/appointments', icon: CalendarCheck2 },
        { label: 'Medical Records', to: '/doctor/records', icon: FileText },
        { label: 'Referrals', to: '/doctor/referrals', icon: ClipboardList },
        { label: 'Messages', to: '/doctor/messages', icon: MessageSquare },
      ],
    },
    {
      group: 'Reporting',
      items: [{ label: 'Reports', to: '/doctor/reports', icon: FileText }],
    },
  ],
  facility: [
    { group: 'Operations', items: [{ label: 'Dashboard', to: '/facility', icon: LayoutDashboard, end: true }] },
    {
      group: 'Management',
      items: [
        { label: 'Doctors', to: '/facility/doctors', icon: Users },
        { label: 'Departments', to: '/facility/departments', icon: Building2 },
        { label: 'Services', to: '/facility/services', icon: ClipboardList },
      ],
    },
    {
      group: 'Patient Flow',
      items: [
        { label: 'Referral Requests', to: '/facility/referrals', icon: ClipboardList },
        { label: 'Capacity', to: '/facility/capacity', icon: Activity },
        { label: 'Appointments', to: '/facility/appointments', icon: CalendarCheck2 },
      ],
    },
    {
      group: 'Insights',
      items: [{ label: 'Analytics', to: '/facility/analytics', icon: BarChart3 }],
    },
  ],
  admin: [
    { group: 'Platform', items: [{ label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true }] },
    {
      group: 'Directory',
      items: [
        { label: 'Users', to: '/admin/users', icon: Users },
        { label: 'Patients', to: '/admin/patients', icon: UserRound },
        { label: 'Doctors', to: '/admin/doctors', icon: Stethoscope },
        { label: 'Facilities', to: '/admin/facilities', icon: Building2 },
      ],
    },
    {
      group: 'Operations',
      items: [
        { label: 'IoT Devices', to: '/admin/devices', icon: Activity },
        { label: 'AI Monitoring', to: '/admin/ai', icon: Sparkles },
        { label: 'Referrals', to: '/admin/referrals', icon: ClipboardList },
        { label: 'Appointments', to: '/admin/appointments', icon: CalendarCheck2 },
      ],
    },
    {
      group: 'Governance',
      items: [
        { label: 'Reports', to: '/admin/reports', icon: FileText },
        { label: 'Audit Logs', to: '/admin/audit', icon: ClipboardList },
        { label: 'Security', to: '/admin/security', icon: Shield },
        { label: 'Settings', to: '/admin/settings', icon: Settings },
      ],
    },
  ],
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  if (!user) return null
  const groups = navConfig[user.role]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b px-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-[#7E51CE] font-display text-lg font-extrabold text-white">
          M
        </div>
        <div>
          <p className="font-display text-base font-extrabold leading-none tracking-tight">MEDAI</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Health Platform</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {groups.map((group) => (
          <div key={group.group} className="mb-5">
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{group.group}</p>
            <nav className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{user.role} {user.specialty ? `· ${user.specialty}` : ''}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleLogout} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}

export function MobileNav() {
  const { user } = useApp()
  const navigate = useNavigate()
  if (!user) return null
  const groups = navConfig[user.role]
  const primary = groups.flatMap((g) => g.items).slice(0, 5)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card lg:hidden">
      <div className="flex items-center justify-around px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {primary.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors', isActive ? 'text-primary' : 'text-muted-foreground')
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label.split(' ')[0]}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
