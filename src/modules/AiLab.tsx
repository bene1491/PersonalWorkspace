import { useState } from 'react'
import { BotMessageSquare, MessageSquareText, Plus } from 'lucide-react'
import { EmptyState, InfoCard, Notice, Pill, SectionHeading } from '../components/ui'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useUndoableRemove } from '../hooks/useUndoableRemove'

interface PromptEntry { id: string; title: string; body: string; context: string; createdAt: string }

export function AiLab() {
  const [prompts, setPrompts] = useLocalStorage<PromptEntry[]>('personal-workspace.prompts.v1', [])
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [context, setContext] = useState('Allgemein')
  const removePrompt = useUndoableRemove(prompts, setPrompts)
  function addPrompt(event: React.FormEvent) { event.preventDefault(); if (!title.trim() || !body.trim()) return; setPrompts((items) => [{ id: crypto.randomUUID(), title: title.trim(), body: body.trim(), context, createdAt: new Date().toISOString() }, ...items]); setTitle(''); setBody(''); setContext('Allgemein'); setEditing(false) }
  return <>
    <SectionHeading eyebrow="KI-Workspace" title="AI Lab" description="Prompts und wiederverwendbare Workflows – ohne aktive Anbieter- oder API-Verbindung." action={<button className="button button-primary" onClick={() => setEditing(!editing)}><Plus size={16} /> Prompt anlegen</button>} />
    <Notice title="Kein externer KI-Dienst verbunden" variant="secure">Es werden keine API-Keys abgefragt, keine Chats versendet und keine persönlichen Daten übertragen. Die Bachelorarbeit ist dauerhaft von jedem künftigen Kontext ausgeschlossen.</Notice>
    {editing && <form className="task-form" onSubmit={addPrompt}><div className="form-grid"><label>Name<input value={title} onChange={(event) => setTitle(event.target.value)} autoFocus placeholder="z. B. Wochenplanung" /></label><label>Vorgesehener Kontext<select value={context} onChange={(event) => setContext(event.target.value)}><option>Allgemein</option><option>Finanzen</option><option>Music Studio</option><option>Studium</option></select></label></div><label className="full-form-label">Prompt<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={3} placeholder="Dein wiederverwendbarer Prompt …" /></label><div className="form-actions"><button type="button" className="button button-ghost" onClick={() => setEditing(false)}>Abbrechen</button><button className="button button-primary">Lokal speichern</button></div></form>}
    <div className="content-grid"><InfoCard title="Assistent" className="span-7"><div className="ai-empty"><BotMessageSquare size={28} /><div><Pill tone="neutral">Offline</Pill><h2>Bereit, aber nicht verbunden</h2><p>Ein austauschbarer Anbieteradapter ist vorgesehen. Bis du einen Dienst bewusst einrichtest, werden keine Unterhaltungen simuliert oder gesendet.</p></div></div></InfoCard><InfoCard title="Kontextschutz" className="span-5"><div className="context-items"><div><span>01</span><p>Nur von der App verwaltete Daten wären auswählbar.</p></div><div><span>02</span><p>Keine Ordnersuche, kein Retrieval und keine Embeddings.</p></div><div><span>03</span><p>Bachelorarbeitsmaterial bleibt grundsätzlich ausgeschlossen.</p></div></div></InfoCard></div>
    <InfoCard title="Prompt-Bibliothek" className="lower-grid">{prompts.length ? <div className="prompt-grid">{prompts.map((prompt) => <article key={prompt.id}><Pill tone="accent">{prompt.context}</Pill><strong>{prompt.title}</strong><p>{prompt.body}</p><button onClick={() => removePrompt((item) => item.id === prompt.id, 'Prompt')}>Löschen</button></article>)}</div> : <EmptyState title="Noch keine Prompts" icon={<MessageSquareText size={21} />}>Erstelle eine lokale Vorlage. Sie wird erst bei einer späteren, expliziten Anbieter-Verbindung nutzbar.</EmptyState>}</InfoCard>
  </>
}
