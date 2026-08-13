import { useState } from 'react'
import { Activity, HeartPulse, Thermometer, Waves } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { HealthMetricCard } from '@/components/shared/HealthMetricCard'
import { TrendChart } from '@/components/shared/charts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp, useTelemetry } from '@/store/AppProvider'
import { patients, doctors } from '@/data/entities'
import { iotAlerts } from '@/data/activity'
import { buildSeries, vitalsStatus, thresholds } from '@/data/telemetry'
import { cn } from '@/lib/utils'

type Range = '24H' | '7D' | '30D'

export default function DoctorIoT() {
  const { user } = useApp()
  const telemetry = useTelemetry()
  const me = doctors.find((d) => d.id === user?.id) ?? doctors[0]
  const myPatients = patients.filter((p) => p.primaryPhysicianId === me.id)

  const [patientId, setPatientId] = useState(myPatients[0]?.id)
  const [range, setRange] = useState<Range>('24H')

  const patient = myPatients.find((p) => p.id === patientId) ?? myPatients[0]
  const series = buildSeries('heartRate', range)

  const alerts = iotAlerts.filter((a) => a.patientId === patient?.id)

  return (
    <div>
      <PageHeader title="Patient IoT Monitoring" subtitle="Live ESP32 telemetry across your assigned patients." />

      <div className="mb-5 flex flex-wrap gap-2">
        {myPatients.map((p) => (
          <Button key={p.id} variant={patient?.id === p.id ? 'default' : 'outline'} size="sm" onClick={() => setPatientId(p.id)}>
            {p.name}
          </Button>
        ))}
      </div>

      {patient && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <HealthMetricCard label="Heart Rate" value={telemetry.vitals.heartRate} unit="BPM" status={vitalsStatus(patient.vitals, 'heartRate')} icon={<HeartPulse />} live trend={`Normal ${thresholds.heartRate.low}–${thresholds.heartRate.high}`} />
            <HealthMetricCard label="SpO₂" value={telemetry.vitals.spo2} unit="%" status={vitalsStatus(patient.vitals, 'spo2')} icon={<Waves />} live trend={`Normal ≥${thresholds.spo2.low}%`} />
            <HealthMetricCard label="Temperature" value={patient.vitals.temperature.toFixed(1)} unit="°C" status={vitalsStatus(patient.vitals, 'temperature')} icon={<Thermometer />} live trend={`Normal ${thresholds.temperature.low}–${thresholds.temperature.high}°C`} />
          </div>

          <Card className="mt-6">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <CardTitle className="text-base">Trends — {patient.name}</CardTitle>
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
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</p>
                    <div className="mt-3">
                      <TrendChart data={series} dataKey={c.key} height={150} color={c.color} unit={c.unit} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Abnormal readings — {patient.name}</CardTitle>
              <Badge variant={alerts.some((a) => !a.acknowledged) ? 'destructive' : 'outline'}>
                {alerts.filter((a) => !a.acknowledged).length} unacknowledged
              </Badge>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No abnormal readings recorded.</p>
              ) : (
                <div className="space-y-3">
                  {alerts.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 rounded-xl border p-3.5">
                      <Activity className={cn('h-5 w-5 shrink-0', a.severity === 'High' ? 'text-destructive' : a.severity === 'Moderate' ? 'text-warning' : 'text-info')} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{a.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.metric === 'spo2' ? 'SpO₂' : a.metric === 'heartRate' ? 'Heart rate' : 'Temperature'} {a.value}{a.metric === 'temperature' ? '°C' : a.metric === 'spo2' ? '%' : ' BPM'} · threshold {a.threshold} · {a.createdAt.slice(0, 10)}
                        </p>
                      </div>
                      <StatusBadge tone={a.severity} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
