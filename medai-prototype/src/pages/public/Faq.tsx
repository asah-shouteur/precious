import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { PageHero } from '@/components/shared/PublicSections'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: 'Is the AI assessment a medical diagnosis?',
    a: 'No. Every AI output is labelled an AI-ASSISTED PRELIMINARY ASSESSMENT. It is a triage aid that must be reviewed by a clinician. MEDAI assists healthcare professionals — it does not replace doctors.',
  },
  {
    q: 'How does the IoT monitoring hardware work?',
    a: 'An ESP32 hub collects data from two sensors: the MAX30102 measures heart rate and SpO₂, and the MLX90614 measures body temperature. The hub syncs readings to your dashboard over Wi-Fi.',
  },
  {
    q: 'How are referrals ranked?',
    a: 'The matching engine scores facilities on six signals: condition, urgency, specialty match, facility capability, distance and live availability/wait time.',
  },
  {
    q: 'Who can see my medical records?',
    a: 'Only your named care team at facilities involved in your care, plus administrators for compliance and audit purposes. Every access is logged in the audit trail.',
  },
  {
    q: 'Can I cancel or reschedule an appointment?',
    a: 'Yes. Scheduled appointments can be rescheduled to another available slot or cancelled from the Appointments screen. Confirmed appointments require a quick confirmation step.',
  },
  {
    q: 'What happens when a device disconnects?',
    a: 'The dashboard marks the device as Disconnected, shows the last synchronization time, and raises a device notification so stale data is never mistaken for fresh readings.',
  },
  {
    q: 'Is this a real production system?',
    a: 'MEDAI is a fully functional academic demonstration with a realistic mock data layer. It is not intended for real clinical use and is clearly labelled as such.',
  },
]

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div>
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        subtitle="Everything you need to know about MEDAI, its AI, its IoT hardware and your data."
      />

      <section className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-xl border bg-card">
              <button
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-display text-sm font-bold">{f.q}</span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open === i && 'rotate-180')} />
              </button>
              {open === i && <div className="border-t px-5 py-4 text-sm leading-relaxed text-muted-foreground">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
