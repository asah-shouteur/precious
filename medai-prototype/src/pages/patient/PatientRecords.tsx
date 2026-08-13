import { FileText, Pill, Plus, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MedicalTimeline } from '@/components/shared/MedicalTimeline'
import { EmptyState } from '@/components/shared/StateComponents'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useApp } from '@/store/AppProvider'
import { medicalRecords, medications } from '@/data/clinical'
import { patients } from '@/data/entities'
import { formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default function PatientRecords() {
  const { user } = useApp()
  const { toast } = useApp()
  const patient = patients.find((p) => p.id === user?.id) ?? patients[0]

  const myRecords = medicalRecords.filter((r) => r.patientId === patient.id)
  const aiRecords = myRecords.filter((r) => r.type === 'AI Preliminary')
  const confirmedRecords = myRecords.filter((r) => r.confirmed)
  const myMeds = medications.filter((m) => m.status === 'Active')

  return (
    <div>
      <PageHeader
        title="Medical Records"
        subtitle="Your verified clinical timeline — with AI preliminary assessments clearly distinguished from confirmed clinical assessments."
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus /> New health record</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Health record request</DialogTitle>
              <DialogDescription>
                Health records are created by your care team. If you need a new assessment, start the AI Assessment workflow or contact your doctor.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 rounded-xl border p-4">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                <div>
                  <p className="text-sm font-semibold">Run an AI-ASSISTED PRELIMINARY ASSESSMENT</p>
                  <p className="mt-1 text-xs text-muted-foreground">Generate a preliminary triage that your clinician will review and confirm.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border p-4">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Request a clinical record</p>
                  <p className="mt-1 text-xs text-muted-foreground">Message your care team to request a documented consultation or test.</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => toast({ title: 'Request sent', description: 'Your care team will process the request.', variant: 'success' })}>Send request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All records ({myRecords.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed clinical ({confirmedRecords.length})</TabsTrigger>
          <TabsTrigger value="ai">AI preliminary ({aiRecords.length})</TabsTrigger>
          <TabsTrigger value="meds">Medications ({myMeds.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {myRecords.length > 0 ? <MedicalTimeline records={myRecords} /> : <EmptyState icon={FileText} title="No records yet" description="Your clinical history will appear here." />}
        </TabsContent>

        <TabsContent value="confirmed">
          {confirmedRecords.length > 0 ? <MedicalTimeline records={confirmedRecords} /> : <EmptyState icon={FileText} title="No confirmed records" description="Confirmed clinical assessments will appear here." />}
        </TabsContent>

        <TabsContent value="ai">
          {aiRecords.length > 0 ? <MedicalTimeline records={aiRecords} /> : <EmptyState icon={Sparkles} title="No AI assessments" description="Preliminary assessments awaiting review appear here." />}
        </TabsContent>

        <TabsContent value="meds">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myMeds.length > 0 ? myMeds.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="flex items-center gap-1.5 font-display text-sm font-bold"><Pill className="h-4 w-4 text-primary" /> {m.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{m.dosage} · {m.frequency}</p>
                    </div>
                    <Badge variant="success" dot>Active</Badge>
                  </div>
                  <div className="mt-3 space-y-1 border-t pt-3 text-xs text-muted-foreground">
                    <p>Prescribed by: <span className="font-medium text-foreground">{m.prescribedBy}</span></p>
                    <p>Started: <span className="font-medium text-foreground">{formatDate(m.startDate)}</span></p>
                  </div>
                  {m.notes && <p className="mt-2 rounded-lg bg-muted p-2 text-xs">{m.notes}</p>}
                </CardContent>
              </Card>
            )) : <EmptyState icon={Pill} title="No active medications" description="Prescriptions will appear here." />}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Understanding your records</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-warning" />
                <p className="font-semibold">AI-ASSISTED PRELIMINARY ASSESSMENT</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Machine-generated triage with confidence scores. Always preliminary — a clinician must confirm, adjust or dismiss it before it becomes part of your clinical record.
              </p>
            </div>
            <div className="rounded-xl border border-success/30 bg-success/5 p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-success" />
                <p className="font-semibold">Confirmed clinical assessment</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Signed off by a named clinician with findings, diagnosis, treatment and follow-up. This is the authoritative version of your medical record.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
