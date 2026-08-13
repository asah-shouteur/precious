import { Badge } from '@/components/ui/badge'

type Tone = 'Low' | 'Moderate' | 'High' | 'Routine' | 'Urgent' | 'Info' | 'Success' | 'Warning' | 'Danger' | 'Pending' | 'Requested' | 'Reviewed' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled' | 'Scheduled' | 'Confirmed' | 'Rescheduled' | 'Active' | 'Inactive' | 'Connected' | 'Disconnected' | 'Low Battery' | 'Error' | 'Operational' | 'At Capacity' | 'Maintenance' | 'Available' | 'In Consultation' | 'On Leave' | 'Offline' | 'Normal' | 'Borderline' | 'Abnormal'

const toneMap: Record<Tone, { variant: 'success' | 'warning' | 'destructive' | 'info' | 'secondary' | 'muted' | 'default' | 'outline'; label: string }> = {
  Low: { variant: 'success', label: 'Low' },
  Moderate: { variant: 'warning', label: 'Moderate' },
  High: { variant: 'destructive', label: 'High' },
  Routine: { variant: 'info', label: 'Routine' },
  Urgent: { variant: 'destructive', label: 'Urgent' },
  Info: { variant: 'secondary', label: 'Info' },
  Success: { variant: 'success', label: 'Success' },
  Warning: { variant: 'warning', label: 'Warning' },
  Danger: { variant: 'destructive', label: 'Danger' },
  Pending: { variant: 'warning', label: 'Pending' },
  Requested: { variant: 'info', label: 'Requested' },
  Reviewed: { variant: 'secondary', label: 'Reviewed' },
  Accepted: { variant: 'success', label: 'Accepted' },
  'In Progress': { variant: 'info', label: 'In Progress' },
  Completed: { variant: 'success', label: 'Completed' },
  Cancelled: { variant: 'muted', label: 'Cancelled' },
  Scheduled: { variant: 'info', label: 'Scheduled' },
  Confirmed: { variant: 'success', label: 'Confirmed' },
  Rescheduled: { variant: 'warning', label: 'Rescheduled' },
  Active: { variant: 'success', label: 'Active' },
  Inactive: { variant: 'muted', label: 'Inactive' },
  Connected: { variant: 'success', label: 'Connected' },
  Disconnected: { variant: 'muted', label: 'Disconnected' },
  'Low Battery': { variant: 'warning', label: 'Low Battery' },
  Error: { variant: 'destructive', label: 'Error' },
  Operational: { variant: 'success', label: 'Operational' },
  'At Capacity': { variant: 'destructive', label: 'At Capacity' },
  Maintenance: { variant: 'warning', label: 'Maintenance' },
  Available: { variant: 'success', label: 'Available' },
  'In Consultation': { variant: 'warning', label: 'In Consultation' },
  'On Leave': { variant: 'muted', label: 'On Leave' },
  Offline: { variant: 'muted', label: 'Offline' },
  Normal: { variant: 'success', label: 'Normal' },
  Borderline: { variant: 'warning', label: 'Borderline' },
  Abnormal: { variant: 'destructive', label: 'Abnormal' },
}

interface StatusBadgeProps {
  tone: Tone | string
  label?: string
  dot?: boolean
  className?: string
}

export function StatusBadge({ tone, label, dot = true, className }: StatusBadgeProps) {
  const mapped = toneMap[tone as Tone] ?? { variant: 'secondary' as const, label: tone }
  return (
    <Badge variant={mapped.variant} dot={dot} className={className}>
      {label ?? mapped.label}
    </Badge>
  )
}
