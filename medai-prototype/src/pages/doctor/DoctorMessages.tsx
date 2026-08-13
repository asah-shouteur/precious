import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/StateComponents'
import { useApp } from '@/store/AppProvider'
import { api } from '@/services/api'
import { messageThreads, messages } from '@/data/activity'
import { doctors, patients } from '@/data/entities'
import { cn, formatTime } from '@/lib/utils'

export default function DoctorMessages() {
  const { user } = useApp()
  const me = doctors.find((d) => d.id === user?.id) ?? doctors[0]
  const myThreads = messageThreads.filter((t) => t.participants.includes(me.id))
  const [activeId, setActiveId] = useState(myThreads[0]?.id)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [localMessages, setLocalMessages] = useState(messages)

  const active = messageThreads.find((t) => t.id === activeId)
  const threadMessages = localMessages.filter((m) => m.threadId === activeId)

  const participantLabel = (t: (typeof messageThreads)[number]) =>
    t.participantNames.find((name) => name !== me.name) ?? t.participantNames[0] ?? 'Patient'

  const send = async () => {
    if (!active || !draft.trim()) return
    const toId = active.participants.find((p) => p !== me.id) ?? ''
    setSending(true)
    await api.sendMessage({ threadId: active.id, fromId: me.id, fromName: me.name, toId, body: draft.trim() })
    setLocalMessages((prev) => [...prev, { id: `m_${Date.now()}`, threadId: active.id, fromId: me.id, fromName: me.name, toId, body: draft.trim(), attachments: [], sentAt: new Date().toISOString(), read: false }])
    setDraft('')
    setSending(false)
  }

  return (
    <div>
      <PageHeader title="Messages" subtitle="Secure conversations with your patients and care team." />

      {myThreads.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No conversations" description="Patient conversations will appear here." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3" style={{ height: 'calc(100vh - 220px)' }}>
          <Card className="flex flex-col overflow-hidden">
            <div className="space-y-1 overflow-y-auto p-2">
              {myThreads.map((t) => (
                <button key={t.id} onClick={() => setActiveId(t.id)} className={cn('flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors', activeId === t.id ? 'bg-primary/5' : 'hover:bg-muted')}>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {participantLabel(t).replace('Dr. ', '').split(' ').map((s) => s[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-semibold">{participantLabel(t)}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{formatTime(t.lastMessage.sentAt)}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{t.subject}</p>
                  </div>
                  {t.unread > 0 && <Badge className="ml-auto mt-1">{t.unread}</Badge>}
                </button>
              ))}
            </div>
          </Card>

          <Card className="flex flex-col overflow-hidden lg:col-span-2">
            <div className="flex items-center gap-3 border-b p-4">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {active ? participantLabel(active).replace('Dr. ', '').split(' ').map((s) => s[0]).join('') : 'T'}
              </div>
              <div>
                <p className="text-sm font-semibold">{active ? participantLabel(active) : 'Thread'}</p>
                <p className="flex items-center gap-1.5 text-[11px] text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Secure channel</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {threadMessages.map((m) => {
                const mine = m.fromId === me.id
                return (
                  <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 text-sm', mine ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-muted')}>
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className={cn('mt-1 text-[10px]', mine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{formatTime(m.sentAt)}{mine && ' · ✓✓'}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-end gap-2 border-t p-3">
              <Textarea rows={1} placeholder="Type a secure message..." className="min-h-[44px] resize-none" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
              <Button size="icon" onClick={send} disabled={sending || !draft.trim()}><Send /></Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
