import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle, ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, Loader2, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageHeader } from '@/components/shared/PageHeader'
import { Stepper } from '@/components/shared/Stepper'
import { AIResultCard } from '@/components/shared/AIResultCard'
import { useApp, useTelemetry } from '@/store/AppProvider'
import { api } from '@/services/api'
import { patients } from '@/data/entities'
import type { AIAssessmentResult } from '@/types'
import { cn } from '@/lib/utils'

const symptomOptions = [
  'Fever', 'Cough', 'Fatigue', 'Shortness of breath', 'Chest pain', 'Sore throat',
  'Headache', 'Body aches', 'Nasal congestion', 'Nausea', 'Palpitations', 'Dizziness',
  'Abdominal pain', 'Rash', 'Joint pain', 'Loss of appetite',
]

const symptomSchema = z.object({ symptoms: z.array(z.string()).min(1, 'Select at least one symptom') })
const infoSchema = z.object({
  duration: z.string().min(1, 'Required'),
  severity: z.string().min(1, 'Required'),
  notes: z.string().optional(),
})
const consentSchema = z.object({ consent: z.boolean().refine((v) => v, 'Consent is required to run the assessment') })

const steps = [
  { label: 'Symptoms' },
  { label: 'Health Info' },
  { label: 'IoT Data' },
  { label: 'AI Processing' },
  { label: 'Preliminary Assessment' },
  { label: 'Doctor Review' },
]

