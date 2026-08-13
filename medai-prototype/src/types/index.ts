export type Role = 'patient' | 'doctor' | 'facility' | 'admin'

export type RiskLevel = 'Low' | 'Moderate' | 'High'
export type UrgencyLevel = 'Routine' | 'Moderate' | 'Urgent'
export type Status = 'Pending' | 'Requested' | 'Reviewed' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled'
export type ReferralStatus = 'Requested' | 'Reviewed' | 'Accepted' | 'In Progress' | 'Completed'
export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled'
export type DeviceStatus = 'Connected' | 'Disconnected' | 'Low Battery' | 'Error'
export type VitalMetric = 'heartRate' | 'spo2' | 'temperature'

export interface VitalReading {
  heartRate: number
  spo2: number
  temperature: number
}

export interface Device {
  id: string
  name: string
  model: string
  type: 'hub' | 'pulse-oximeter' | 'thermometer'
  sensor: string
  status: DeviceStatus
  battery: number
  signal: number
  lastSync: string
  mac: string
  firmware: string
  ownerId: string
}

export interface Patient {
  id: string
  name: string
  email: string
  dob: string
  age: number
  gender: 'Female' | 'Male' | 'Other'
  phone: string
  bloodType: string
  allergies: string[]
  chronicConditions: string[]
  primaryPhysicianId: string
  primaryFacilityId: string
  vitals: VitalReading
  healthScore: number
  risk: RiskLevel
  status: 'Active' | 'Inactive'
  insurance: string
  address: string
  joinedAt: string
}

export interface Doctor {
  id: string
  name: string
  email: string
  specialty: string
  subSpecialty?: string
  title: string
  facilityId: string
  departmentId: string
  yearsExperience: number
  rating: number
  reviews: number
  patientsAssigned: number
  activeAlerts: number
  referralsPending: number
  avgReviewTime: string
  availability: string[]
  bio: string
  languages: string[]
  education: string[]
  photoColor: string
  status: 'Available' | 'In Consultation' | 'On Leave' | 'Offline'
  verified: boolean
}

export interface Facility {
  id: string
  name: string
  type: 'Hospital' | 'Clinic' | 'Diagnostic Lab' | 'Specialty Center'
  city: string
  address: string
  distanceKm: number
  phone: string
  rating: number
  reviews: number
  capacity: number
  occupancy: number
  status: 'Operational' | 'At Capacity' | 'Maintenance'
  specialties: string[]
  departments: Department[]
  services: string[]
  accreditation: string[]
  emergency: boolean
  iotEnabled: boolean
}

export interface Department {
  id: string
  name: string
  headDoctor: string
  beds: number
  occupied: number
  status: 'Operational' | 'Critical' | 'Limited'
}

export interface Service {
  id: string
  name: string
  category: string
  durationMin: number
  cost: number
  facilityId: string
  description: string
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  facilityId: string
  date: string
  time: string
  type: 'Consultation' | 'Follow-up' | 'Diagnostic' | 'Telehealth' | 'Procedure'
  reason: string
  status: AppointmentStatus
  notes?: string
  createdAt: string
}

export interface MedicalRecord {
  id: string
  patientId: string
  date: string
  doctorId: string
  doctorName: string
  facilityId: string
  facilityName: string
  type: 'Consultation' | 'Laboratory' | 'Imaging' | 'Prescription' | 'AI Preliminary'
  reason: string
  findings: string
  assessment: string
  diagnosis: string
  treatment: string
  followUp: string
  medication?: string
  labs?: LabResult[]
  severity: RiskLevel
  confirmed: boolean
  ai?: {
    confidence: number
    urgency: UrgencyLevel
    condition: string
    reviewedBy?: string
    reviewedAt?: string
  }
  createdAt: string
}

export interface LabResult {
  name: string
  value: string
  unit: string
  reference: string
  status: 'Normal' | 'High' | 'Low' | 'Critical'
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  prescribedBy: string
  status: 'Active' | 'Completed' | 'Discontinued'
  notes?: string
}

export interface Referral {
  id: string
  patientId: string
  patientName: string
  fromDoctorId: string
  fromDoctorName: string
  fromFacilityId: string
  fromFacilityName: string
  toFacilityId: string
  toFacilityName: string
  specialty: string
  condition: string
  urgency: UrgencyLevel
  status: ReferralStatus
  reason: string
  notes: string
  recommendations: string[]
  aiSuggested: boolean
  matchScore: number
  distanceKm: number
  waitDays: number
  requestedAt: string
  updatedAt: string
}

export interface MessageThread {
  id: string
  participants: string[]
  participantNames: string[]
  subject: string
  lastMessage: Message
  unread: number
  updatedAt: string
}

export interface Message {
  id: string
  threadId: string
  fromId: string
  fromName: string
  toId: string
  body: string
  attachments: Attachment[]
  sentAt: string
  read: boolean
}

export interface Attachment {
  id: string
  name: string
  size: string
  type: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  category: 'AI Assessment' | 'Abnormal Reading' | 'Appointment' | 'Referral' | 'Message' | 'Device' | 'System' | 'Security'
  severity: RiskLevel | 'Info'
  read: boolean
  createdAt: string
  link?: string
}

export interface AIAssessmentResult {
  id: string
  patientId: string
  possibleConditions: AIPossibleCondition[]
  confidence: number
  urgency: UrgencyLevel
  risk: RiskLevel
  summary: string
  recommendation: string
  symptoms: string[]
  duration: string
  vitalsUsed: VitalReading
  disclaimer: string
  createdAt: string
  status: 'Pending Review' | 'Reviewed' | 'Dismissed'
  reviewedBy?: string
  reviewedAt?: string
}

export interface AIPossibleCondition {
  name: string
  probability: number
  confidence: number
  description: string
}

export interface AIReviewAction {
  id: string
  assessmentId: string
  doctorId: string
  decision: 'Confirmed' | 'Adjusted' | 'Rejected'
  notes: string
  finalDiagnosis?: string
  actedAt: string
}

export interface QueueItem {
  id: string
  patientId: string
  name: string
  age: number
  gender: string
  unit: string
  risk: RiskLevel
  lastUpdate: string
  vitals: VitalReading
  symptoms: string[]
  aiPending: boolean
  deviceConnected: boolean
}

export interface AuditLog {
  id: string
  timestamp: string
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SECURITY' | 'DB'
  module: 'AUTH' | 'IOT' | 'AI' | 'CLINICAL' | 'DB' | 'SECURITY' | 'SYSTEM'
  actor: string
  action: string
  ip: string
  details: string
}

export interface IoTAlert {
  id: string
  deviceId: string
  patientId: string
  metric: VitalMetric
  value: number
  threshold: string
  severity: RiskLevel
  message: string
  createdAt: string
  acknowledged: boolean
}

export interface CapacitySnapshot {
  facilityId: string
  totalBeds: number
  occupied: number
  available: number
  icuOccupancy: number
  emergencyWaitMins: number
  updatedAt: string
}
