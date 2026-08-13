import { useState } from 'react'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { PageHero } from '@/components/shared/PublicSections'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useApp } from '@/store/AppProvider'

export default function Contact() {
  const { toast } = useApp()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast({ title: 'Please complete the form', description: 'Name, email and message are required.', variant: 'warning' })
      return
    }
    setSent(true)
    toast({ title: 'Message sent', description: 'Our team will get back to you within one business day.', variant: 'success' })
  }

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Talk to the MEDAI team"
        subtitle="Questions about the platform, the demo or the project? We would love to hear from you."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-5">
            <ContactRow icon={<Mail />} title="Email" value="hello@medai.demo" />
            <ContactRow icon={<Phone />} title="Phone" value="+233 30 000 0000" />
            <ContactRow icon={<MapPin />} title="Address" value="Engineering Faculty, University of Ghana, Legon" />
            <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
              <p className="font-display font-bold text-foreground">Office hours</p>
              <p className="mt-2">Mon – Fri: 9:00 – 17:00 GMT</p>
              <p>Sat: 10:00 – 14:00 GMT</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-card md:p-8">
            {sent ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success"><Send className="h-6 w-6" /></div>
                <h2 className="mt-4 font-display text-xl font-bold">Thank you, {form.name.split(' ')[0] || 'friend'}!</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">Your message has been received. We typically reply within one business day.</p>
                <Button variant="outline" className="mt-6" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="jane@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={6} placeholder="Tell us more..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
                <Button type="submit" className="w-full sm:w-auto"><Send /> Send message</Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function ContactRow({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="mt-0.5 text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
