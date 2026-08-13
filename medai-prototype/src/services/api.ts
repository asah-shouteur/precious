import type {
  Appointment,
  Doctor,
  Facility,
  MedicalRecord,
  Patient,
  Referral,
  AIAssessmentResult,
  Device,
  Notification,
  Service,
  Message,
} from '@/types'
import { patients, doctors, facilities, devices, services } from '@/data/entities'
import { appointments, medicalRecords, referrals, medications } from '@/data/clinical'
import { notifications, aiAssessments, messageThreads } from '@/data/activity'

const latency = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const api = {
  async getPatients(): Promise<Patient[]> {
    await latency(500)
    return patients
  },
  async getPatient(id: string): Promise<Patient | undefined> {
    await latency(300)
    return patients.find((p) => p.id === id)
  },
  async getDoctors(): Promise<Doctor[]> {
    await latency(500)
    return doctors
  },
  async getFacilities(): Promise<Facility[]> {
    await latency(500)
    return facilities
  },
  async getDevices(): Promise<Device[]> {
    await latency(400)
    return devices
  },
  async getAppointments(): Promise<Appointment[]> {
    await latency(400)
    return appointments
  },
  async getRecords(): Promise<MedicalRecord[]> {
    await latency(450)
    return medicalRecords
  },
  async getReferrals(): Promise<Referral[]> {
    await latency(450)
    return referrals
  },
  async getServices(): Promise<Service[]> {
    await latency(300)
    return services
  },
  async getMedications() {
    await latency(300)
    return medications
  },
  async getNotifications(): Promise<Notification[]> {
    await latency(300)
    return notifications
  },
  async getAIAssessments(): Promise<AIAssessmentResult[]> {
    await latency(400)
    return aiAssessments
  },
  async getThreads() {
    await latency(300)
    return messageThreads
  },

  async createAppointment(input: Omit<Appointment, 'id' | 'status' | 'createdAt'>): Promise<Appointment> {
    await latency(800)
    const appointment: Appointment = {
      ...input,
      id: `apt_${Math.random().toString(36).slice(2, 8)}`,
      status: 'Scheduled',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    appointments.unshift(appointment)
    return appointment
  },

  async updateAppointment(id: string, patch: Partial<Appointment>): Promise<Appointment> {
    await latency(600)
    const idx = appointments.findIndex((a) => a.id === id)
    appointments[idx] = { ...appointments[idx], ...patch }
    return appointments[idx]
  },

  async createReferral(input: Omit<Referral, 'id' | 'status' | 'requestedAt' | 'updatedAt'>): Promise<Referral> {
    await latency(900)
    const now = new Date().toISOString().slice(0, 10)
    const referral: Referral = {
      ...input,
      id: `ref_${Math.random().toString(36).slice(2, 8)}`,
      status: 'Requested',
      requestedAt: now,
      updatedAt: now,
    }
    referrals.unshift(referral)
    return referral
  },

  async updateReferral(id: string, patch: Partial<Referral>): Promise<Referral> {
    await latency(600)
    const idx = referrals.findIndex((r) => r.id === id)
    referrals[idx] = { ...referrals[idx], ...patch, updatedAt: new Date().toISOString().slice(0, 10) }
    return referrals[idx]
  },

  async createRecord(input: Omit<MedicalRecord, 'id' | 'createdAt'>): Promise<MedicalRecord> {
    await latency(700)
    const record: MedicalRecord = {
      ...input,
      id: `rec_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    medicalRecords.unshift(record)
    return record
  },

  async runAIAssessment(input: { patientId: string; symptoms: string[]; duration: string }): Promise<AIAssessmentResult> {
    await latency(2200)
    const patient = patients.find((p) => p.id === input.patientId)!
    const v = patient.vitals
    let condition = 'Respiratory tract infection'
    let confidence = 76
    let urgency: AIAssessmentResult['urgency'] = 'Moderate'
    let risk: AIAssessmentResult['risk'] = 'Moderate'

    const has = (s: string) => input.symptoms.some((x) => x.toLowerCase().includes(s))
    if (v.spo2 < 93 || has('shortness of breath') || has('chest pain')) {
      condition = 'Acute respiratory compromise'
      confidence = 89
      urgency = 'Urgent'
      risk = 'High'
    } else if (v.temperature >= 38 || has('fever') || has('cough')) {
      condition = 'Respiratory tract infection'
      confidence = 82
      urgency = 'Moderate'
      risk = 'Moderate'
    } else if (has('palpitations') || v.heartRate > 100) {
      condition = 'Cardiac rhythm concern (possible)'
      confidence = 64
      urgency = 'Moderate'
      risk = 'Moderate'
    } else if (has('headache') || has('migraine')) {
      condition = 'Migraine headache'
      confidence = 71
      urgency = 'Routine'
      risk = 'Low'
    }

    return {
      id: `ai_${Math.random().toString(36).slice(2, 8)}`,
      patientId: input.patientId,
      possibleConditions: [
        { name: condition, probability: confidence / 100, confidence, description: 'Leading candidate based on symptoms and live vitals.' },
      ],
      confidence,
      urgency,
      risk,
      summary: `Symptoms (${input.symptoms.join(', ')}) combined with live IoT vitals suggest ${condition.toLowerCase()}.`,
      recommendation: urgency === 'Urgent'
        ? 'Seek urgent clinical evaluation. Continuous monitoring recommended.'
        : 'Consult a healthcare professional. Monitor vitals and symptoms.',
      symptoms: input.symptoms,
      duration: input.duration,
      vitalsUsed: { ...v },
      disclaimer: 'AI-ASSISTED PRELIMINARY ASSESSMENT — This result is generated by an AI model for triage support only. It is not a medical diagnosis and does not replace professional clinical judgement.',
      createdAt: new Date().toISOString(),
      status: 'Pending Review',
    }
  },

  async sendMessage(input: Pick<Message, 'threadId' | 'fromId' | 'fromName' | 'toId' | 'body'>): Promise<Message> {
    await latency(400)
    const message: Message = {
      ...input,
      id: `m_${Math.random().toString(36).slice(2, 8)}`,
      attachments: [],
      sentAt: new Date().toISOString(),
      read: false,
    }
    return message
  },
}
