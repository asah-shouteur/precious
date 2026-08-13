import { Link } from 'react-router-dom'
import { ArrowRight, Battery, Cpu, Signal, Thermometer, Waves, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHero, SectionHeading } from '@/components/shared/PublicSections'
import { HealthMetricCard } from '@/components/shared/HealthMetricCard'
import { TrendChart } from '@/components/shared/charts'
import { buildSeries } from '@/data/telemetry'

const sensors = [
  { icon: Waves, name: 'MAX30102', role: 'Heart rate & SpO₂', detail: 'Optical pulse oximetry — measures oxygen saturation and heart rate from the fingertip.', spec: 'IR + red LEDs, 50Hz sampling' },
  { icon: Thermometer, name: 'MLX90614', role: 'Contactless temperature', detail: 'Infrared thermometer — measures body temperature without physical contact.', spec: '±0.5°C accuracy, I²C interface' },
  { icon: Cpu, name: 'ESP32', role: 'Hub & gateway', detail: 'Dual-core microcontroller that collects sensor data, applies thresholds and syncs to MEDAI over Wi-Fi.', spec: '2.4GHz Wi-Fi + BLE' },
]

export default function PublicIoT() {
  const hr = buildSeries('heartRate', '24H')
  const spo2 = buildSeries('spo2', '24H')
  const temp = buildSeries('temperature', '24H')

  return (
    <div>
      <PageHero
        eyebrow="IoT Monitoring"
        title="Continuous vitals, right from home"
        subtitle="An ESP32-powered hub with MAX30102 and MLX90614 sensors streams heart rate, SpO₂ and temperature to your care team — with abnormal-reading alerts."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <SectionHeading center eyebrow="Hardware" title="Small sensors, serious monitoring" />
        <div className="grid gap-5 md:grid-cols-3">
          {sensors.map((s) => (
            <div key={s.name} className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.spec}</span>
              </div>
              <h3 className="mt-4 font-display text-base font-bold">{s.name}</h3>
              <p className="text-xs font-semibold text-primary">{s.role}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <SectionHeading center eyebrow="Live view" title="What the monitoring dashboard looks like" />
          <div className="grid gap-4 md:grid-cols-3">
            <HealthMetricCard label="Heart Rate" value={72} unit="BPM" status="Normal" icon={<Waves />} trend="Stable" live />
            <HealthMetricCard label="SpO₂" value={98} unit="%" status="Normal" icon={<Waves />} trend="Stable" live />
            <HealthMetricCard label="Temperature" value={36.7} unit="°C" status="Normal" icon={<Thermometer />} trend="Stable" live />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground">Heart rate · 24H</p>
              <TrendChart data={hr} dataKey="heartRate" unit=" BPM" height={150} color="#5737A8" />
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground">SpO₂ · 24H</p>
              <TrendChart data={spo2} dataKey="spo2" unit="%" height={150} color="#22A55A" />
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground">Temperature · 24H</p>
              <TrendChart data={temp} dataKey="temperature" unit="°C" height={150} color="#F59E0B" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Battery, title: 'Battery & charging', body: 'Every node reports remaining charge. Low-battery alerts arrive before monitoring is interrupted.' },
            { icon: Signal, title: 'Signal strength', body: 'Connection quality is tracked so a weak link never silently becomes a data gap.' },
            { icon: Wifi, title: 'Last synchronization', body: 'The dashboard always shows how fresh the data is, so stale readings are impossible to miss.' },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6 shadow-card">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary"><f.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-display text-base font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button size="lg" asChild><Link to="/register">Start monitoring <ArrowRight /></Link></Button>
        </div>
      </section>
    </div>
  )
}
