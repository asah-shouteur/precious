import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Eye, EyeOff, Loader2, Lock, Mail, Shield, Stethoscope, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useApp } from '@/store/AppProvider'
import { demoAccounts } from '@/services/auth'
import type { Role } from '@/types'
import { cn } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

const roleOptions: { role: Role; icon: typeof UserRound; label: string; desc: string }[] = [
  { role: 'patient', icon: UserRound, label: 'Patient', desc: 'Personal health & care' },
  { role: 'doctor', icon: Stethoscope, label: 'Doctor', desc: 'Clinical workspace' },
  { role: 'facility', icon: Building2, label: 'Facility', desc: 'Operations & referrals' },
  { role: 'admin', icon: Shield, label: 'Administrator', desc: 'Platform governance' },
]

export default function Login() {
  const { login, quickLogin } = useApp()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('patient')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: demoAccounts[role].email, password: demoAccounts[role].password },
  })

  const selectRole = (r: Role) => {
    setRole(r)
    setError(null)
    setValue('email', demoAccounts[r].email, { shouldValidate: true })
    setValue('password', demoAccounts[r].password, { shouldValidate: true })
  }

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    setError(null)
    try {
      await login(role, values.email, values.password)
      navigate(`/${role}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-12 md:min-h-[calc(100vh-64px)] md:px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-[#7E51CE] font-display text-2xl font-extrabold text-white">M</div>
          <h1 className="mt-4 font-display text-2xl font-bold">Sign in to MEDAI</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose a role to explore its workspace.</p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="grid grid-cols-2 gap-2">
            {roleOptions.map((opt) => (
              <button
                key={opt.role}
                type="button"
                onClick={() => selectRole(opt.role)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border p-3 text-left transition-colors',
                  role === opt.role ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                )}
              >
                <opt.icon className={cn('h-4 w-4 shrink-0', role === opt.role ? 'text-primary' : 'text-muted-foreground')} />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{opt.label}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{opt.desc}</span>
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" className="pl-9" placeholder="you@medai.demo" {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} className="pl-9 pr-9" {...register('password')} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
            <Link to="/register" className="text-muted-foreground hover:text-primary">Create account</Link>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-dashed bg-muted/40 p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Demo access</p>
          <p className="mt-1">
            Pick any role — credentials are pre-filled. Password: <code className="rounded bg-muted px-1.5 py-0.5 font-mono">demo1234</code>
          </p>
          <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => { quickLogin(role); navigate(`/${role}`) }}>
            Quick sign in as {role}
          </Button>
        </div>
      </div>
    </div>
  )
}