export default function PatientAIAssessment() {
  const { user, toast } = useApp()
  const telemetry = useTelemetry()
  const patient = patients.find((p) => p.id === user?.id) ?? patients[0]

  const [step, setStep] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<AIAssessmentResult | null>(null)

  const symptomForm = useForm({ resolver: zodResolver(symptomSchema), defaultValues: { symptoms: [] as string[] } })
  const infoForm = useForm({ resolver: zodResolver(infoSchema), defaultValues: { duration: '', severity: '', notes: '' } })
  const consentForm = useForm({ resolver: zodResolver(consentSchema), defaultValues: { consent: false } })

  const selected = symptomForm.watch('symptoms') ?? []

  const toggleSymptom = (s: string) => {
    const current = symptomForm.getValues('symptoms')
    symptomForm.setValue('symptoms', current.includes(s) ? current.filter((x) => x !== s) : [...current, s], { shouldValidate: true })
  }

  const runInference = async () => {
    const info = infoForm.getValues()
    setProcessing(true)
    try {
      const res = await api.runAIAssessment({
        patientId: patient.id,
        symptoms: symptomForm.getValues('symptoms'),
        duration: info.duration,
      })
      setResult(res)
      setStep(4)
      toast({ title: 'Assessment generated', description: 'Your AI-ASSISTED PRELIMINARY ASSESSMENT is ready for clinician review.', variant: 'success' })
    } catch {
      toast({ title: 'Something went wrong', description: 'The inference engine could not process your request.', variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  const restart = () => {
    setResult(null)
    setStep(0)
    symptomForm.reset()
    infoForm.reset()
    consentForm.reset()
  }

  const go = (n: number) => setStep(n)

  return (
    <div>
      <PageHeader
        title="AI Assessment"
        subtitle="A guided, six-step preliminary triage. The result is always an AI-ASSISTED PRELIMINARY ASSESSMENT reviewed by a clinician — never a diagnosis."
      />

      <Card className="mb-6 p-5">
        <Stepper steps={steps} current={step} loadingStep={processing ? 3 : undefined} />
      </Card>

      {step === 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-bold">What symptoms are you experiencing?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select all that apply.</p>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {symptomOptions.map((s) => (
                <label key={s} className={cn('flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-medium transition-colors', selected.includes(s) ? 'border-primary bg-primary/5' : 'hover:bg-muted')}>
                  <Checkbox checked={selected.includes(s)} onCheckedChange={() => toggleSymptom(s)} />
                  {s}
                </label>
              ))}
            </div>
            {symptomForm.formState.errors.symptoms && <p className="mt-2 text-xs text-destructive">{symptomForm.formState.errors.symptoms.message}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => { symptomForm.trigger(); if (!symptomForm.formState.errors.symptoms) go(1) }}>
                Continue <ArrowRight />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-bold">Tell us about your health situation</h2>
            <p className="mt-1 text-sm text-muted-foreground">This context improves the accuracy of the preliminary triage.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">How long have symptoms lasted?</Label>
                <select id="duration" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" {...infoForm.register('duration')}>
                  <option value="">Select duration...</option>
                  <option value="Few hours">Few hours</option>
                  <option value="1–2 days">1–2 days</option>
                  <option value="3–5 days">3–5 days</option>
                  <option value="1 week">1 week</option>
                  <option value="2+ weeks">2+ weeks</option>
                </select>
                {infoForm.formState.errors.duration && <p className="text-xs text-destructive">{infoForm.formState.errors.duration.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">How severe would you say it is?</Label>
                <select id="severity" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" {...infoForm.register('severity')}>
                  <option value="">Select severity...</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
                {infoForm.formState.errors.severity && <p className="text-xs text-destructive">{infoForm.formState.errors.severity.message}</p>}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="notes">Additional notes (optional)</Label>
              <Textarea id="notes" rows={3} placeholder="Anything else that may be relevant..." {...infoForm.register('notes')} />
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => go(0)}><ArrowLeft /> Back</Button>
              <Button onClick={() => { infoForm.trigger(); if (!infoForm.formState.errors.duration && !infoForm.formState.errors.severity) go(2) }}>
                Continue <ArrowRight />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-bold">Review your live IoT vitals</h2>
            <p className="mt-1 text-sm text-muted-foreground">The AI engine will use the most recent readings from your ESP32 sensors.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Heart Rate', value: telemetry.vitals.heartRate, unit: 'BPM' },
                { label: 'SpO₂', value: telemetry.vitals.spo2, unit: '%' },
                { label: 'Temperature', value: telemetry.vitals.temperature.toFixed(1), unit: '°C' },
              ].map((v) => (
                <div key={v.label} className={cn('rounded-xl border p-5 text-center', telemetry.connected ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5')}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{v.label}</p>
                  <p className="mt-2 font-display text-3xl font-extrabold">{v.value}<span className="ml-1 text-sm font-medium text-muted-foreground">{v.unit}</span></p>
                  <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium">
                    <span className={cn('h-1.5 w-1.5 rounded-full', telemetry.connected ? 'animate-pulse bg-success' : 'bg-destructive')} />
                    {telemetry.connected ? 'Streaming live' : 'Device disconnected — using last reading'}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => go(1)}><ArrowLeft /> Back</Button>
              <Button onClick={() => { consentForm.trigger('consent'); go(3) }}>
                Proceed to processing <ArrowRight />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-0">
          <CardContent className="flex flex-col items-center py-14 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10">
              <BrainCircuit className="h-10 w-10 animate-pulse-soft text-primary" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold">Running AI inference</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Combining your symptoms with live vitals against clinical decision patterns...
            </p>
            <div className="mt-5 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Processing telemetry & symptom vectors</span>
            </div>
            <div className="mt-4 w-full max-w-sm space-y-2 text-left">
              {[
                'Validating IoT telemetry stream',
                'Normalizing symptom vectors',
                'Running classifier ensemble',
                'Computing confidence & urgency',
              ].map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-xs text-muted-foreground">
                  {i < 2 ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <span className="ml-0.5 h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                  {s}
                </div>
              ))}
            </div>
            <Button size="sm" variant="outline" className="mt-6" onClick={() => go(2)}><ArrowLeft /> Back to vitals</Button>
          </CardContent>
        </Card>
      )}

      {step === 4 && result && (
        <div>
          <AIResultCard
            result={result}
            onRequestReview={() => {
              setStep(5)
              toast({ title: 'Review requested', description: 'Your care team has been notified. You will see updates in notifications.', variant: 'success' })
            }}
            onRestart={restart}
          />
          <div className="mt-6 text-center text-xs text-muted-foreground">
            MEDAI assists healthcare professionals — it does not replace doctors.
          </div>
        </div>
      )}

      {step === 5 && result && (
        <div>
          <Alert variant="success" className="mb-4">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Review requested</AlertTitle>
            <AlertDescription>
              Your preliminary assessment has been queued for {patient.primaryPhysicianId ? 'your primary physician' : 'the care team'}. Track progress in Notifications.
            </AlertDescription>
          </Alert>
          <AIResultCard result={result} />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Stethoscope, title: 'Clinician review', text: 'A named doctor confirms, adjusts or dismisses the AI output.' },
              { icon: AlertTriangle, title: 'Watch for alerts', text: 'If your vitals worsen, alerts are raised immediately regardless of this assessment.' },
              { icon: CheckCircle2, title: 'Permanent record', text: 'The confirmed clinical assessment becomes part of your medical record.' },
            ].map((c) => (
              <div key={c.title} className="rounded-xl border bg-card p-5">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><c.icon className="h-4 w-4" /></div>
                <h3 className="mt-3 font-display text-sm font-bold">{c.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" onClick={restart}>Start new assessment</Button>
            <Button variant="ghost" asChild><Link to="/patient/records">View medical records</Link></Button>
          </div>
        </div>
      )}
    </div>
  )
}
