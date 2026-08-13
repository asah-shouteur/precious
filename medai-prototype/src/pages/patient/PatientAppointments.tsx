import { useState } from 'react'
import { CalendarCheck2, Loader2, MapPin, Search, Star, Video } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AppointmentCard } from '@/components/shared/AppointmentCard'
import { EmptyState } from '@/components/shared/StateComponents'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useApp } from '@/store/AppProvider'
import { api } from '@/services/api'
import { doctors, facilities, patients } from '@/data/entities'
import { appointments } from '@/data/clinical'
import { formatDate } from '@/lib/utils'
import type { Appointment, Doctor } from '@/types'
import { cn } from '@/lib/utils'

const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00']

function nextDays(n: number): string[] {
  const out: string[] = []
  const d = new Date()
  for (let i = 1; i <= n; i++) {
    d.setDate(d.getDate() + 1)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

export default function PatientAppointments() {
  const { user, toast } = useApp()
  const patient = patients.find((p) => p.id === user?.id) ?? patients[0]
  const myAppointments = appointments.filter((a) => a.patientId === patient.id)

  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [query, setQuery] = useState('')
  const [booking, setBooking] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [reason, setReason] = useState('General consultation')
  const [type, setType] = useState<'Consultation' | 'Follow-up' | 'Telehealth' | 'Diagnostic'>('Consultation')
  const [saving, setSaving] = useState(false)
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null)

  const filteredDoctors = doctors.filter((d) => {
    const q = query.toLowerCase()
    return d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.title.toLowerCase().includes(q)
  })

  const upcoming = myAppointments.filter((a) => a.status === 'Scheduled' || a.status === 'Confirmed')
  const past = myAppointments.filter((a) => a.status === 'Completed' || a.status === 'Cancelled')

  const doctorName = (id: string) => doctors.find((d) => d.id === id)?.name ?? 'Clinician'

  const confirmBooking = async () => {
    if (!booking || !selectedDate || !selectedTime) {
      toast({ title: 'Select date and time', description: 'Please choose an available slot.', variant: 'warning' })
      return
    }
    setSaving(true)
    try {
      await api.createAppointment({
        patientId: patient.id,
        doctorId: booking.id,
        facilityId: booking.facilityId,
        date: selectedDate,
        time: selectedTime,
        type,
        reason,
      })
      toast({ title: 'Appointment booked', description: `${booking.name} on ${formatDate(selectedDate)} at ${selectedTime.replace(':00', '')}.`, variant: 'success' })
      setBooking(null)
      setSelectedDate(null)
      setSelectedTime(null)
    } finally {
      setSaving(false)
    }
  }

  const confirmReschedule = async () => {
    if (!rescheduleTarget || !selectedDate || !selectedTime) return
    setSaving(true)
    await api.updateAppointment(rescheduleTarget.id, { date: selectedDate, time: selectedTime, status: 'Rescheduled' })
    setSaving(false)
    setRescheduleTarget(null)
    setSelectedDate(null)
    setSelectedTime(null)
    toast({ title: 'Appointment rescheduled', description: 'Your care team has been notified.', variant: 'success' })
  }

  const cancel = async (a: Appointment) => {
    await api.updateAppointment(a.id, { status: 'Cancelled' })
    toast({ title: 'Appointment cancelled', description: 'We have notified the practice.', variant: 'info' })
  }

  return (
    <div>
      <PageHeader title="Appointments" subtitle="Search doctors, check availability and manage your upcoming consultations.">
        <Button variant="outline" onClick={() => toast({ title: 'Video visit', description: 'Telehealth appointments are available for participating doctors.', variant: 'info' })}>
          <Video /> Telehealth
        </Button>
      </PageHeader>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'upcoming' | 'past')}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {tab === 'upcoming' ? (
            upcoming.length > 0 ? upcoming.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                doctorName={doctorName(a.doctorId)}
                doctorSpecialty={doctors.find((d) => d.id === a.doctorId)?.specialty}
                facilityName="St. Jude Medical Center"
                onReschedule={(appt) => { setRescheduleTarget(appt); setSelectedDate(null); setSelectedTime(null) }}
                onCancel={cancel}
              />
            )) : <EmptyState icon={CalendarCheck2} title="No upcoming appointments" description="Book a consultation with a doctor below." />
          ) : (
            past.length > 0 ? past.map((a) => (
              <AppointmentCard key={a.id} appointment={a} doctorName={doctorName(a.doctorId)} doctorSpecialty={doctors.find((d) => d.id === a.doctorId)?.specialty} facilityName="St. Jude Medical Center" />
            )) : <EmptyState icon={CalendarCheck2} title="No past appointments" description="Your history will appear here." />
          )}
        </div>

        {/* Doctor search */}
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by doctor, specialty..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="space-y-3">
            {filteredDoctors.map((d) => (
              <Card key={d.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold" style={{ background: `${d.photoColor}18`, color: d.photoColor }}>
                      {d.name.replace('Dr. ', '').split(' ').map((s) => s[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.title} · {d.specialty}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 font-semibold text-warning"><Star className="h-3 w-3 fill-current" />{d.rating}</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{d.status}</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setBooking(d)}>Book</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredDoctors.length === 0 && <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No doctors match.</div>}
          </div>
        </div>
      </div>

      {/* Booking dialog */}
      <Dialog open={!!booking} onOpenChange={(open) => { if (!open) setBooking(null) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book appointment</DialogTitle>
            <DialogDescription>
              {booking ? `${booking.name} · ${booking.specialty} at ${facilities.find((f) => f.id === booking.facilityId)?.name ?? 'our facility'}` : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Appointment type</Label>
              <div className="flex flex-wrap gap-2">
                {(['Consultation', 'Follow-up', 'Telehealth', 'Diagnostic'] as const).map((t) => (
                  <Badge key={t} variant={type === t ? 'default' : 'outline'} className={cn('cursor-pointer px-3 py-1.5', type !== t && 'text-muted-foreground')} onClick={() => setType(t)}>
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select a date</Label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {nextDays(7).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={cn(
                      'flex min-w-[76px] flex-col items-center rounded-lg border px-3 py-2 text-center transition-colors',
                      selectedDate === d ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                    )}
                  >
                    <span className="text-[11px] font-medium uppercase text-muted-foreground">{new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="font-display text-lg font-bold">{new Date(d).getDate()}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(d).toLocaleDateString('en-US', { month: 'short' })}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="space-y-2">
                <Label>Select a time</Label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={cn('rounded-lg border py-2 text-xs font-semibold transition-colors', selectedTime === t ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted')}
                    >
                      {t.replace(':00', '')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for visit</Label>
              <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Brief reason..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBooking(null)}>Cancel</Button>
            <Button onClick={confirmBooking} disabled={saving}>
              {saving && <Loader2 className="animate-spin" />} {saving ? 'Booking...' : 'Confirm booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule dialog */}
      <Dialog open={!!rescheduleTarget} onOpenChange={(open) => { if (!open) setRescheduleTarget(null) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reschedule appointment</DialogTitle>
            <DialogDescription>{rescheduleTarget ? `Currently: ${formatDate(rescheduleTarget.date)} at ${rescheduleTarget.time.replace(':00', '')}` : ''}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {nextDays(7).map((d) => (
                <button key={d} onClick={() => setSelectedDate(d)} className={cn('flex min-w-[72px] flex-col items-center rounded-lg border px-3 py-2', selectedDate === d ? 'border-primary bg-primary/5' : 'hover:bg-muted')}>
                  <span className="text-[10px] uppercase text-muted-foreground">{new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="font-display text-base font-bold">{new Date(d).getDate()}</span>
                </button>
              ))}
            </div>
            {selectedDate && (
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.slice(0, 12).map((t) => (
                  <button key={t} onClick={() => setSelectedTime(t)} className={cn('rounded-lg border py-2 text-xs font-semibold', selectedTime === t ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted')}>
                    {t.replace(':00', '')}
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleTarget(null)}>Cancel</Button>
            <Button onClick={confirmReschedule} disabled={saving || !selectedDate || !selectedTime}>{saving ? <Loader2 className="animate-spin" /> : null} Confirm reschedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
