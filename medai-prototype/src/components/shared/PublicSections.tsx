import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageHero({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children?: ReactNode }) {
  return (
    <section className="border-b bg-gradient-to-b from-lavender-50 to-background">
      <div className="mx-auto max-w-6xl px-4 py-14 text-center md:px-6 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-balance text-3xl font-extrabold tracking-tight md:text-5xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">{subtitle}</p>
        {children}
      </div>
    </section>
  )
}

export function SectionHeading({ eyebrow, title, subtitle, center, className }: { eyebrow?: string; title: string; subtitle?: string; center?: boolean; className?: string }) {
  return (
    <div className={cn('mb-8 max-w-2xl', center && 'mx-auto text-center', className)}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>}
      <h2 className="mt-2 text-balance text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2>
      {subtitle && <p className="mt-3 text-balance text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

export function InfoCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="card-hover rounded-xl border bg-card p-6 shadow-card">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-4 font-display text-base font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

export function StatBand({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border bg-card p-5 text-center">
          <p className="font-display text-3xl font-extrabold tracking-tight text-primary">{s.value}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
