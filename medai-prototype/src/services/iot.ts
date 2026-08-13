import type { VitalReading, RiskLevel, DeviceStatus, Device } from '@/types'
import { normalVitals } from '@/data/telemetry'

export interface TelemetryState {
  vitals: VitalReading
  risk: RiskLevel
  connected: boolean
  devices: Device[]
  alerts: number
  lastSync: string
}

type Listener = () => void

const listeners = new Set<Listener>()

let risk: RiskLevel = 'Moderate'
let connected = true
let vitals: VitalReading = { ...normalVitals }
let intervalId: ReturnType<typeof setInterval> | null = null
let tickMs = 4000
let alertCount = 2

let devices: Device[] = [
  { id: 'dev_1', name: 'Home Vitals Hub', model: 'ESP32-WROOM32', type: 'hub', sensor: 'ESP32', status: 'Connected', battery: 92, signal: 87, lastSync: 'Just now', mac: '24:6F:28:7A:B4:12', firmware: 'v2.4.1', ownerId: 'pat_1' },
  { id: 'dev_2', name: 'Pulse Oximeter', model: 'MAX30102', type: 'pulse-oximeter', sensor: 'MAX30102', status: 'Connected', battery: 84, signal: 91, lastSync: 'Just now', mac: '24:6F:28:7A:B4:13', firmware: 'v1.9.2', ownerId: 'pat_1' },
  { id: 'dev_3', name: 'Infrared Thermometer', model: 'MLX90614', type: 'thermometer', sensor: 'MLX90614', status: 'Connected', battery: 78, signal: 76, lastSync: 'Just now', mac: '24:6F:28:7A:B4:14', firmware: 'v1.3.0', ownerId: 'pat_1' },
]

function notify() {
  listeners.forEach((l) => l())
}

function simulate() {
  if (!connected) {
    notify()
    return
  }
  const target = risk === 'High'
    ? { heartRate: 96 + Math.round(Math.random() * 8), spo2: 91 - Math.round(Math.random() * 2), temperature: 38.4 + Math.random() * 0.4 }
    : risk === 'Moderate'
      ? { heartRate: 84 + Math.round(Math.random() * 4), spo2: 95 + Math.round(Math.random() * 2), temperature: 37.7 + Math.random() * 0.3 }
      : { heartRate: 68 + Math.round(Math.random() * 5), spo2: 98 + Math.round(Math.random() * 2), temperature: 36.5 + Math.random() * 0.3 }

  vitals = {
    heartRate: target.heartRate,
    spo2: Math.min(100, target.spo2),
    temperature: parseFloat(target.temperature.toFixed(1)),
  }

  devices = devices.map((d) => ({
    ...d,
    battery: Math.max(5, d.battery - (Math.random() > 0.88 ? 1 : 0)),
    signal: d.status === 'Disconnected' ? 0 : Math.max(20, d.signal + Math.round(Math.random() * 6 - 3)),
    lastSync: 'Just now',
  }))

  if (vitals.spo2 < 95 || vitals.temperature >= 38 || vitals.heartRate > 100) {
    alertCount += 1
  }
  notify()
}

export const iot = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  getState(): TelemetryState {
    return { vitals: { ...vitals }, risk, connected, devices: devices.map((d) => ({ ...d })), alerts: alertCount, lastSync: new Date().toISOString() }
  },

  setRisk(level: RiskLevel) {
    risk = level
    simulate()
  },

  setConnected(value: boolean) {
    connected = value
    if (value) devices = devices.map((d) => ({ ...d, status: 'Connected' as DeviceStatus }))
    notify()
  },

  setSimulationSpeed(seconds: number) {
    tickMs = seconds * 1000
    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(simulate, tickMs)
  },

  pause() {
    if (intervalId) clearInterval(intervalId)
    intervalId = null
  },

  resume() {
    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(simulate, tickMs)
  },

  acknowledgeAlert() {
    alertCount = Math.max(0, alertCount - 1)
    notify()
  },
}

iot.resume()
