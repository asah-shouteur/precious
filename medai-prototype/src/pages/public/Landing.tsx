import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Thermometer,
  UserRound,
  Waves,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SectionHeading, InfoCard, StatBand } from '@/components/shared/PublicSections'
import { TrendChart } from '@/components/shared/charts'
import { buildSeries } from '@/data/telemetry'
import { StatusBadge } from '@/components/shared/StatusBadge'

const steps = [
  { icon: UserRound, title: '1 · Tell us your symptoms', text: 'Describe what you are feeling in a guided, structured health questionnaire.' },
  { icon: Activity, title: '2 · Live vitals stream in', text: 'Your ESP32 hub with MAX30102 & MLX90614 sensors feeds real-time vitals.' },
  { icon: BrainCircuit, title: '3 · AI generates a triage', text: 'The engine produces an AI-ASSISTED PRELIMINARY ASSESSMENT — never a diagnosis.' },
  { icon: Stethoscope, title: '4 · A doctor reviews & decides', text: 'Your care team confirms, adjusts or dismisses the assessment and plans next steps.' },
]

export default function Landing() {
  const hrSeries = buildSeries('heartRate', '24H')
  const spo2Series = buildSeries('spo2', '24H')

  return (
    <div>
      {/* HERO */}
      <section className="border-b bg-gradient-to-b from-lavender-50 via-background to-background">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-2">
          <div>
            <Badge variant="secondary" className="mb-5 gap-1.5 px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              MEDAI assists healthcare professionals — it does not replace doctors
            </Badge>
            <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Smarter diagnosis.
              <br />
              <span className="bg-gradient-to-r from-primary to-[#9A73DF] bg-clip-text text-transparent">Connected care.</span>
            </h1>
            <p className="mt-5 max-w-xl text-balance text-lg text-muted-foreground">
              MEDAI combines AI-assisted preliminary assessment, real-time IoT health monitoring and intelligent facility referrals into one secure platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/register">Get Started <ArrowRight /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/how-it-works">Explore How It Works</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> HIPAA-style privacy</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Clinician-in-the-loop</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> IoT telemetry</span>
            </div>
          </div>

          {/* Hero dashboard preview */}
          <div className="relative">
            <div className="rounded-2xl border bg-card p-5 shadow-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patient Dashboard</p>
                  <p className="font-display text-lg font-bold">Welcome back, Precious</p>
                </div>
                <StatusBadge tone="Moderate" />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { icon: HeartPulse, label: 'Heart Rate', value: '72', unit: 'BPM', tone: 'success' as const },
                  { icon: Waves, label: 'SpO₂', value: '98', unit: '%', tone: 'success' as const },
                  { icon: Thermometer, label: 'Temp', value: '36.7', unit: '°C', tone: 'success' as const },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <m.icon className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[10px] font-semibold uppercase">{m.label}</span>
                    </div>
                    <div className="mt-1.5 font-display text-xl font-extrabold">
                      {m.value}<span className="ml-0.5 text-xs font-medium text-muted-foreground">{m.unit}</span>
                    </div>
                    <span className={`mt-1 inline-block h-1.5 w-1.5 rounded-full bg-success`} />
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">Heart rate · 24H</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> LIVE
                  </span>
                </div>
                <TrendChart data={hrSeries} dataKey="heartRate" unit=" BPM" height={120} />
              </div>

              <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-4">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide">AI-ASSISTED PRELIMINARY ASSESSMENT</p>
                    <p className="mt-1 text-sm">
                      Possible condition: <span className="font-semibold">Respiratory infection</span> · Confidence <span className="font-semibold">82%</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Urgency: Moderate · Recommendation: Consult a healthcare professional.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-3 -top-3 hidden rounded-xl border bg-card px-3 py-2 shadow-lift md:block">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Zap className="h-4 w-4 text-success" /> 3 devices streaming
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <StatBand stats={[{ value: '12k+', label: 'Patients monitored' }, { value: '8k+', label: 'IoT devices' }, { value: '4.9/5', label: 'Clinician rating' }, { value: '99.9%', label: 'Uptime SLA' }]} />
      </section>

      {/* FEATURES */}
      <section className="border-y bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <SectionHeading center eyebrow="Platform" title="Everything your care journey needs" subtitle="A single, secure workspace for patients, clinicians, facilities and administrators." />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <InfoCard icon={<BrainCircuit />} title="AI-Assisted Preliminary Assessment" description="Symptom-guided triage combined with live vitals. Always labeled as preliminary and always reviewed by a clinician." />
            <InfoCard icon={<Activity />} title="IoT Health Monitoring" description="ESP32 hub with MAX30102 pulse oximetry and MLX90614 temperature sensing. Heart rate, SpO₂ and temperature trends in real time." />
            <InfoCard icon={<ClipboardList />} title="Intelligent Referral" description="Condition, urgency, specialty, facility capability, distance and availability drive smart referral recommendations." />
            <InfoCard icon={<Building2 />} title="Connected Facilities" description="Facilities publish capacity, departments and services so referrals land at the right place, at the right time." />
            <InfoCard icon={<CalendarCheck2 />} title="Appointments & Scheduling" description="Search doctors, view availability and book, reschedule or cancel in a few taps." />
            <InfoCard icon={<ShieldCheck />} title="Security & Privacy" description="Role-based access, encrypted communications, full audit logs and privacy-first defaults." />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <SectionHeading center eyebrow="Workflow" title="From symptoms to specialist care" subtitle="Four clear steps, with a human clinician in charge at every point." />
        <div className="grid gap-5 md:grid-cols-4">
          {steps.map((step) => (
            <div key={step.title} className="relative rounded-xl border bg-card p-6 shadow-card">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary"><step.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-display text-sm font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE TELEMETRY BAND */}
      <section className="border-y bg-gradient-to-r from-primary to-[#7E51CE]">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 text-white md:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Real-time IoT monitoring</p>
            <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight">Your vitals, streamed live from an ESP32 hub</h2>
            <p className="mt-4 max-w-lg text-balance text-white/80">
              MAX30102 captures heart rate and blood oxygen. MLX90614 measures temperature. MEDAI visualizes trends, flags abnormal readings and keeps your care team informed.
            </p>
            <Button size="lg" variant="secondary" className="mt-6" asChild>
              <Link to="/iot-monitoring">Explore IoT Monitoring <ArrowRight /></Link>
            </Button>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <p className="font-semibold">Oxygen saturation · 24H</p>
              <span className="inline-flex items-center gap-1.5 text-xs text-white/80"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />98% avg</span>
            </div>
            <div className="mt-3 rounded-xl bg-white/95 p-2">
              <TrendChart data={spo2Series} dataKey="spo2" unit="%" height={160} color="#22A55A" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center md:px-6">
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-extrabold tracking-tight md:text-4xl">Ready to put a doctor in your pocket?</h2>
        <p className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground">
          MEDAI never makes clinical decisions alone. Every AI output is a preliminary triage that a qualified clinician reviews.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild><Link to="/register">Create your account <ArrowRight /></Link></Button>
          <Button size="lg" variant="outline" asChild><Link to="/login">Sign in to a demo role</Link></Button>
        </div>
      </section>
    </div>
  )
}
