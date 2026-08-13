import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Eye, GraduationCap, HeartPulse, Lightbulb, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHero, SectionHeading, InfoCard, StatBand } from '@/components/shared/PublicSections'
import { Card, CardContent } from '@/components/ui/card'

export default function About() {
  return (
    <div>
      <PageHero
        eyebrow="About MEDAI"
        title="Built to assist clinicians, never to replace them"
        subtitle="MEDAI is an academic demonstration of a production-grade healthcare platform that brings AI triage, IoT monitoring and intelligent referrals into one secure workspace."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Our mission" title="Bridging remote monitoring and specialist care" />
            <div className="space-y-4 text-muted-foreground">
              <p>
                In many settings, the gap between when a patient feels unwell and when a specialist reviews their case can be measured in days. MEDAI shortens that gap with continuous vitals monitoring and structured AI triage — while keeping every clinical decision in the hands of qualified professionals.
              </p>
              <p>
                Patients get a clear picture of their health at home. Doctors get a prioritized queue with the data they need. Facilities get the referrals that match their capabilities. Administrators get visibility, security and auditability.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild><Link to="/register">Join MEDAI <ArrowRight /></Link></Button>
              <Button variant="outline" asChild><Link to="/how-it-works">See the workflow</Link></Button>
            </div>
          </div>
          <div className="grid gap-4">
            <InfoCard icon={<Target />} title="Clinician-in-the-loop by design" description="Every AI-ASSISTED PRELIMINARY ASSESSMENT requires a clinician to confirm, adjust or dismiss. AI output is never presented as a diagnosis." />
            <InfoCard icon={<Eye />} title="Radical transparency" description="Patients see exactly what the AI used, why it flagged what it did, and who reviewed the result — with clear labels throughout." />
            <InfoCard icon={<GraduationCap />} title="Built for learning" description="A complete engineering exercise in React, TypeScript, IoT simulation and responsible AI practice." />
          </div>
        </div>
      </section>

      <section className="border-y bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <SectionHeading center eyebrow="By the numbers" title="A platform that already looks the part" />
          <StatBand stats={[{ value: '4', label: 'User roles' }, { value: '9+', label: 'Clinical modules' }, { value: '40+', label: 'Screens' }, { value: '100%', label: 'Responsive' }]} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <SectionHeading eyebrow="Values" title="What we stand for" center />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: HeartPulse, title: 'Patient safety first', text: 'Abnormal readings trigger alerts before they become emergencies, and urgent cases always reach a human.' },
            { icon: Lightbulb, title: 'AI as a second opinion', text: 'The model proposes; the clinician disposes. Confidence scores and reasoning are always surfaced.' },
            { icon: BadgeCheck, title: 'Trust through audit', text: 'Every action from login to referral is logged, reviewable and attributable to an accountable actor.' },
          ].map((v) => (
            <Card key={v.title} className="card-hover">
              <CardContent className="p-6">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary"><v.icon className="h-5 w-5" /></div>
                <h3 className="mt-4 font-display text-base font-bold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
