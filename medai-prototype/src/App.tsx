import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useApp } from '@/store/AppProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import type { Role } from '@/types'

import Landing from '@/pages/public/Landing'
import About from '@/pages/public/About'
import HowItWorks from '@/pages/public/HowItWorks'
import PublicAIAssessment from '@/pages/public/PublicAIAssessment'
import PublicIoT from '@/pages/public/PublicIoT'
import PublicReferral from '@/pages/public/PublicReferral'
import FacilitiesPage from '@/pages/public/FacilitiesPage'
import Security from '@/pages/public/Security'
import Faq from '@/pages/public/Faq'
import Contact from '@/pages/public/Contact'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'
import ForgotPassword from '@/pages/public/ForgotPassword'

import PatientDashboard from '@/pages/patient/PatientDashboard'
import PatientHealthMetrics from '@/pages/patient/PatientHealthMetrics'
import PatientAIAssessment from '@/pages/patient/PatientAIAssessment'
import PatientIoT from '@/pages/patient/PatientIoT'
import PatientRecords from '@/pages/patient/PatientRecords'
import PatientAppointments from '@/pages/patient/PatientAppointments'
import PatientReferrals from '@/pages/patient/PatientReferrals'
import PatientMessages from '@/pages/patient/PatientMessages'
import PatientNotifications from '@/pages/patient/PatientNotifications'
import PatientSettings from '@/pages/patient/PatientSettings'

import DoctorDashboard from '@/pages/doctor/DoctorDashboard'
import DoctorPatients from '@/pages/doctor/DoctorPatients'
import DoctorAIReviews from '@/pages/doctor/DoctorAIReviews'
import DoctorIoT from '@/pages/doctor/DoctorIoT'
import DoctorAppointments from '@/pages/doctor/DoctorAppointments'
import DoctorRecords from '@/pages/doctor/DoctorRecords'
import DoctorReferrals from '@/pages/doctor/DoctorReferrals'
import DoctorMessages from '@/pages/doctor/DoctorMessages'
import DoctorReports from '@/pages/doctor/DoctorReports'
import DoctorSettings from '@/pages/doctor/DoctorSettings'

import FacilityDashboard from '@/pages/facility/FacilityDashboard'
import FacilityDoctors from '@/pages/facility/FacilityDoctors'
import FacilityDepartments from '@/pages/facility/FacilityDepartments'
import FacilityServices from '@/pages/facility/FacilityServices'
import FacilityReferrals from '@/pages/facility/FacilityReferrals'
import FacilityCapacity from '@/pages/facility/FacilityCapacity'
import FacilityAppointments from '@/pages/facility/FacilityAppointments'
import FacilityAnalytics from '@/pages/facility/FacilityAnalytics'
import FacilitySettings from '@/pages/facility/FacilitySettings'

import AdminOverview from '@/pages/admin/AdminOverview'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminPatients from '@/pages/admin/AdminPatients'
import AdminDoctors from '@/pages/admin/AdminDoctors'
import AdminFacilities from '@/pages/admin/AdminFacilities'
import AdminDevices from '@/pages/admin/AdminDevices'
import AdminAI from '@/pages/admin/AdminAI'
import AdminReferrals from '@/pages/admin/AdminReferrals'
import AdminAppointments from '@/pages/admin/AdminAppointments'
import AdminReports from '@/pages/admin/AdminReports'
import AdminAudit from '@/pages/admin/AdminAudit'
import AdminSecurity from '@/pages/admin/AdminSecurity'
import AdminSettings from '@/pages/admin/AdminSettings'

function RequireRole({ role }: { role: Role }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />
  return <Outlet />
}

function PublicOnly() {
  const { user } = useApp()
  if (user) return <Navigate to={`/${user.role}`} replace />
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/ai-assessment" element={<PublicAIAssessment />} />
          <Route path="/iot-monitoring" element={<PublicIoT />} />
          <Route path="/referrals" element={<PublicReferral />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/security" element={<Security />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route element={<PublicOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route path="*" element={<Landing />} />
        </Route>

        <Route element={<AppLayout />}>
          <Route element={<RequireRole role="patient" />}>
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/metrics" element={<PatientHealthMetrics />} />
            <Route path="/patient/assessments" element={<PatientAIAssessment />} />
            <Route path="/patient/iot" element={<PatientIoT />} />
            <Route path="/patient/records" element={<PatientRecords />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/referrals" element={<PatientReferrals />} />
            <Route path="/patient/messages" element={<PatientMessages />} />
            <Route path="/patient/notifications" element={<PatientNotifications />} />
            <Route path="/patient/settings" element={<PatientSettings />} />
          </Route>

          <Route element={<RequireRole role="doctor" />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/ai-reviews" element={<DoctorAIReviews />} />
            <Route path="/doctor/iot" element={<DoctorIoT />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/records" element={<DoctorRecords />} />
            <Route path="/doctor/referrals" element={<DoctorReferrals />} />
            <Route path="/doctor/messages" element={<DoctorMessages />} />
            <Route path="/doctor/reports" element={<DoctorReports />} />
            <Route path="/doctor/settings" element={<DoctorSettings />} />
          </Route>

          <Route element={<RequireRole role="facility" />}>
            <Route path="/facility" element={<FacilityDashboard />} />
            <Route path="/facility/doctors" element={<FacilityDoctors />} />
            <Route path="/facility/departments" element={<FacilityDepartments />} />
            <Route path="/facility/services" element={<FacilityServices />} />
            <Route path="/facility/referrals" element={<FacilityReferrals />} />
            <Route path="/facility/capacity" element={<FacilityCapacity />} />
            <Route path="/facility/appointments" element={<FacilityAppointments />} />
            <Route path="/facility/analytics" element={<FacilityAnalytics />} />
            <Route path="/facility/settings" element={<FacilitySettings />} />
          </Route>

          <Route element={<RequireRole role="admin" />}>
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/patients" element={<AdminPatients />} />
            <Route path="/admin/doctors" element={<AdminDoctors />} />
            <Route path="/admin/facilities" element={<AdminFacilities />} />
            <Route path="/admin/devices" element={<AdminDevices />} />
            <Route path="/admin/ai" element={<AdminAI />} />
            <Route path="/admin/referrals" element={<AdminReferrals />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/audit" element={<AdminAudit />} />
            <Route path="/admin/security" element={<AdminSecurity />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
