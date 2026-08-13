import { useState } from 'react'
import { HeartPulse, Thermometer, Waves } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { HealthMetricCard } from '@/components/shared/HealthMetricCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TrendChart, MultiLineChart } from '@/components/shared/charts'
import { useTelemetry } from '@/store/AppProvider'
import { buildSeries, vitalsStatus, thresholds } from '@/data/telemetry'
import { patients } from '@/data/entities'
import { useApp } from '@/store/AppProvider'

export default function PatientHealthMetrics() {
  const { user } = useApp()
  const telemetry = useTelemetry()
  const patient = patients.find((p) => p.id === user?.id) ?? patients[0]

  const [range, setRange] = useState<'24H' | '7D' | '30D'>('24H')

  const ranges: ('24H' | '7D' | '30D')[] = ['24H', '7D', '30D']
  const series = buildSeries('heartRate', range).map((p, i) => {
    const base = buildSeries('heartRate', range)
    return { t: p.t, heartRate: base[i].heartRate, spo2: buildSeries('spo2', range)[i].spo2, temperature: buildSeries('temperature', range)[i].temperature }
  })

  const metrics = [
    { label: 'Heart Rate', value: telemetry.vitals.heartRate, unit: 'BPM', status: vitalsStatus(telemetry.vitals, 'heartRate'), icon: <HeartPulse />, color: '#5737A8' },
    { label: 'Oxygen Saturation', value: telemetry.vitals.spo2, unit: '%', status: vitalsStatus(telemetry.vitals, 'spo2'), icon: <Waves />, color: '#22A55A' },
    { label: 'Temperature', value: telemetry.vitals.temperature.toFixed(1), unit: '°C', status: vitalsStatus(telemetry.vitals, 'temperature'), icon: <Thermometer />, color: '#F59E0B' },
  ]

  const rangeLabel = { '24H': '24 hours', '7D': '7 days', '30D': '30 days' }[range]

  return (
    <div>
      <PageHeader title="Health metrics" subtitle="Your vital sign trends, thresholds and history over time." />

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((m) => (
          <HealthMetricCard key={m.label} label={m.label} value={m.value} unit={m.unit} status={m.status} icon={m.icon} live />
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle className="text-base">Vital trends · {rangeLabel}</CardTitle>
          <Tabs value={range} onValueChange={(v) => setRange(v as '24H' | '7D' | '30D')}>
            <TabsList>
              {ranges.map((r) => <TabsTrigger key={r} value={r}>{r}</TabsTrigger>)}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#5737A8]" /> Heart rate (BPM)</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#22A55A]" /> SpO₂ (%)</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#F59E0B]" /> Temperature (°C)</span>
          </div>
          <MultiLineChart
            data={series}
            series={[
              { key: 'heartRate', name: 'Heart rate', color: '#5737A8' },
              { key: 'spo2', name: 'SpO₂', color: '#22A55A' },
              { key: 'temperature', name: 'Temperature', color: '#F59E0B' },
            ]}
            height={300}
          />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{m.label}</CardTitle>
              <Badge variant="secondary">{rangeLabel}</Badge>
            </CardHeader>
            <CardContent>
              <TrendChart data={series} dataKey={m.label === 'Heart Rate' ? 'heartRate' : m.label === 'Oxygen Saturation' ? 'spo2' : 'temperature'} height={160} color={m.color} unit={m.label === 'Heart Rate' ? ' BPM' : m.label === 'Oxygen Saturation' ? '%' : '°C'} />
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Normal range: {thresholds[m.label === 'Heart Rate' ? 'heartRate' : m.label === 'Oxygen Saturation' ? 'spo2' : 'temperature'].low}–{thresholds[m.label === 'Heart Rate' ? 'heartRate' : m.label === 'Oxygen Saturation' ? 'spo2' : 'temperature'].high} {m.unit}</span>
                <span className="font-semibold">Current: {m.value}{m.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-5">
          <p className="text-sm font-semibold">Health score</p>
          <p className="mt-1 text-xs text-muted-foreground">MEDAI's composite wellness index based on vitals stability, symptom load and clinician assessments.</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="relative h-24 w-24">
              <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-primary/20">
                <span className="font-display text-2xl font-extrabold text-primary">{patient.healthScore}</span>
              </div>
            </div>
            <div className="text-sm">
              <p className="font-medium">{patient.healthScore >= 80 ? 'Looking good' : patient.healthScore >= 60 ? 'Moderate — stay consistent' : 'Needs attention'}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {patient.healthScore >= 80 ? 'Your vitals are stable and within range.' : patient.healthScore >= 60 ? 'Some vitals are trending toward thresholds. Follow your care plan.' : 'Several metrics are outside normal range. Contact your care team.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
