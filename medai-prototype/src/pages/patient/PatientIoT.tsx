import { useState } from 'react'
import { Activity, Battery, HeartPulse, RefreshCw, Signal, Thermometer, Waves, WifiOff } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HealthMetricCard } from '@/components/shared/HealthMetricCard'
import { DeviceCard } from '@/components/shared/DeviceCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TrendChart } from '@/components/shared/charts'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useApp, useTelemetry } from '@/store/AppProvider'
import { iot } from '@/services/iot'
import { buildSeries, vitalsStatus, thresholds } from '@/data/telemetry'
import { patients } from '@/data/entities'
import { iotAlerts } from '@/data/activity'
import { cn } from '@/lib/utils'

type Range = '24H' | '7D' | '30D'

export default function PatientIoT() {
  const { user, toast } = useApp()
  const telemetry = useTelemetry()
  const patient = patients.find((p) => p.id === user?.id) ?? patients[0]
  const [range, setRange] = useState<Range>('24H')
  const [offlineMode, setOfflineMode] = useState(false)

  const series = buildSeries('heartRate', range).map((_, i) => ({
    t: buildSeries('heartRate', range)[i].t,
    heartRate: buildSeries('heartRate', range)[i].heartRate,
    spo2: buildSeries('spo2', range)[i].spo2,
    temperature: buildSeries('temperature', range)[i].temperature,
  }))

  const myDevices = telemetry.devices.filter((d) => d.ownerId === patient.id)
  const connectedCount = myDevices.filter((d) => d.status === 'Connected').length

  const toggleConnection = () => {
    const next = !offlineMode
    setOfflineMode(next)
    iot.setConnected(!next)
    toast(next
      ? { title: 'Simulating device disconnection', description: 'Dashboard now shows disconnected states and stale-data handling.', variant: 'warning' }
      : { title: 'Devices reconnected', description: 'Telemetry stream restored.', variant: 'success' })
  }

  const batteryTotal = myDevices.reduce((sum, d) => sum + d.battery, 0)
  const avgBattery = myDevices.length ? Math.round(batteryTotal / myDevices.length) : 0

  const activeAlerts = iotAlerts.filter((a) => a.patientId === patient.id && !a.acknowledged)

  return (
    <div>
      <PageHeader
        title="IoT Health Monitoring"
        subtitle="Real-time telemetry from your ESP32 hub — MAX30102 pulse oximeter & MLX90614 thermometer."
      >
        <Button variant={offlineMode ? 'destructive' : 'outline'} onClick={toggleConnection}>
          <WifiOff /> {offlineMode ? 'Reconnect devices' : 'Simulate disconnection'}
        </Button>
        <Button variant="outline" onClick={() => toast({ title: 'Telemetry refreshed', description: 'Live data stream confirmed.', variant: 'info' })}>
          <RefreshCw /> Sync now
        </Button>
      </PageHeader>

      {!offlineMode && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-success/25 bg-success/5 px-4 py-3 text-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
          <span className="font-medium">Live stream active</span>
          <span className="text-muted-foreground">· {connectedCount}/{myDevices.length} devices connected · Last sync: {telemetry.lastSync ? 'just now' : '—'}</span>
        </div>
      )}

      {offlineMode && (
        <Alert variant="destructive" className="mb-4">
          <WifiOff />
          <AlertTitle>Devices disconnected</AlertTitle>
          <AlertDescription>Telemetry is paused. Readings shown below are the last known values from the last synchronization.</AlertDescription>
        </Alert>
      )}

      {activeAlerts.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <Activity />
          <AlertTitle>{activeAlerts.length} abnormal reading{activeAlerts.length > 1 ? 's' : ''} detected</AlertTitle>
          <AlertDescription>
            {activeAlerts.map((a) => `${a.metric === 'spo2' ? 'SpO₂' : a.metric === 'heartRate' ? 'Heart rate' : 'Temperature'} ${a.value}${a.metric === 'temperature' ? '°C' : a.metric === 'spo2' ? '%' : ' BPM'} — ${a.message}`).join(' · ')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <HealthMetricCard label="Heart Rate" value={telemetry.vitals.heartRate} unit="BPM" status={vitalsStatus(telemetry.vitals, 'heartRate')} icon={<HeartPulse />} live trend={`Normal ${thresholds.heartRate.low}–${thresholds.heartRate.high} BPM`} />
        <HealthMetricCard label="SpO₂" value={telemetry.vitals.spo2} unit="%" status={vitalsStatus(telemetry.vitals, 'spo2')} icon={<Waves />} live trend={`Normal ≥${thresholds.spo2.low}%`} />
        <HealthMetricCard label="Temperature" value={telemetry.vitals.temperature.toFixed(1)} unit="°C" status={vitalsStatus(telemetry.vitals, 'temperature')} icon={<Thermometer />} live trend={`Normal ${thresholds.temperature.low}–${thresholds.temperature.high}°C`} />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle className="text-base">Health trends</CardTitle>
          <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
            <TabsList>
              {(['24H', '7D', '30D'] as Range[]).map((r) => <TabsTrigger key={r} value={r}>{r}</TabsTrigger>)}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-3">
            {([
              { label: 'Heart Rate', key: 'heartRate', color: '#5737A8', unit: ' BPM' },
              { label: 'SpO₂', key: 'spo2', color: '#22A55A', unit: '%' },
              { label: 'Temperature', key: 'temperature', color: '#F59E0B', unit: '°C' },
            ] as const).map((c) => (
              <div key={c.key} className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</p>
                  <StatusBadge tone={vitalsStatus(telemetry.vitals, c.key)} />
                </div>
                <div className="mt-3">
                  <TrendChart data={series} dataKey={c.key} height={140} color={c.color} unit={c.unit} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Connected devices</CardTitle>
            <span className="text-xs text-muted-foreground">{connectedCount} streaming</span>
          </CardHeader>
          <CardContent className="space-y-3">
            {myDevices.map((d) => (
              <DeviceCard key={d.id} device={d} detailed />
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Hub status</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border p-4 text-center">
                  <Battery className={cn('mx-auto h-5 w-5', avgBattery < 20 ? 'text-destructive' : 'text-success')} />
                  <p className="mt-2 font-display text-xl font-bold">{avgBattery}%</p>
                  <p className="text-[11px] text-muted-foreground">Avg battery</p>
                </div>
                <div className="rounded-xl border p-4 text-center">
                  <Signal className={cn('mx-auto h-5 w-5', telemetry.connected ? 'text-success' : 'text-destructive')} />
                  <p className="mt-2 font-display text-xl font-bold">{telemetry.connected ? 'Live' : 'Offline'}</p>
                  <p className="text-[11px] text-muted-foreground">Connection</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Firmware</span><span className="font-mono font-medium text-foreground">v2.4.1</span></div>
                <div className="flex justify-between"><span>Hub MAC</span><span className="font-mono font-medium text-foreground">24:6F:28:7A:B4:12</span></div>
                <div className="flex justify-between"><span>Telemetry interval</span><span className="font-medium text-foreground">4 seconds</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Recent alerts</CardTitle></CardHeader>
            <CardContent>
              {iotAlerts.filter((a) => a.patientId === patient.id).slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-start gap-3 border-b py-2.5 text-xs last:border-0">
                  <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', a.severity === 'High' ? 'bg-destructive' : a.severity === 'Moderate' ? 'bg-warning' : 'bg-info')} />
                  <div>
                    <p className="font-medium">{a.message}</p>
                    <p className="text-muted-foreground">{new Date(a.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' })}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
