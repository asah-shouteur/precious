import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/store/AppProvider'

export default function ForgotPassword() {
  const { toast } = useApp()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <div className="mx-auto flex max-w-md items-center justify-center px-4 py-20 md:px-6">
      <div className="w-full">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold">Reset your password</h1>
          <p className="mt-1 text-sm text-muted-foreground">We will email you a secure reset link.</p>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          {sent ? (
            <div className="py-6 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/10 text-success"><Mail className="h-5 w-5" /></div>
              <p className="mt-3 text-sm font-semibold">Reset link sent</p>
              <p className="mt-1 text-sm text-muted-foreground">If an account exists for {email}, you will receive instructions shortly.</p>
              <Link to="/login"><Button variant="outline" className="mt-5">Back to sign in</Button></Link>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (!email) { toast({ title: 'Enter your email', variant: 'warning' }); return } setSent(true); toast({ title: 'Reset link sent', variant: 'success' }) }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@medai.demo" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Send reset link</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
