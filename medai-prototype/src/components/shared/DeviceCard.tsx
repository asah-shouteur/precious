import { Battery, BatteryLow, Signal, Wifi, WifiOff, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { Progress } from '@/components/ui/progress'
import type { Device } from '@/types'
import { cn } from '@/lib/utils'

const deviceIcons = {
  hub: Wifi,
  'pulse-oximeter': Zap,
  thermometer: Battery,
}

export function DeviceCard({ device, detailed = false }: { device: Device; detailed?: boolean }) {
  const Icon = deviceIcons[device.type] ?? Zap
  const lowBattery = device.battery < 20
  return (
    <Card className={cn('p-4 card-hover', device.status === 'Disconnected' && 'border-destructive/30 bg-destructive/5', device.status === 'Low Battery' && 'border-warning/30')}>
      <div className="flex items-start gap-3">
        <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-lg', device.status === 'Connected' ? 'bg-primary/10 text-primary' : device.status === 'Low Battery' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground')}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">{device.name}</p>
            <StatusBadge tone={device.status} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {device.model} · {device.sensor}
          </p>
          {detailed && (
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <p>Firmware: <span className="font-medium text-foreground">{device.firmware}</span></p>
              <p>MAC: <span className="font-mono">{device.mac}</span></p>
              <p>Last sync: <span className="font-medium text-foreground">{device.lastSync}</span></p>
            </div>
          )}
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {lowBattery ? <BatteryLow className="h-4 w-4 text-destructive" /> : <Battery className="h-4 w-4 text-muted-foreground" />}
              <Progress value={device.battery} className={cn('h-1.5 w-14', lowBattery ? 'bg-destructive/20' : '')} />
              <span className={cn('text-xs font-medium', lowBattery && 'text-destructive')}>{device.battery}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Signal className={cn('h-4 w-4', device.signal > 70 ? 'text-success' : device.signal > 35 ? 'text-warning' : 'text-destructive')} />
              <span className="text-xs text-muted-foreground">{device.signal > 0 ? `${device.signal}%` : '—'}</span>
            </div>
            {device.status === 'Disconnected' && <WifiOff className="h-4 w-4 text-destructive" />}
          </div>
        </div>
      </div>
    </Card>
  )
}
