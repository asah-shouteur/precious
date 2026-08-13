import type { VitalReading, VitalMetric } from '@/types'

export interface ChartPoint {
  t: string
  heartRate: number
  spo2: number
  temperature: number
}

const now = Date.now()

function seedHistory(points: number, seed: number): number[] {
  const out: number[] = []
  let v = seed
  for (let i = 0; i < points; i++) {
    v = Math.max(1, v + (Math.random() * 2 - 1) * 0.08)
    out.push(Math.round(v * 10) / 10)
  }
  return out
}

export const heartRateHistory = seedHistory(72, 72)
export const spo2History = seedHistory(72, 98)
export const temperatureHistory = seedHistory(72, 36.7)

export const heartRate24h = seedHistory(48, 74)
export const spo224h = seedHistory(48, 98)
export const temperature24h = seedHistory(48, 36.7)

export const heartRate7d = seedHistory(42, 73)
export const spo27d = seedHistory(42, 97)
export const temperature7d = seedHistory(42, 36.8)

export const heartRate30d = seedHistory(30, 74)
export const spo230d = seedHistory(30, 98)
export const temperature30d = seedHistory(30, 36.7)

export function buildSeries(metric: VitalMetric, range: '24H' | '7D' | '30D'): ChartPoint[] {
  const counts = { '24H': 48, '7D': 42, '30D': 30 } as const
  const stepMs = { '24H': 30 * 60 * 1000, '7D': 4 * 60 * 60 * 1000, '30D': 24 * 60 * 60 * 1000 } as const
  const n = counts[range]
  const base = { heartRate: 74, spo2: 98, temperature: 36.8 }[metric]
  const jitter = { heartRate: 6, spo2: 2, temperature: 0.5 }[metric]
  const points: ChartPoint[] = []
  for (let i = 0; i < n; i++) {
    const t = new Date(now - (n - i) * stepMs[range]).toISOString()
    const value = base + Math.sin(i / (n / 8)) * jitter + (Math.random() - 0.5) * jitter
    points.push({
      t,
      heartRate: metric === 'heartRate' ? Math.round(value) : Math.round(74 + Math.sin(i / (n / 8)) * 5),
      spo2: metric === 'spo2' ? Math.round(value) : Math.round(97 + Math.sin(i / (n / 8)) * 1),
      temperature: metric === 'temperature' ? parseFloat(value.toFixed(1)) : parseFloat((36.8 + Math.sin(i / (n / 8)) * 0.3).toFixed(1)),
    })
  }
  return points
}

export function trendData(range: '24H' | '7D' | '30D'): ChartPoint[] {
  return buildSeries('heartRate', range).map((_, i) => buildSeries('heartRate', range)[i])
}

export interface VitalState {
  heartRate: number
  spo2: number
  temperature: number
}

export const normalVitals: VitalState = { heartRate: 72, spo2: 98, temperature: 36.7 }

export const thresholds = {
  heartRate: { low: 60, high: 100, unit: 'BPM' },
  spo2: { low: 95, high: 100, unit: '%' },
  temperature: { low: 35.5, high: 37.8, unit: '°C' },
} as const

export function vitalsStatus(reading: VitalReading, metric: VitalMetric): 'Normal' | 'Borderline' | 'Abnormal' {
  const th = thresholds[metric]
  const value = reading[metric]
  if (value > th.high || value < th.low) return 'Abnormal'
  if (value > th.high - 4 || value < th.low + 4) return 'Borderline'
  return 'Normal'
}

export const aiConditions = [
  'Respiratory tract infection',
  'Acute bronchitis',
  'Influenza-like illness',
  'Allergic rhinitis',
  'Bronchial asthma (exacerbation)',
  'Pneumonia (bacterial)',
  'Acute sinusitis',
  'Gastroenteritis',
  'Urinary tract infection',
  'Migraine headache',
  'Hypertension (elevated)',
  'Iron-deficiency anemia',
  'Type 2 diabetes (uncontrolled)',
  'Hypothyroidism',
  'Gastroesophageal reflux disease',
  'Anxiety disorder (somatic)',
  'Arrhythmia (possible)',
  'Cardiac ischemia (rule out)',
  'Osteoarthritis',
  'Acute pharyngitis',
] as const
