import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  ClipboardList,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHero, SectionHeading } from '@/components/shared/PublicSections'

const flows = [
  {
    icon: UserRound,
    step: '01',
    title: 'Patient describes symptoms',
    body: 'The guided questionnaire collects symptoms, duration and context in plain language — nothing technical required.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Activity,
    step: '02',
    title: 'IoT vitals are attached',
    body: 'The ESP32 hub (MAX30102 + MLX90614) streams heart rate, SpO₂ and temperature into the assessment context.',
    color: 'bg-info/10 text-info',
  },
  {
    icon: BrainCircuit,
    step: '03',
    title: 'AI-ASSISTED PRELIMINARY ASSESSMENT',
    body: 'The engine scores possible conditions with confidence and urgency. Output is labelled preliminary and never treated as diagnosis.',
    color: 'bg-warning/10 text-warning',
  },
  {
    icon: Stethoscope,
    step: '04',
    title: 'Clinician review',
    body: 'A doctor confirms, adjusts or dismisses the AI output and records the confirmed clinical assessment.',
    color: 'bg-success/10 text-success',
  },
  {
    icon: ClipboardList,
    step: '05',
    title: 'Intelligent referral',
    body: 'If specialist care is needed, MEDAI ranks facilities by specialty, capability, distance and availability — then tracks the referral end to end.',
    color: 'bg-primary/10 text-primary',
  },
]

export default function HowItWorks() {
  return (
    <div>
      <PageHero
        eyebrow="How It Works"
        title="A clear path from symptom to specialist"
        subtitle="Five stages, one shared record — with a human clinician in control of every medical decision."
      />

      <section className="mx-auto max-w-4xl px-4 py-16 md:px-6">
        <div className="space-y-6">
          {flows.map((f, i) => (
            <div key={f.step} className="relative flex gap-5 rounded-2xl border bg-card p-6 shadow-card">
              {i < flows.length - 1 && <span className="absolute left-[42px] top-20 h-[calc(100%-40px)] w-px bg-border" />}
              <div className={`z-10 grid h-14 w-14 shrink-0 place-items-center rounded-xl ${f.color}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold text-muted-foreground/60">{f.step}</span>
                  <h2 className="font-display text-lg font-bold">{f.title}</h2>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <SectionHeading center eyebrow="Guardrails" title="How we keep AI honest" />
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Always labelled preliminary', body: 'AI output carries the AI-ASSISTED PRELIMINARY ASSESSMENT label and a confidence score, never the weight of a diagnosis.' },
              { icon: Stethoscope, title: 'Mandatory clinician sign-off', body: 'No AI assessment reaches a record or referral without a named clinician reviewing it.' },
              { icon: Activity, title: 'Thresholds that escalate', body: 'Abnormal readings generate alerts and, when critical, route the patient to urgent review automatically.' },
            ].map((g) => (
              <div key={g.title} className="rounded-xl border bg-card p-6">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary"><g.icon className="h-5 w-5" /></div>
                <h3 className="mt-4 font-display text-base font-bold">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Badge variant="warning" className="px-4 py-2 text-sm">MEDAI assists healthcare professionals — it does not replace doctors.</Badge>
          </div>
          <div className="mt-6 text-center">
            <Button size="lg" asChild><Link to="/register">Try the workflow <ArrowRight /></Link></Button>
          </div>
        </div>
      </section>
    </div>
  )
}
