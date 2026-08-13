import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { Appointment } from '@/types'

interface AppointmentCardProps {
  appointment: Appointment
  doctorName?: string
  doctorSpecialty?: string
  facilityName?: string
  onReschedule?: (a: Appointment) => void
  onCancel?: (a: Appointment) => void
}

export function AppointmentCard({ appointment, doctorName, doctorSpecialty, facilityName, onReschedule, onCancel }: AppointmentCardProps) {
  const past = new Date(appointment.date) < new Date(new Date().toDateString())
  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold">{doctorName ?? appointment.doctorId}</p>
            <p className="text-xs text-muted-foreground">{doctorSpecialty ?? 'Medical'} · {appointment.type}</p>
          </div>
          <StatusBadge tone={appointment.status} />
        </div>
        <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{appointment.reason}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-primary" /> {formatDate(appointment.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" /> {appointment.time.replace(':00', '')}
          </span>
          {facilityName && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {facilityName}
            </span>
          )}
        </div>
        {(appointment.status === 'Scheduled' || appointment.status === 'Confirmed') && !past && (
          <div className="mt-3 flex gap-2">
            {onReschedule && (
              <Button size="sm" variant="outline" onClick={() => onReschedule(appointment)}>
                Reschedule
              </Button>
            )}
            {onCancel && (
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onCancel(appointment)}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
