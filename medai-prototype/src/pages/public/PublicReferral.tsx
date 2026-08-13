import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Sparkles, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHero, SectionHeading } from '@/components/shared/PublicSections'
import { ReferralCard, ReferralWorkflow } from '@/components/shared/ReferralCard'
import { referrals } from '@/data/clinical'

const factors = [
  { label: 'Condition', icon: Sparkles, body: 'The specific condition and suspected severity drive which specialty is needed.' },
  { label: 'Urgency', icon: Timer, body: 'Routine, moderate and urgent cases are routed and prioritized differently.' },
  { label: 'Specialty', icon: Sparkles, body: 'Referrals only go to facilities that genuinely offer the required specialty.' },
  { label: 'Facility capability', icon: Sparkles, body: 'Available departments, diagnostics and ICU capability are matched against the case.' },
  { label: 'Distance', icon: MapPin, body: 'For urgent cases, closer matters. The engine weighs travel time into the ranking.' },
  { label: 'Availability', icon: Timer, body: 'Live capacity and wait times ensure referrals land where care can actually begin.' },
]

export default function PublicReferral() {
  return (
    <div>
      <PageHero
        eyebrow="Intelligent Referral"
        title="The right specialist, the right facility, right away"
        subtitle="Referrals are ranked by condition, urgency, specialty, facility capability, distance and availability — then tracked through a transparent workflow."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <SectionHeading center eyebrow="Matching engine" title="Six signals, one smart recommendation" />
        <div className="grid gap-5 md:grid-cols-3">
          {factors.map((f) => (
            <div key={f.label} className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><f.icon className="h-4 w-4" /></div>
                <h3 className="font-display text-sm font-bold">{f.label}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <SectionHeading center eyebrow="Workflow" title="From request to completion" />
          <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 shadow-card">
            <ReferralWorkflow status="In Progress" />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Requested → Reviewed → Accepted → In Progress → Completed. Every transition is timestamped, attributed and visible to the patient.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <SectionHeading center eyebrow="Live example" title="Recent referrals" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {referrals.slice(0, 3).map((r) => (
            <ReferralCard key={r.id} referral={r} match={r.aiSuggested} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button size="lg" asChild><Link to="/register">Experience the referral flow <ArrowRight /></Link></Button>
        </div>
      </section>
    </div>
  )
}
