import { useMemo, useState } from 'react'
import {
  AudioLines,
  BookOpenCheck,
  BotMessageSquare,
  ChevronRight,
  FileLock2,
  FilePlus2,
  FolderLock,
  GraduationCap,
  ListMusic,
  MessageSquareText,
  PanelTop,
  Plus,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Workflow,
} from 'lucide-react'
import { EmptyState, InfoCard, Notice, Pill, SectionHeading } from '../components/ui'
import { courses, workflowCards } from '../data/demo'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface StudioEntry { id: string; title: string; status: string; bpm?: string; key?: string; genre?: string; note?: string; createdAt: string }
interface PromptEntry { id: string; title: string; body: string; context: string; createdAt: string }

export function MusicStudio() {
  const [entries, setEntries] = useLocalStorage<StudioEntry[]>('personal-workspace.music-entries.v1', [])
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [bpm, setBpm] = useState('')
  const [keyName, setKeyName] = useState('')
  const [genre, setGenre] = useState('')
  const [note, setNote] = useState('')
  function saveEntry(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    setEntries((items) => [{ id: crypto.randomUUID(), title: title.trim(), status: 'Idee', bpm, key: keyName, genre, note, createdAt: new Date().toISOString() }, ...items])
    setTitle(''); setBpm(''); setKeyName(''); setGenre(''); setNote(''); setCreateOpen(false)
  }
  return <>
    <SectionHeading eyebrow="Produktion" title="Music Studio" description="Organisiere eigene Notizen und Songideen – ohne Zugriff auf Audio, DAW-Projekte oder Musikordner." action={<button className="button button-primary" onClick={() => setCreateOpen(!createOpen)}><Plus size={16} /> Songidee anlegen</button>} />
    <Notice title="Originale bleiben unberührt" variant="secure">Diese Version liest, analysiert, verschiebt oder verändert keine Musikdateien und kennt keine lokalen Musikpfade.</Notice>
    {createOpen && <form className="task-form" onSubmit={saveEntry}><div className="form-grid studio-form-grid"><label>Songidee<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Arbeitstitel" /></label><label>BPM<input value={bpm} inputMode="numeric" onChange={(event) => setBpm(event.target.value)} placeholder="z. B. 124" /></label><label>Tonart<input value={keyName} onChange={(event) => setKeyName(event.target.value)} placeholder="z. B. F# minor" /></label><label>Genre<input value={genre} onChange={(event) => setGenre(event.target.value)} placeholder="z. B. Electronic" /></label></div><label className="full-form-label">Produktionsnotiz<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Skizze, Arrangement-Idee oder nächste Schritte" rows={2} /></label><div className="form-actions"><button type="button" className="button button-ghost" onClick={() => setCreateOpen(false)}>Abbrechen</button><button className="button button-primary">Lokal speichern</button></div></form>}
    <div className="studio-stat-grid"><InfoCard><ListMusic size={19} /><strong>{entries.length}</strong><span>lokale Songideen</span></InfoCard><InfoCard><AudioLines size={19} /><strong>0</strong><span>analysierte Exporte</span></InfoCard><InfoCard><SlidersHorizontal size={19} /><strong>0</strong><span>verknüpfte Presets</span></InfoCard></div>
    <div className="content-grid"><InfoCard title="Songbibliothek" className="span-8">{entries.length ? <div className="studio-entries">{entries.map((entry) => <article key={entry.id}><div className="song-avatar">{entry.title.slice(0, 1).toUpperCase()}</div><div><strong>{entry.title}</strong><span>{[entry.status, entry.bpm && `${entry.bpm} BPM`, entry.key, entry.genre].filter(Boolean).join(' · ')}</span>{entry.note && <small>{entry.note}</small>}</div><button onClick={() => setEntries((items) => items.filter((item) => item.id !== entry.id))}>Entfernen</button></article>)}</div> : <EmptyState title="Deine Bibliothek ist bereit" icon={<ListMusic size={22} />}>Lege eine Songidee an. Sie wird als lokaler Workspace-Eintrag gespeichert, nie als Datei in deinem Musikordner.</EmptyState>}</InfoCard><InfoCard title="Audioexport-Analyse" className="span-4"><EmptyState title="Nicht aktiviert" icon={<AudioLines size={22} />}>Peak, Clipping, Loudness, Dynamik und Stereo-Breite sind als spätere, rein lesende Analyse vorbereitet. Es wurde kein Audio verarbeitet.</EmptyState></InfoCard></div>
    <div className="content-grid lower-grid"><InfoCard title="Produktion-Checkliste" className="span-6"><div className="checklist"><label><input type="checkbox" /> Arrangement prüfen</label><label><input type="checkbox" /> Vocal-Comp dokumentieren</label><label><input type="checkbox" /> Referenzvergleich machen</label></div></InfoCard><InfoCard title="Mix & Master" className="span-6"><EmptyState title="Keine Versionen erfasst" icon={<SlidersHorizontal size={20} />}>Versionen können künftig als reine Metadaten gepflegt werden. Keine Audioexporte werden hier erzeugt oder überschrieben.</EmptyState></InfoCard></div>
  </>
}

export function Study() {
  return <>
    <SectionHeading eyebrow="Lernen" title="Uni & Studium" description="Eine lokale Lernzentrale für selbst angelegte Kurse, Notizen und Aufgaben." />
    <Notice title="Dauerhafte Schutzgrenze" variant="secure">Die Bachelorarbeit ist nicht verfügbar und kann weder über diese Oberfläche noch über zukünftige Freigaben eingebunden werden.</Notice>
    <div className="content-grid"><InfoCard title="Kurse & Module" className="span-8"><div className="course-list">{courses.map((course) => <article key={course.code}><div className="course-code">{course.code}</div><div><strong>{course.title}</strong><small>Beispieldaten · {course.status}</small></div><div className="progress-line"><span style={{ width: `${course.progress}%` }} /></div><span>{course.progress}%</span><ChevronRight size={17} /></article>)}</div></InfoCard><InfoCard title="Lernfortschritt" className="span-4"><EmptyState title="Noch keine Lernziele" icon={<GraduationCap size={21} />}>Lege später eigene Kurse und Meilensteine an. Diese Ansicht hat keinen Zugriff auf Uni-Ordner.</EmptyState></InfoCard></div>
    <div className="content-grid lower-grid"><InfoCard title="Lernwerkzeuge" className="span-7"><div className="tool-cards"><div><BookOpenCheck size={19} /><strong>Karteikarten & Quiz</strong><p>Für selbst erstellte Lerninhalte vorbereitet.</p><Pill>Geplant</Pill></div><div><FileLock2 size={19} /><strong>PDF-Assistent</strong><p>Benötigt künftig eine konkrete, lesende Freigabe pro Datei.</p><Pill>Deaktiviert</Pill></div></div></InfoCard><InfoCard title="Deadlines" className="span-5"><EmptyState title="Keine App-Deadlines" icon={<PanelTop size={20} />}>Eigene Studienaufgaben kannst du im Planungsbereich anlegen.</EmptyState></InfoCard></div>
  </>
}

export function Documents() {
  const [categories, setCategories] = useLocalStorage<string[]>('personal-workspace.document-categories.v1', [])
  const [category, setCategory] = useState('')
  return <>
    <SectionHeading eyebrow="Lokale Architektur" title="Dateien & Dokumente" description="Ein sicherer Ausgangspunkt für spätere, explizit freigegebene, rein lesende Verzeichnisse." />
    <Notice title="Kein Dateisystemzugriff aktiv" variant="secure">Die Bibliothek durchsucht keinen Mac, zeigt keine realen lokalen Pfade und kann keine Dateien verändern.</Notice>
    <div className="content-grid"><InfoCard className="span-8" title="Dokumentbibliothek"><EmptyState title="Noch keine freigegebenen Quellen" icon={<FolderLock size={23} />}>Eine spätere Verbindung darf nur einen konkret gewählten Ordner lesen. Indizes und Metadaten würden getrennt von Originalen gespeichert.</EmptyState></InfoCard><InfoCard className="span-4" title="Berechtigungsmodell"><div className="permission-list"><div><ShieldCheck size={17} /><span><strong>Freigaben</strong><small>Keine aktiv</small></span></div><div><FileLock2 size={17} /><span><strong>Bachelorarbeit</strong><small>Permanent ausgeschlossen</small></span></div><div><RefreshCw size={17} /><span><strong>Indexer</strong><small>Nicht aktiv</small></span></div></div></InfoCard></div>
    <div className="content-grid lower-grid"><InfoCard className="span-6" title="Kategorien"><form className="watchlist-form" onSubmit={(event) => { event.preventDefault(); const name = category.trim(); if (name && !categories.includes(name)) setCategories((items) => [...items, name]); setCategory('') }}><input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Lokale Kategorie anlegen" /><button className="button button-ghost">Anlegen</button></form>{categories.length ? <div className="tag-list">{categories.map((item) => <button key={item} onClick={() => setCategories((items) => items.filter((current) => current !== item))}>{item} ×</button>)}</div> : <p className="small-status">Kategorien gelten nur für später in der App vorhandene Einträge.</p>}</InfoCard><InfoCard className="span-6" title="Lokale Indexierung"><EmptyState title="Vorbereitet, aber ausgeschaltet" icon={<FilePlus2 size={21} />}>Bei einer späteren Freigabe wäre die Integration ausschließlich lesend, konkret begrenzt und ohne automatische Ordnererkennung.</EmptyState></InfoCard></div>
  </>
}

export function AiLab() {
  const [prompts, setPrompts] = useLocalStorage<PromptEntry[]>('personal-workspace.prompts.v1', [])
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [context, setContext] = useState('Allgemein')
  function addPrompt(event: React.FormEvent) { event.preventDefault(); if (!title.trim() || !body.trim()) return; setPrompts((items) => [{ id: crypto.randomUUID(), title: title.trim(), body: body.trim(), context, createdAt: new Date().toISOString() }, ...items]); setTitle(''); setBody(''); setContext('Allgemein'); setEditing(false) }
  return <>
    <SectionHeading eyebrow="KI-Workspace" title="AI Lab" description="Prompts und wiederverwendbare Workflows – ohne aktive Anbieter- oder API-Verbindung." action={<button className="button button-primary" onClick={() => setEditing(!editing)}><Plus size={16} /> Prompt anlegen</button>} />
    <Notice title="Kein externer KI-Dienst verbunden" variant="secure">Es werden keine API-Keys abgefragt, keine Chats versendet und keine persönlichen Daten übertragen. Die Bachelorarbeit ist dauerhaft von jedem künftigen Kontext ausgeschlossen.</Notice>
    {editing && <form className="task-form" onSubmit={addPrompt}><div className="form-grid"><label>Name<input value={title} onChange={(event) => setTitle(event.target.value)} autoFocus placeholder="z. B. Wochenplanung" /></label><label>Vorgesehener Kontext<select value={context} onChange={(event) => setContext(event.target.value)}><option>Allgemein</option><option>Finanzen</option><option>Music Studio</option><option>Studium</option></select></label></div><label className="full-form-label">Prompt<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={3} placeholder="Dein wiederverwendbarer Prompt …" /></label><div className="form-actions"><button type="button" className="button button-ghost" onClick={() => setEditing(false)}>Abbrechen</button><button className="button button-primary">Lokal speichern</button></div></form>}
    <div className="content-grid"><InfoCard title="Assistent" className="span-7"><div className="ai-empty"><BotMessageSquare size={28} /><div><Pill tone="neutral">Offline</Pill><h2>Bereit, aber nicht verbunden</h2><p>Ein austauschbarer Anbieteradapter ist vorgesehen. Bis du einen Dienst bewusst einrichtest, werden keine Unterhaltungen simuliert oder gesendet.</p></div></div></InfoCard><InfoCard title="Kontextschutz" className="span-5"><div className="context-items"><div><span>01</span><p>Nur von der App verwaltete Daten wären auswählbar.</p></div><div><span>02</span><p>Keine Ordnersuche, kein Retrieval und keine Embeddings.</p></div><div><span>03</span><p>Bachelorarbeitsmaterial bleibt grundsätzlich ausgeschlossen.</p></div></div></InfoCard></div>
    <InfoCard title="Prompt-Bibliothek" className="lower-grid">{prompts.length ? <div className="prompt-grid">{prompts.map((prompt) => <article key={prompt.id}><Pill tone="accent">{prompt.context}</Pill><strong>{prompt.title}</strong><p>{prompt.body}</p><button onClick={() => setPrompts((items) => items.filter((item) => item.id !== prompt.id))}>Löschen</button></article>)}</div> : <EmptyState title="Noch keine Prompts" icon={<MessageSquareText size={21} />}>Erstelle eine lokale Vorlage. Sie wird erst bei einer späteren, expliziten Anbieter-Verbindung nutzbar.</EmptyState>}</InfoCard>
  </>
}

export function Automations() {
  return <>
    <SectionHeading eyebrow="Workflow-Katalog" title="Automatisierungen" description="Übersicht zukünftiger Abläufe. Keine Karte startet Prozesse, Timer oder Dateisystemaktionen." />
    <Notice title="Alle Workflows sind inaktiv" variant="secure">Es laufen keine Hintergrunddienste, Scheduler oder automatischen Dateivorgänge – weder jetzt noch nach dem Schließen der Anwendung.</Notice>
    <div className="workflow-grid">{workflowCards.map((workflow) => <InfoCard key={workflow.title} className="workflow-card"><div className="workflow-icon"><Workflow size={19} /></div><Pill>Entwurf</Pill><h2>{workflow.title}</h2><p>{workflow.description}</p><div className="workflow-bottom"><span><span className="connection-dot" /> Nicht aktiv</span><button disabled>Konfigurieren</button></div></InfoCard>)}</div>
    <InfoCard title="Ausführungshistorie" className="lower-grid"><EmptyState title="Noch keine Ausführungen" icon={<RefreshCw size={21} />}>Workflow-Aktivität wird erst sichtbar, wenn du zukünftig eine konkrete Automatisierung bewusst aktivierst.</EmptyState></InfoCard>
  </>
}

export function Settings({ theme, onToggleTheme, location, onLocationChange }: { theme: 'dark' | 'light'; onToggleTheme: () => void; location: string; onLocationChange: (value: string) => void }) {
  const [compact, setCompact] = useLocalStorage<boolean>('personal-workspace.compact-mode.v1', false)
  const [locationDraft, setLocationDraft] = useState(location)
  useMemo(() => { document.documentElement.dataset.density = compact ? 'compact' : 'comfortable' }, [compact])
  function submitLocation(event: React.FormEvent) {
    event.preventDefault()
    const cleaned = locationDraft.trim()
    if (cleaned) onLocationChange(cleaned)
  }
  return <>
    <SectionHeading eyebrow="Kontrolle & Transparenz" title="Einstellungen & Verbindungen" description="Lokale Darstellung, Datenstatus und feste Sicherheitsgrenzen." />
    <div className="settings-layout"><div><InfoCard title="Darstellung"><div className="settings-row"><div><strong>Erscheinungsbild</strong><small>{theme === 'dark' ? 'Dunkelmodus ist aktiv' : 'Hellmodus ist aktiv'}</small></div><button className="button button-ghost" onClick={onToggleTheme}>{theme === 'dark' ? 'Hellmodus nutzen' : 'Dunkelmodus nutzen'}</button></div><div className="settings-row"><div><strong>Kompakte Dichte</strong><small>Reduziert vertikale Abstände in Tabellen und Listen.</small></div><button className={`toggle ${compact ? 'on' : ''}`} role="switch" aria-checked={compact} onClick={() => setCompact(!compact)}><span /></button></div><form className="settings-row location-form" onSubmit={submitLocation}><div><strong>Ort für Wetterdaten</strong><small>Wird für den öffentlichen Open-Meteo-Abruf im Command Center verwendet.</small></div><div className="location-inputs"><input value={locationDraft} onChange={(event) => setLocationDraft(event.target.value)} placeholder="z. B. Hamburg" aria-label="Ort für Wetterdaten" /><button className="button button-ghost" type="submit">Übernehmen</button></div></form></InfoCard><InfoCard title="Datenquellen" className="lower-grid"><div className="source-list"><div><span className="connection-dot ready" /><span><strong>CoinGecko (öffentlich)</strong><small>Optionaler, browserseitiger Kursabruf für Kryptowährungen.</small></span><Pill tone="positive">Verfügbar</Pill></div><div><span className="connection-dot ready" /><span><strong>Open-Meteo (öffentlich)</strong><small>Optionaler, browserseitiger Wetterabruf für „{location}“.</small></span><Pill tone="positive">Verfügbar</Pill></div><div><span className="connection-dot" /><span><strong>Dateien & Dokumente</strong><small>Keine lokalen Verzeichnisse freigegeben.</small></span><Pill>Nicht verbunden</Pill></div><div><span className="connection-dot" /><span><strong>KI-Anbieter</strong><small>Keine API-Keys und keine Gespräche übertragen.</small></span><Pill>Nicht verbunden</Pill></div></div></InfoCard></div><div><InfoCard title="Datenschutz"><div className="privacy-list"><div><ShieldCheck size={18} /><p><strong>Workspace-Daten</strong> werden im LocalStorage dieses Browsers gespeichert.</p></div><div><FolderLock size={18} /><p><strong>Dateisystem</strong> wird nicht gescannt oder bearbeitet.</p></div><div><FileLock2 size={18} /><p><strong>Bachelorarbeit</strong> bleibt als feste Sperrzone von jeder Integration ausgeschlossen.</p></div></div></InfoCard><InfoCard title="Anwendung" className="lower-grid"><div className="version-row"><span>Version</span><strong>Personal Workspace v0.1</strong></div><div className="version-row"><span>Speicherort</span><strong>Browser LocalStorage</strong></div><div className="version-row"><span>Netzwerk</span><strong>Nur optionale, öffentliche Datenabrufe</strong></div></InfoCard></div></div>
  </>
}
