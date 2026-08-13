import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'About', to: '/about' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'AI Assessment', to: '/ai-assessment' },
  { label: 'IoT Monitoring', to: '/iot-monitoring' },
  { label: 'Referrals', to: '/referrals' },
  { label: 'Facilities', to: '/facilities' },
  { label: 'Security', to: '/security' },
  { label: 'FAQ', to: '/faq' },
]

export function PublicLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 glass-nav border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-[#7E51CE] font-display text-lg font-extrabold text-white">
              M
            </div>
            <div>
              <p className="font-display text-base font-extrabold leading-none tracking-tight">MEDAI</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Health Platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" onClick={() => navigate('/login')}>Sign in</Button>
            <Button onClick={() => navigate('/register')}>Get Started</Button>
          </div>

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {open && (
          <div className="border-t bg-background px-4 py-3 lg:hidden">
            <nav className="grid gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn('rounded-lg px-3 py-2 text-sm font-medium', isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setOpen(false); navigate('/login') }}>Sign in</Button>
                <Button className="flex-1" onClick={() => { setOpen(false); navigate('/register') }}>Get Started</Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-base font-extrabold text-white">M</div>
            <span className="font-display text-lg font-extrabold">MEDAI</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            AI-powered medical diagnosis & intelligent referral platform with IoT health monitoring.
          </p>
          <p className="mt-3 rounded-lg bg-warning/10 p-2.5 text-xs font-medium text-foreground">
            MEDAI assists healthcare professionals — it does not replace doctors.
          </p>
        </div>
        <FooterCol title="Platform" links={[{ label: 'About', to: '/about' }, { label: 'How It Works', to: '/how-it-works' }, { label: 'AI Assessment', to: '/ai-assessment' }, { label: 'Facilities', to: '/facilities' }]} />
        <FooterCol title="Clinical" links={[{ label: 'IoT Monitoring', to: '/iot-monitoring' }, { label: 'Intelligent Referral', to: '/referrals' }, { label: 'Security & Privacy', to: '/security' }, { label: 'FAQ', to: '/faq' }]} />
        <FooterCol title="Access" links={[{ label: 'Patient Login', to: '/login' }, { label: 'Doctor Login', to: '/login' }, { label: 'Facility Login', to: '/login' }, { label: 'Admin Console', to: '/login' }]} />
      </div>
      <div className="border-t py-4">
        <p className="px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MEDAI Health Platform. Academic demonstration project. Not for clinical use.
        </p>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
