import { Lock, KeyRound, ShieldCheck, Fingerprint, Database, FileLock2 } from 'lucide-react'
import { PageHero, SectionHeading } from '@/components/shared/PublicSections'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const pillars = [
  { icon: Lock, title: 'Encryption in transit & at rest', body: 'All telemetry, records and messages are encrypted end to end. Data at rest is AES-256 encrypted.' },
  { icon: KeyRound, title: 'Role-based access control', body: 'Patients, doctors, facilities and administrators each see only what their role authorises — enforced on every screen.' },
  { icon: Fingerprint, title: 'Multi-factor authentication', body: 'Named clinician accounts require MFA for sensitive actions such as record changes and referral approvals.' },
  { icon: Database, title: 'Full audit trail', body: 'Every login, telemetry upload, AI inference and referral transition is logged with actor, timestamp and IP.' },
  { icon: FileLock2, title: 'Consent-first privacy', body: 'IoT monitoring only starts after explicit consent. Patients can revoke data sharing at any time.' },
  { icon: ShieldCheck, title: 'No data for model training', body: 'Patient data is never used to train third-party models. AI inferences are recorded, reviewed and retained responsibly.' },
]

export default function Security() {
  return (
    <div>
      <PageHero
        eyebrow="Security & Privacy"
        title="Trust is the platform"
        subtitle="MEDAI applies healthcare-grade security controls and privacy-first defaults to every layer of the system."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <Card key={p.title} className="card-hover">
              <CardContent className="p-6">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary"><p.icon className="h-5 w-5" /></div>
                <h3 className="mt-4 font-display text-base font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <SectionHeading center eyebrow="Compliance posture" title="Built for responsible health data handling" />
          <div className="mx-auto grid max-w-3xl gap-4">
            {[
              'Aligned with privacy principles comparable to HIPAA/GDPR for an academic demonstration.',
              'Minimal-data principle: only vitals and symptoms required for triage are collected.',
              'Anonymised audit analytics — no raw patient identifiers in operational dashboards.',
              'Explicit disclaimers throughout: AI output is preliminary and clinician-reviewed.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border bg-card p-4 text-sm">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Badge variant="secondary" className="px-4 py-2">MEDAI assists healthcare professionals — it does not replace doctors.</Badge>
          </div>
        </div>
      </section>
    </div>
  )
}
