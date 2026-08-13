import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/store/AppProvider'

const schema = z.object({
  name: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type FormValues = z.infer<typeof schema>

export default function Register() {
  const { toast } = useApp()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async () => {
    toast({ title: 'Registration submitted', description: 'In a real deployment you would receive a verification email. Try signing in with the patient demo instead.', variant: 'success' })
    setTimeout(() => navigate('/login'), 1400)
  }

  return (
    <div className="mx-auto flex max-w-2xl items-center justify-center px-4 py-12 md:min-h-[calc(100vh-64px)] md:px-6">
      <div className="w-full">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold">Create your MEDAI account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join as a patient, doctor, facility or administrator.</p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-card md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Jane Doe" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="jane@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" {...register('confirm')} />
                {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">What happens next?</p>
              <ul className="mt-2 space-y-1.5">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Verification email</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Consent for IoT monitoring & data sharing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Welcome appointment with your care team</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" onClick={() => {}}>
              <Loader2 className="hidden" /> Create account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
