import { useState } from 'react'
import { AudioLines, ListMusic, Plus, SlidersHorizontal } from 'lucide-react'
import { Metronome } from '../components/Metronome'
import { EmptyState, InfoCard, Notice, SectionHeading } from '../components/ui'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useUndoableRemove } from '../hooks/useUndoableRemove'

interface StudioEntry { id: string; title: string; status: string; bpm?: string; key?: string; genre?: string; note?: string; createdAt: string }

export function MusicStudio() {
  const [entries, setEntries] = useLocalStorage<StudioEntry[]>('personal-workspace.music-entries.v1', [])
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [bpm, setBpm] = useState('')
  const [keyName, setKeyName] = useState('')
  const [genre, setGenre] = useState('')
  const [note, setNote] = useState('')
  const removeEntry = useUndoableRemove(entries, setEntries)

  function saveEntry(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    setEntries((items) => [{ id: crypto.randomUUID(), title: title.trim(), status: 'Idee', bpm, key: keyName, genre, note, createdAt: new Date().toISOString() }, ...items])
    setTitle(''); setBpm(''); setKeyName(''); setGenre(''); setNote(''); setCreateOpen(false)
  }

  function applyBpmFromMetronome(value: number) {
    setBpm(String(value))
    setCreateOpen(true)
  }

  return <>
    <SectionHeading eyebrow="Produktion" title="Music Studio" description="Organisiere eigene Notizen und Songideen – ohne Zugriff auf Audio, DAW-Projekte oder Musikordner." action={<button className="button button-primary" onClick={() => setCreateOpen(!createOpen)}><Plus size={16} /> Songidee anlegen</button>} />
    <Notice title="Originale bleiben unberührt" variant="secure">Diese Version liest, analysiert, verschiebt oder verändert keine Musikdateien und kennt keine lokalen Musikpfade.</Notice>
    {createOpen && <form className="task-form" onSubmit={saveEntry}><div className="form-grid studio-form-grid"><label>Songidee<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Arbeitstitel" /></label><label>BPM<input value={bpm} inputMode="numeric" onChange={(event) => setBpm(event.target.value)} placeholder="z. B. 124" /></label><label>Tonart<input value={keyName} onChange={(event) => setKeyName(event.target.value)} placeholder="z. B. F# minor" /></label><label>Genre<input value={genre} onChange={(event) => setGenre(event.target.value)} placeholder="z. B. Electronic" /></label></div><label className="full-form-label">Produktionsnotiz<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Skizze, Arrangement-Idee oder nächste Schritte" rows={2} /></label><div className="form-actions"><button type="button" className="button button-ghost" onClick={() => setCreateOpen(false)}>Abbrechen</button><button className="button button-primary">Lokal speichern</button></div></form>}
    <div className="studio-stat-grid"><InfoCard><ListMusic size={19} /><strong>{entries.length}</strong><span>lokale Songideen</span></InfoCard><InfoCard><AudioLines size={19} /><strong>0</strong><span>analysierte Exporte</span></InfoCard><InfoCard><SlidersHorizontal size={19} /><strong>0</strong><span>verknüpfte Presets</span></InfoCard></div>
    <div className="content-grid"><InfoCard title="Songbibliothek" className="span-8">{entries.length ? <div className="studio-entries">{entries.map((entry) => <article key={entry.id}><div className="song-avatar">{entry.title.slice(0, 1).toUpperCase()}</div><div><strong>{entry.title}</strong><span>{[entry.status, entry.bpm && `${entry.bpm} BPM`, entry.key, entry.genre].filter(Boolean).join(' · ')}</span>{entry.note && <small>{entry.note}</small>}</div><button onClick={() => removeEntry((item) => item.id === entry.id, `Songidee „${entry.title}“`)}>Entfernen</button></article>)}</div> : <EmptyState title="Deine Bibliothek ist bereit" icon={<ListMusic size={22} />}>Lege eine Songidee an. Sie wird als lokaler Workspace-Eintrag gespeichert, nie als Datei in deinem Musikordner.</EmptyState>}</InfoCard><InfoCard title="Audioexport-Analyse" className="span-4"><EmptyState title="Nicht aktiviert" icon={<AudioLines size={22} />}>Peak, Clipping, Loudness, Dynamik und Stereo-Breite sind als spätere, rein lesende Analyse vorbereitet. Es wurde kein Audio verarbeitet.</EmptyState></InfoCard></div>
    <div className="content-grid lower-grid">
      <Metronome onApplyBpm={applyBpmFromMetronome} />
      <InfoCard title="Produktion-Checkliste" className="span-6"><div className="checklist"><label><input type="checkbox" /> Arrangement prüfen</label><label><input type="checkbox" /> Vocal-Comp dokumentieren</label><label><input type="checkbox" /> Referenzvergleich machen</label></div></InfoCard>
    </div>
    <div className="content-grid lower-grid"><InfoCard title="Mix & Master"><EmptyState title="Keine Versionen erfasst" icon={<SlidersHorizontal size={20} />}>Versionen können künftig als reine Metadaten gepflegt werden. Keine Audioexporte werden hier erzeugt oder überschrieben.</EmptyState></InfoCard></div>
  </>
}
