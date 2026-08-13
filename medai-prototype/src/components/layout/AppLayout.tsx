import { useState, type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Bell, Menu, Search, WifiOff } from 'lucide-react'
import { Sidebar, MobileNav, navConfig } from './Sidebar'
import { useApp, useTelemetry } from '@/store/AppProvider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { initials, cn } from '@/lib/utils'
import { notifications } from '@/data/activity'

function unreadFor(userId: string): number {
  return notifications.filter((n) => n.userId === userId && !n.read).length
}

export function AppLayout({ outlet }: { outlet?: ReactNode }) {
  const { user, online } = useApp()
  const telemetry = useTelemetry()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return null
  const unread = unreadFor(user.id)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur md:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen((v) => !v)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative hidden w-full max-w-md md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search records, doctors, facilities..."
              className="h-9 w-full rounded-lg border bg-muted/50 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:bg-background"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {!online && (
              <Badge variant="destructive" className="hidden items-center gap-1 sm:inline-flex">
                <WifiOff className="h-3 w-3" /> Offline
              </Badge>
            )}
            <Badge
              variant={telemetry.connected ? 'success' : 'destructive'}
              className="hidden items-center gap-1 sm:inline-flex"
            >
              <span className={cn('h-1.5 w-1.5 rounded-full bg-current', telemetry.connected && 'animate-pulse')} />
              IoT {telemetry.connected ? 'Streaming' : 'Disconnected'}
            </Badge>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <a href={`/${user.role}/notifications`}>
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </a>
            </Button>
            <a href={`/${user.role}/settings`} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold leading-none">{user.name}</p>
                <p className="mt-0.5 text-[11px] capitalize leading-none text-muted-foreground">{user.role}</p>
              </div>
            </a>
          </div>
        </header>

        {mobileOpen && (
          <div className="border-b bg-card px-4 py-2 lg:hidden">
            <MobileSideNav onNavigate={() => setMobileOpen(false)} />
          </div>
        )}

        <main className="flex-1 px-4 pb-24 pt-6 md:px-6 lg:pb-8">
          <div className="mx-auto max-w-[1200px]">{outlet ?? <Outlet />}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}

function MobileSideNav({ onNavigate }: { onNavigate: () => void }) {
  const { user } = useApp()
  if (!user) return null
  const groups = navConfig[user.role]
  return (
    <div className="space-y-4 py-2">
      {groups.map((group) => (
        <div key={group.group}>
          <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{group.group}</p>
          <div className="grid grid-cols-2 gap-1">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium',
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
