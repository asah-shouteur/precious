import type { Role } from '@/types'
import { patients, doctors, facilities, currentUserId } from '@/data/entities'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
  specialty?: string
  facilityId?: string
  facilityName?: string
}

export interface Credentials {
  role: Role
  email: string
  password: string
}

const STORAGE_KEY = 'medai.session'

export const demoAccounts: Record<Role, { id: string; name: string; email: string; password: string }> = {
  patient: { id: currentUserId, name: 'Precious Mensah', email: 'precious@medai.demo', password: 'demo1234' },
  doctor: { id: 'doc_1', name: 'Dr. Aziza Rahman', email: 'aziza@medai.demo', password: 'demo1234' },
  facility: { id: 'fac_1', name: 'St. Jude Medical Center', email: 'facility@stjude.demo', password: 'demo1234' },
  admin: { id: 'admin_1', name: 'System Administrator', email: 'admin@medai.demo', password: 'demo1234' },
}

export function buildSessionUser(role: Role): SessionUser {
  if (role === 'patient') {
    const p = patients.find((x) => x.id === currentUserId) ?? patients[0]
    return { id: p.id, name: p.name, email: p.email, role }
  }
  if (role === 'doctor') {
    const d = doctors[0]
    const f = facilities.find((x) => x.id === d.facilityId)
    return { id: d.id, name: d.name, email: d.email, role, specialty: d.specialty, facilityId: d.facilityId, facilityName: f?.name }
  }
  if (role === 'facility') {
    const f = facilities[0]
    return { id: f.id, name: f.name, email: demoAccounts.facility.email, role, facilityName: f.name }
  }
  return { id: 'admin_1', name: 'System Administrator', email: 'admin@medai.demo', role }
}

export function loadSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

export function persistSession(user: SessionUser | null) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  else localStorage.removeItem(STORAGE_KEY)
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const authApi = {
  async login(role: Role, email: string, password: string): Promise<SessionUser> {
    await delay(900)
    const account = demoAccounts[role]
    if (account.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error('No account found for that email address.')
    }
    if (account.password !== password) {
      throw new Error('Incorrect password. Please try again.')
    }
    return buildSessionUser(role)
  },

  async register(data: { role: Role; name: string; email: string; password: string }): Promise<SessionUser> {
    await delay(1100)
    const account = demoAccounts[data.role]
    const user: SessionUser = { id: account.id, name: data.name, email: data.email, role: data.role }
    return user
  },
}

export function mapUserToSession(role: Role): SessionUser {
  return buildSessionUser(role)
}
