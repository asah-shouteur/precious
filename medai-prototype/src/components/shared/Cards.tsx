import { Link } from 'react-router-dom'
import { BadgeCheck, Building2, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatusBadge } from './StatusBadge'
import { Button } from '@/components/ui/button'
import { initials } from '@/lib/utils'
import type { Doctor } from '@/types'
import { cn } from '@/lib/utils'

export function DoctorCard({ doctor, onBook }: { doctor: Doctor; onBook?: (doctor: Doctor) => void }) {
  return (
    <Card className="overflow-hidden card-hover">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback style={{ background: `${doctor.photoColor}18`, color: doctor.photoColor }} className="text-sm">
              {initials(doctor.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-display text-sm font-bold">{doctor.name}</p>
              {doctor.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-info" />}
            </div>
            <p className="text-xs text-muted-foreground">{doctor.title} · {doctor.specialty}</p>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-warning">
                <Star className="h-3.5 w-3.5 fill-current" /> {doctor.rating}
              </span>
              <span className="text-muted-foreground">({doctor.reviews})</span>
              <span className="text-muted-foreground">· {doctor.yearsExperience} yrs exp</span>
            </div>
          </div>
          <StatusBadge tone={doctor.status} label={doctor.status === 'Available' ? 'Available' : doctor.status} />
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span className="truncate">{doctor.facilityId === 'fac_1' ? 'St. Jude Medical Center' : 'Network Facility'}</span>
        </div>

        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{doctor.bio}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {doctor.languages.slice(0, 3).map((lang) => (
            <span key={lang} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {lang}
            </span>
          ))}
        </div>

        {onBook && (
          <Button
            size="sm"
            variant="outline"
            className="mt-4 w-full"
            onClick={() => onBook(doctor)}
          >
            Book Appointment
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function FacilityCard({ facility, to }: { facility: { id: string; name: string; type: string; city: string; distanceKm: number; rating: number; status: string; emergency: boolean; specialties: string[] }; to?: string }) {
  const Comp: any = to ? Link : 'div'
  return (
    <Comp to={to ?? undefined} className="block">
      <Card className="card-hover h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-display text-sm font-bold">{facility.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{facility.type} · {facility.city}</p>
            </div>
            <StatusBadge tone={facility.status} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-semibold text-warning">
              <Star className="h-3.5 w-3.5 fill-current" /> {facility.rating}
            </span>
            <span>📍 {facility.distanceKm} km</span>
            {facility.emergency && <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-semibold text-destructive">24/7 ER</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {facility.specialties.slice(0, 3).map((s) => (
              <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {s}
              </span>
            ))}
            {facility.specialties.length > 3 && (
              <span className={cn('rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground')}>
                +{facility.specialties.length - 3}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Comp>
  )
}
