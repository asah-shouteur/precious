import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Role } from '@/types'
import type { SessionUser } from '@/services/auth'
import { authApi, buildSessionUser, loadSession, persistSession } from '@/services/auth'
import { iot } from '@/services/iot'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'destructive' | 'warning' | 'info'
}

interface AppContextValue {
  user: SessionUser | null
  online: boolean
  login: (role: Role, email: string, password: string) => Promise<void>
  logout: () => void
  quickLogin: (role: Role) => void
  toasts: Toast[]
  toast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => loadSession())
  const [online, setOnline] = useState<boolean>(() => navigator.onLine)
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = `toast_${Math.random().toString(36).slice(2, 9)}`
      setToasts((prev) => [...prev, { ...t, id }])
      setTimeout(() => dismissToast(id), 5200)
    },
    [dismissToast]
  )

  const login = useCallback(async (role: Role, email: string, password: string) => {
    const session = await authApi.login(role, email, password)
    setUser(session)
    persistSession(session)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    persistSession(null)
    iot.setRisk('Moderate')
  }, [])

  const quickLogin = useCallback((role: Role) => {
    const session = buildSessionUser(role)
    setUser(session)
    persistSession(session)
  }, [])

  return (
    <AppContext.Provider
      value={{
        user,
        online,
        login,
        logout,
        quickLogin,
        toasts,
        toast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function useTelemetry() {
  const [state, setState] = useState(iot.getState())
  useEffect(() => iot.subscribe(() => setState(iot.getState())), [])
  return state
}
